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
import {
  WebRTCSignalDto,
  JoinRoomDto,
  LeaveRoomDto,
  StreamReadyDto,
} from './dto/webrtc-signal.dto';

interface WebRTCUser {
  userId: string;
  userName: string;
  userImage?: string;
  isMentor?: boolean;
  roomId: string;
  socketId: string;
  isStreamReady: boolean;
}

@WebSocketGateway({
  cors: {
    origin: [
      'https://surge-lobby-printing-conjunction.trycloudflare.com',
      'http://localhost:3000',
    ],

    credentials: true,
  },
  namespace: '/webrtc',
})
export class WebRTCGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(WebRTCGateway.name);
  private readonly users = new Map<string, WebRTCUser>(); // socketId -> User
  private readonly rooms = new Map<string, Set<string>>(); // roomId -> socketIds

  handleConnection(client: Socket) {
    this.logger.log(`🔌 WebRTC Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`🔌 WebRTC Client disconnected: ${client.id}`);

    const user = this.users.get(client.id);
    if (user) {
      // Notify room members about user leaving
      this.server.to(user.roomId).emit('user_left', {
        userId: user.userId,
        userName: user.userName,
        socketId: client.id,
      });

      // Clean up room membership
      const roomMembers = this.rooms.get(user.roomId);
      if (roomMembers) {
        roomMembers.delete(client.id);
        if (roomMembers.size === 0) {
          this.rooms.delete(user.roomId);
        }
      }

      // Remove user from tracking
      this.users.delete(client.id);
    }
  }

  @SubscribeMessage('user_joined')
  handleUserJoined(
    @MessageBody() dto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, userName, userImage, isMentor } = dto;

    this.logger.log(`👤 User ${userName} (${userId}) joining room ${roomId}`);

    // Join room
    client.join(roomId);

    // Track user
    const user: WebRTCUser = {
      userId,
      userName,
      userImage,
      isMentor,
      roomId,
      socketId: client.id,
      isStreamReady: false,
    };
    this.users.set(client.id, user);

    // Track room membership
    const roomMembers = this.rooms.get(roomId) ?? new Set<string>();
    roomMembers.add(client.id);
    this.rooms.set(roomId, roomMembers);

    // Get current room users
    const currentUsers = Array.from(this.users.values())
      .filter((u) => u.roomId === roomId)
      .map((u) => ({
        id: u.userId,
        name: u.userName,
        image: u.userImage,
        isMentor: u.isMentor,
        isStreamReady: u.isStreamReady,
      }));

    // Notify room about new user
    this.server.to(roomId).emit('user_joined', {
      userId,
      userName,
      userImage,
      isMentor,
      socketId: client.id,
    });

    // Send current users list to the new user
    client.emit('users_list', currentUsers);

    this.logger.log(
      `✅ User ${userName} (${userId}) successfully joined room ${roomId}`,
    );
  }

  @SubscribeMessage('user_left')
  handleUserLeft(
    @MessageBody() dto: LeaveRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId } = dto;

    const user = this.users.get(client.id);
    if (user && user.roomId === roomId) {
      this.logger.log(
        `👋 User ${user.userName} (${userId}) leaving room ${roomId}`,
      );

      // Leave room
      client.leave(roomId);

      // Notify room members
      this.server.to(roomId).emit('user_left', {
        userId: user.userId,
        userName: user.userName,
        socketId: client.id,
      });

      // Clean up room membership
      const roomMembers = this.rooms.get(roomId);
      if (roomMembers) {
        roomMembers.delete(client.id);
        if (roomMembers.size === 0) {
          this.rooms.delete(roomId);
        }
      }

      // Remove user from tracking
      this.users.delete(client.id);

      this.logger.log(
        `✅ User ${user.userName} (${userId}) successfully left room ${roomId}`,
      );
    }
  }

  @SubscribeMessage('stream_ready')
  handleStreamReady(
    @MessageBody() dto: StreamReadyDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId } = dto;

    const user = this.users.get(client.id);
    if (user && user.roomId === roomId) {
      this.logger.log(
        `📹 Stream ready for user ${user.userName} (${userId}) in room ${roomId}`,
      );

      // Update user stream status
      user.isStreamReady = true;
      this.users.set(client.id, user);

      // Notify room members
      this.server.to(roomId).emit('stream_ready', {
        userId,
        userName: user.userName,
        socketId: client.id,
      });

      this.logger.log(
        `✅ Stream ready notification sent for user ${user.userName} (${userId})`,
      );
    }
  }

  @SubscribeMessage('webrtc_signal')
  handleWebRTCSignal(
    @MessageBody() dto: WebRTCSignalDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, targetUserId, signal, type } = dto;

    const sender = this.users.get(client.id);
    if (!sender || sender.roomId !== roomId) {
      this.logger.warn(`⚠️ User ${client.id} not found in room ${roomId}`);
      return;
    }

    this.logger.log(
      `📡 WebRTC ${type} signal from ${sender.userName} (${userId}) to ${targetUserId} in room ${roomId}`,
    );

    // Find target user's socket
    let targetSocketId: string | null = null;
    for (const [socketId, user] of this.users.entries()) {
      if (user.userId === targetUserId && user.roomId === roomId) {
        targetSocketId = socketId;
        break;
      }
    }

    if (targetSocketId) {
      // Send signal to target user
      this.server.to(targetSocketId).emit('webrtc_signal', {
        roomId,
        userId,
        targetUserId,
        signal,
        type,
      });

      this.logger.log(`✅ WebRTC ${type} signal delivered to ${targetUserId}`);
    } else {
      this.logger.warn(
        `⚠️ Target user ${targetUserId} not found in room ${roomId}`,
      );
    }
  }

  @SubscribeMessage('screen_share_started')
  handleScreenShareStarted(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId } = data;

    const user = this.users.get(client.id);
    if (user && user.roomId === roomId) {
      this.logger.log(
        `🖥️ Screen share started by ${user.userName} (${userId}) in room ${roomId}`,
      );

      this.server.to(roomId).emit('screen_share_started', {
        userId,
        userName: user.userName,
      });
    }
  }

  @SubscribeMessage('screen_share_stopped')
  handleScreenShareStopped(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId } = data;

    const user = this.users.get(client.id);
    if (user && user.roomId === roomId) {
      this.logger.log(
        `🖥️ Screen share stopped by ${user.userName} (${userId}) in room ${roomId}`,
      );

      this.server.to(roomId).emit('screen_share_stopped', {
        userId,
        userName: user.userName,
      });
    }
  }

  @SubscribeMessage('track_state_changed')
  handleTrackStateChanged(
    @MessageBody()
    data: {
      roomId: string;
      userId: string;
      isVideoEnabled: boolean;
      isAudioEnabled: boolean;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, isVideoEnabled, isAudioEnabled } = data;

    const user = this.users.get(client.id);
    if (user && user.roomId === roomId) {
      this.logger.log(
        `🎚️ Track state changed by ${user.userName} (${userId}): video=${isVideoEnabled}, audio=${isAudioEnabled}`,
      );

      // Broadcast to all other users in the room
      client.to(roomId).emit('track_state_changed', {
        userId,
        isVideoEnabled,
        isAudioEnabled,
      });
    }
  }

  // Helper method to get room statistics
  getRoomStats(roomId: string) {
    const roomMembers = this.rooms.get(roomId);
    const roomUsers = Array.from(this.users.values()).filter(
      (u) => u.roomId === roomId,
    );

    return {
      roomId,
      memberCount: roomMembers?.size || 0,
      users: roomUsers.map((u) => ({
        id: u.userId,
        name: u.userName,
        isMentor: u.isMentor,
        isStreamReady: u.isStreamReady,
      })),
    };
  }
}
