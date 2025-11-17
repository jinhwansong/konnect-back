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
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '@/entities/user.entity';
import { UserRole } from '@/common/enum/status.enum';
import {
  CreateMessageDto,
  JoinRoomDto,
  LeaveRoomDto,
} from './dto/chat-message.dto';
import * as jwt from 'jsonwebtoken';

export interface ChatUser {
  id: string;
  name: string;
  image?: string;
  isMentor: boolean;
  isConnected?: boolean;
  socketId?: string;
  roomId?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: ChatUser;
  message: string;
  type: 'text' | 'system' | 'file';
  fileUrl?: string;
  fileName?: string;
  createdAt: Date | string;
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

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

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

  // JWT 토큰 검증 및 사용자 정보 조회
  private async verifyTokenAndGetUser(client: Socket): Promise<Users | null> {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        this.logger.warn(`❌ No token provided for socket ${client.id}`);
        return null;
      }

      const publicKey = process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, '\n');
      const decoded = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
      }) as jwt.JwtPayload & { id: string };

      const user = await this.usersRepository.findOne({
        where: { id: decoded.sub },
      });

      if (!user) {
        this.logger.warn(`❌ User not found for id ${decoded.id}`);
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error(`❌ Token verification failed: ${error.message}`);
      return null;
    }
  }

  @SubscribeMessage('user_connected')
  async handleUserConnected(
    @MessageBody() dto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    // JWT 토큰 검증 및 사용자 정보 조회
    const user = await this.verifyTokenAndGetUser(client);

    if (!user) {
      client.emit('join_denied', {
        reason: '인증에 실패했습니다. 다시 로그인해주세요.',
      });
      client.disconnect();
      return;
    }
    const { roomId } = dto;
    const isMentor = user.role === UserRole.MENTOR;

    this.logger.log(
      `user_connected: ${user.name} (${user.id}) [${isMentor ? '멘토' : '멘티'}], socket: ${client.id}`,
    );

    // 기존 연결 정리 (재연결 대비)
    for (const [socketId, existingUser] of this.users.entries()) {
      if (existingUser.id === user.id && existingUser.roomId === roomId) {
        this.logger.warn(
          `🔁 중복 연결 감지: ${user.name}. 기존 소켓 ${socketId} 제거`,
        );

        try {
          const namespace = this.server.of('/chat');
          const oldClient = namespace.sockets.get(socketId);
          oldClient?.leave(roomId);
        } catch (err) {
          this.logger.warn(`기존 소켓 제거 실패 ${socketId}: ${err.message}`);
        }

        this.users.delete(socketId);
      }
    }

    // Join room
    client.join(roomId);

    // Track user
    const chatUser: ChatUser = {
      id: user.id,
      name: user.name,
      image: user.image || undefined,
      isMentor,
      socketId: client.id,
      roomId,
    };
    this.users.set(client.id, chatUser);

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
      .filter((u) => u.roomId === roomId)
      .map((u) => ({
        id: u.id,
        name: u.name,
        image: u.image,
        isMentor: u.isMentor,
        isConnected: true,
      }));

    // Notify room about new user
    this.server.to(roomId).emit('user_connected', {
      userId: user.id,
      userName: user.name,
      userImage: user.image,
      isMentor,
      socketId: client.id,
    });

    // Send current users list to the new user
    client.emit('users_list', currentUsers);
    this.logger.log('📋 현재 접속자 목록:', currentUsers);

    // Send message history to the new user
    const roomMessages = this.messages.get(roomId) || [];
    client.emit('messages_history', roomMessages);

    this.logger.log(`✅ 사용자 ${user.name} (${user.id}) 입장 → 방 ${roomId}`);
  }

  @SubscribeMessage('user_disconnected')
  async handleUserDisconnected(
    @MessageBody() dto: LeaveRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = dto;

    const chatUser = this.users.get(client.id);
    if (chatUser && chatUser.roomId === roomId) {
      // Leave room
      client.leave(roomId);

      // Notify room members
      this.server.to(roomId).emit('user_disconnected', {
        userId: chatUser.id,
        userName: chatUser.name,
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

      this.logger.log(
        `👋 사용자 퇴장: ${chatUser.name} (${chatUser.id}) → 방 ${roomId}`,
      );
    }
  }

  @SubscribeMessage('new_message')
  async handleNewMessage(
    @MessageBody() dto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, message, type = 'text', fileUrl, fileName } = dto;

    // JWT 토큰 검증 및 사용자 정보 조회
    const dbUser = await this.verifyTokenAndGetUser(client);
    if (!dbUser) {
      this.logger.warn(`❌ 인증되지 않은 메시지 전송 시도: ${client.id}`);
      return;
    }

    const chatUser = this.users.get(client.id);
    if (!chatUser || chatUser.roomId !== roomId) {
      this.logger.warn(
        `❌ 방에 없는 사용자의 메시지 전송 시도: ${client.id}, 방: ${roomId}`,
      );
      return;
    }

    const isMentor = dbUser.role === UserRole.MENTOR;

    const sender: ChatUser = {
      id: dbUser.id,
      name: dbUser.name,
      image: dbUser.image || undefined,
      isMentor: dbUser.role === UserRole.MENTOR,
      socketId: client.id,
      roomId,
    };

    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      roomId,
      sender,
      message,
      type,
      fileUrl,
      fileName,
      createdAt: new Date(),
    };

    // Store message
    const roomMessages = this.messages.get(roomId) || [];
    roomMessages.push(chatMessage);
    this.messages.set(roomId, roomMessages);

    // Broadcast to room
    this.server.to(roomId).emit('new_message', chatMessage);

    this.logger.log(
      `💬 메시지 전송 [${isMentor ? '멘토' : '멘티'}] ${dbUser.name}: ${message}`,
    );
  }

  @SubscribeMessage('broadcast_message')
  async handleBroadcastMessage(
    @MessageBody() dto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, message, type = 'text', fileUrl, fileName } = dto;

    // JWT 토큰 검증 및 사용자 정보 조회
    const dbUser = await this.verifyTokenAndGetUser(client);
    if (!dbUser) {
      this.logger.warn(`❌ 인증되지 않은 브로드캐스트 시도: ${client.id}`);
      return;
    }

    const chatUser = this.users.get(client.id);
    if (!chatUser || chatUser.roomId !== roomId) {
      this.logger.warn(
        `❌ 방에 없는 사용자의 브로드캐스트 시도: ${client.id}, 방: ${roomId}`,
      );
      return;
    }

    const isMentor = dbUser.role === UserRole.MENTOR;

    const sender: ChatUser = {
      id: dbUser.id,
      name: dbUser.name,
      image: dbUser.image || undefined,
      isMentor: dbUser.role === UserRole.MENTOR,
      socketId: client.id,
      roomId,
    };

    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      roomId,
      sender,
      message,
      type,
      fileUrl,
      fileName,
      createdAt: new Date(),
    };

    // Store message
    const roomMessages = this.messages.get(roomId) || [];
    roomMessages.push(chatMessage);
    this.messages.set(roomId, roomMessages);

    // Broadcast to all connected clients (not just room)
    this.server.emit('broadcast_message', chatMessage);

    this.logger.log(
      `📢 브로드캐스트 메시지 전송 [${isMentor ? '멘토' : '멘티'}] ${dbUser.name}: ${message}`,
    );
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
        .filter((u) => u.roomId === roomId)
        .map((u) => ({
          id: u.id,
          name: u.name,
          isMentor: u.isMentor,
        })),
    };
  }
}
