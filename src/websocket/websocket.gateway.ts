import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface User {
  id: string;
  name: string;
  image?: string;
  isMentor: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  isMentor: boolean;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'file';
  fileUrl?: string;
  fileName?: string;
}

interface WebRTCSignal {
  roomId: string;
  targetUserId: string;
  signal: any;
  type: 'offer' | 'answer' | 'ice_candidate';
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/mentoring',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WebsocketGateway');
  private rooms = new Map<string, Set<string>>(); // roomId -> Set of socketIds
  private users = new Map<string, User>(); // socketId -> User
  private messages = new Map<string, ChatMessage[]>(); // roomId -> Messages

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    const user = this.users.get(client.id);
    if (user) {
      // 방에서 사용자 제거
      for (const [roomId, socketIds] of this.rooms.entries()) {
        if (socketIds.has(client.id)) {
          socketIds.delete(client.id);
          
          // 방의 다른 사용자들에게 사용자 나감 알림
          client.to(roomId).emit('user_left', user.id);
          
          // 시스템 메시지 추가
          this.addSystemMessage(roomId, `${user.name}님이 나갔습니다.`);
          
          // 방이 비어있으면 방 삭제
          if (socketIds.size === 0) {
            this.rooms.delete(roomId);
            this.messages.delete(roomId);
          }
          break;
        }
      }
      
      this.users.delete(client.id);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { roomId: string; userData: User },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userData } = data;
    
    // 사용자 정보 저장
    this.users.set(client.id, { ...userData, id: userData.id });
    
    // 방에 참여
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
      this.messages.set(roomId, []);
    }
    
    const room = this.rooms.get(roomId);
    room.add(client.id);
    client.join(roomId);
    
    this.logger.log(`User ${userData.name} joined room ${roomId}`);
    
    // 방의 기존 메시지 전송
    const existingMessages = this.messages.get(roomId) || [];
    client.emit('messages', existingMessages);
    
    // 방의 기존 사용자 목록 전송
    const roomUsers = Array.from(room)
      .map(socketId => this.users.get(socketId))
      .filter(Boolean);
    client.emit('users', roomUsers);
    
    // 다른 사용자들에게 새 사용자 참여 알림
    client.to(roomId).emit('user_joined', { ...userData, isConnected: true });
    
    // 시스템 메시지 추가
    this.addSystemMessage(roomId, `${userData.name}님이 참여했습니다.`);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    const user = this.users.get(client.id);
    
    if (user) {
      client.to(roomId).emit('user_left', user.id);
      this.addSystemMessage(roomId, `${user.name}님이 나갔습니다.`);
    }
    
    client.leave(roomId);
    this.logger.log(`User left room ${roomId}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: Omit<ChatMessage, 'id' | 'timestamp'>,
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.users.get(client.id);
    if (!user) return;
    
    // 현재 사용자가 속한 방 찾기
    let currentRoomId: string | null = null;
    for (const [roomId, socketIds] of this.rooms.entries()) {
      if (socketIds.has(client.id)) {
        currentRoomId = roomId;
        break;
      }
    }
    
    if (!currentRoomId) return;
    
    const message: ChatMessage = {
      ...data,
      id: Date.now().toString(),
      timestamp: new Date(),
      userId: user.id,
      userName: user.name,
      userImage: user.image,
      isMentor: user.isMentor,
    };
    
    // 메시지 저장
    const roomMessages = this.messages.get(currentRoomId) || [];
    roomMessages.push(message);
    this.messages.set(currentRoomId, roomMessages);
    
    // 방의 모든 사용자에게 메시지 전송
    this.server.to(currentRoomId).emit('message', message);
    
    this.logger.log(`Message sent in room ${currentRoomId}: ${message.message}`);
  }

  @SubscribeMessage('webrtc_signal')
  handleWebRTCSignal(
    @MessageBody() data: WebRTCSignal,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, targetUserId, signal, type } = data;
    
    // 대상 사용자의 소켓 ID 찾기
    let targetSocketId: string | null = null;
    for (const [socketId, user] of this.users.entries()) {
      if (user.id === targetUserId) {
        targetSocketId = socketId;
        break;
      }
    }
    
    if (targetSocketId) {
      // 대상 사용자에게 시그널 전달
      this.server.to(targetSocketId).emit('webrtc_signal', {
        roomId,
        targetUserId: this.users.get(client.id)?.id,
        signal,
        type,
      });
    }
  }

  @SubscribeMessage('stream_ready')
  handleStreamReady(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    const user = this.users.get(client.id);
    
    if (user) {
      // 방의 다른 사용자들에게 스트림 준비 알림
      client.to(roomId).emit('stream_ready', user);
    }
  }

  private addSystemMessage(roomId: string, message: string) {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: '시스템',
      isMentor: false,
      message,
      timestamp: new Date(),
      type: 'system',
    };
    
    const roomMessages = this.messages.get(roomId) || [];
    roomMessages.push(systemMessage);
    this.messages.set(roomId, roomMessages);
    
    // 방의 모든 사용자에게 시스템 메시지 전송
    this.server.to(roomId).emit('message', systemMessage);
  }
}

