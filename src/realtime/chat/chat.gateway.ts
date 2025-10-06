import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto, JoinRoomDto, LeaveRoomDto } from './dto/chat-message.dto';

interface ChatUser {
  id: string;
  name: string;
  image?: string;
  isMentor: boolean;
  socketId: string;
  roomId: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  isMentor: boolean;
  message: string;
  type: 'text' | 'system' | 'file';
  fileUrl?: string;
  fileName?: string;
  timestamp: Date;
  roomId: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly rooms = new Map<string, Set<string>>(); // roomId -> socketIds
  private readonly users = new Map<string, ChatUser>(); // socketId -> User
  private readonly messages = new Map<string, ChatMessage[]>(); // roomId -> Messages

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    const user = this.users.get(client.id);
    if (user) {
      // Notify room members about user disconnection
      this.server.to(user.roomId).emit('user_disconnected', {
        userId: user.id,
        userName: user.name,
        socketId: client.id,
      });

      // Clean up room membership
      const roomMembers = this.rooms.get(user.roomId);
      if (roomMembers) {
        roomMembers.delete(client.id);
        if (roomMembers.size === 0) {
          this.rooms.delete(user.roomId);
          this.messages.delete(user.roomId);
        }
      }

      // Remove user from tracking
      this.users.delete(client.id);
    }
  }

  @SubscribeMessage('user_connected')
  handleUserConnected(
    @MessageBody() dto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, userName, userImage, isMentor } = dto;
    
    // Join room
    client.join(roomId);
    
    // Track user
    const user: ChatUser = {
      id: userId,
      name: userName,
      image: userImage,
      isMentor,
      socketId: client.id,
      roomId,
    };
    this.users.set(client.id, user);
    
    // Track room membership
    const roomMembers = this.rooms.get(roomId) ?? new Set<string>();
    roomMembers.add(client.id);
    this.rooms.set(roomId, roomMembers);
    
    // Initialize messages for room if not exists
    if (!this.messages.has(roomId)) {
      this.messages.set(roomId, []);
    }
    
    // Get current room users
    const currentUsers = Array.from(this.users.values())
      .filter(u => u.roomId === roomId)
      .map(u => ({
        id: u.id,
        name: u.name,
        image: u.image,
        isMentor: u.isMentor,
        isConnected: true,
      }));
    
    // Notify room about new user
    this.server.to(roomId).emit('user_connected', {
      userId,
      userName,
      userImage,
      isMentor,
      socketId: client.id,
    });
    
    // Send current users list to the new user
    client.emit('users_list', currentUsers);
    
    // Send message history to the new user
    const roomMessages = this.messages.get(roomId) || [];
    client.emit('messages_history', roomMessages);
    
    this.logger.log(`User ${userName} (${userId}) connected to room ${roomId}`);
  }

  @SubscribeMessage('user_disconnected')
  handleUserDisconnected(
    @MessageBody() dto: LeaveRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId } = dto;
    
    const user = this.users.get(client.id);
    if (user && user.roomId === roomId) {
      // Leave room
      client.leave(roomId);
      
      // Notify room members
      this.server.to(roomId).emit('user_disconnected', {
        userId: user.id,
        userName: user.name,
        socketId: client.id,
      });
      
      // Clean up room membership
      const roomMembers = this.rooms.get(roomId);
      if (roomMembers) {
        roomMembers.delete(client.id);
        if (roomMembers.size === 0) {
          this.rooms.delete(roomId);
          this.messages.delete(roomId);
        }
      }
      
      // Remove user from tracking
      this.users.delete(client.id);
      
      this.logger.log(`User ${user.name} (${userId}) disconnected from room ${roomId}`);
    }
  }

  @SubscribeMessage('new_message')
  handleNewMessage(
    @MessageBody() dto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, userName, userImage, isMentor, message, type = 'text', fileUrl, fileName } = dto;
    
    const user = this.users.get(client.id);
    if (!user || user.roomId !== roomId) {
      this.logger.warn(`User ${client.id} not found in room ${roomId}`);
      return;
    }
    
    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      userId,
      userName,
      userImage,
      isMentor,
      message,
      type,
      fileUrl,
      fileName,
      timestamp: new Date(),
      roomId,
    };
    
    // Store message
    const roomMessages = this.messages.get(roomId) || [];
    roomMessages.push(chatMessage);
    this.messages.set(roomId, roomMessages);
    
    // Broadcast to room
    this.server.to(roomId).emit('new_message', chatMessage);
    
    this.logger.log(`Message sent in room ${roomId} by ${userName}: ${message}`);
  }

  @SubscribeMessage('broadcast_message')
  handleBroadcastMessage(
    @MessageBody() dto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, userName, userImage, isMentor, message, type = 'text', fileUrl, fileName } = dto;
    
    const user = this.users.get(client.id);
    if (!user || user.roomId !== roomId) {
      this.logger.warn(`User ${client.id} not found in room ${roomId}`);
      return;
    }
    
    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      userId,
      userName,
      userImage,
      isMentor,
      message,
      type,
      fileUrl,
      fileName,
      timestamp: new Date(),
      roomId,
    };
    
    // Store message
    const roomMessages = this.messages.get(roomId) || [];
    roomMessages.push(chatMessage);
    this.messages.set(roomId, roomMessages);
    
    // Broadcast to all connected clients (not just room)
    this.server.emit('broadcast_message', chatMessage);
    
    this.logger.log(`Broadcast message sent by ${userName}: ${message}`);
  }

  // Helper method to get room statistics
  getRoomStats(roomId: string) {
    const roomMembers = this.rooms.get(roomId);
    const roomMessages = this.messages.get(roomId);
    
    return {
      roomId,
      memberCount: roomMembers?.size || 0,
      messageCount: roomMessages?.length || 0,
      members: Array.from(this.users.values())
        .filter(u => u.roomId === roomId)
        .map(u => ({
          id: u.id,
          name: u.name,
          isMentor: u.isMentor,
        })),
    };
  }
}


