import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';


interface MentoringReservation {
  mentorId: string;
  menteeId: string;
  date: string; 
  startTime: string; 
  endTime: string; 
}

interface JoinRoomPayload {
  roomId: string;
  userId: string;
  token: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly mentoringReservationService: {
      findByRoomId: (roomId: string) => Promise<MentoringReservation | null>;
    },
  ) {}

  @UsePipes(new ValidationPipe({ transform: true }))
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() payload: JoinRoomPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, token } = payload || ({} as JoinRoomPayload);

    try {
      const decoded: any = this.jwtService.verify(token);
      if (!decoded || decoded.sub !== userId) {
        this.logger.warn(`join_denied: JWT sub mismatch (socket=${client.id})`);
        client.emit('join_denied', { reason: 'INVALID_TOKEN' });
        return;
      }

      const reservation =
        await this.mentoringReservationService.findByRoomId(roomId);
      if (!reservation) {
        this.logger.warn(
          `join_denied: reservation not found roomId=${roomId} (socket=${client.id})`,
        );
        client.emit('join_denied', { reason: 'RESERVATION_NOT_FOUND' });
        return;
      }

      const now = new Date();
      const start = new Date(`${reservation.date}T${reservation.startTime}:00`);
      const end = new Date(`${reservation.date}T${reservation.endTime}:00`);
      if (now < start || now > end) {
        this.logger.warn(
          `join_denied: out of reservation time window (socket=${client.id})`,
        );
        client.emit('join_denied', { reason: 'NOT_IN_TIME_WINDOW' });
        return;
      }

      const isParticipant =
        reservation.mentorId === userId || reservation.menteeId === userId;
      if (!isParticipant) {
        this.logger.warn(
          `join_denied: user not participant of reservation (socket=${client.id})`,
        );
        client.emit('join_denied', { reason: 'NOT_PARTICIPANT' });
        return;
      }

      client.join(roomId);
      this.logger.log(
        `join_success: user=${userId} joined room=${roomId} (socket=${client.id})`,
      );

      client.emit('join_success', { roomId, userId });
      client.to(roomId).emit('user_joined', { userId, socketId: client.id });
      console.log(`[CHAT] ${userId} joined room ${roomId}`);
    } catch (err) {
      this.logger.error(
        `join_denied: exception user=${userId} room=${roomId} (socket=${client.id}) - ${err?.message}`,
      );
      client.emit('join_denied', { reason: 'SERVER_ERROR' });
    }
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @MessageBody() payload: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId } =
      payload || ({} as { roomId: string; userId: string });
    try {
      client.leave(roomId);
      this.logger.log(
        `user_left: user=${userId} left room=${roomId} (socket=${client.id})`,
      );
      this.server.to(roomId).emit('user_left', { userId, socketId: client.id });
      console.log(`[CHAT] ${userId} left room ${roomId}`);
    } catch (err) {
      this.logger.error(
        `leave_room error: user=${userId} room=${roomId} (socket=${client.id}) - ${err?.message}`,
      );
    }
  }
}


