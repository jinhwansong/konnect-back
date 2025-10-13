import { ChatMessageType, ChatRoomStatus, UserRole } from '@/common/enum/status.enum';
import { Users } from '@/entities';
import { ChatUser } from '@/realtime/chat/chat.gateway';
import { ChatMessage } from '@/schema/chat-message.schema';
import { ChatRoom } from '@/schema/chat-room.schema';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
    @InjectRepository(Users) 
    private readonly usersRepository: Repository<Users>,
  ) {}

  async createRoom(
    reservationId: string,
    participants: string[],
    startTime: string,
    endTime: string,
  ) {
    try {
      const room = await this.chatRoomModel.create({
        reservationId,
        participants,
        startTime,
        endTime,
        isVideoRoom: true,
        status: ChatRoomStatus.WAITING,
      });

      this.logger.log(`Chat room created successfully: ${room.roomId}`);
      return room;
    } catch (error) {
      if (error.code === 11000) {
        this.logger.warn('Chat room already exists');
        throw new ConflictException('이미 생성된 방이 있습니다.');
      }
      this.logger.error(`Failed to create chat room: ${error.message}`);
      throw new InternalServerErrorException('채팅방 생성에 실패했습니다.');
    }
  }

  async listRooms(userId: string, keyword?: string) {
    try {
      const query: any = {
        participants: userId,
      };

      if (keyword) {
        query.name = { $regex: keyword, $options: 'i' };
      }

      const rooms = await this.chatRoomModel
        .find(query)
        .sort({ createdAt: -1 });

      this.logger.log(`Found ${rooms.length} chat rooms for user: ${userId}`);
      return rooms.map((room) => ({
        id: room.roomId,
        name: room.name,
        participantCount: room.participants.length,
      }));
    } catch (error) {
      this.logger.error(`Failed to list chat rooms: ${error.message}`);
      throw new InternalServerErrorException(
        '채팅방 목록 조회에 실패했습니다.',
      );
    }
  }

  async getRoomMessages(
    roomId: string,
    userId: string,
    cursor?: string,
    limit = 20,
  ) {
    try {
      const room = await this.chatRoomModel
        .findOne({ roomId })
        .populate('participants');
      if (!room) {
        throw new NotFoundException('채팅방을 찾을 수 없습니다.');
      }

      if (!room.participants.includes(userId)) {
        throw new NotFoundException('채팅방에 참여하지 않은 사용자입니다.');
      }


      // 커서 기반 쿼리 생성
      const query: any = { room: room._id };
      if (cursor) {
        // 커서보다 오래된 메시지를 가져옴 (무한스크롤 위로 로드)
        query._id = { $lt: cursor };
      }

      // limit + 1개를 가져와서 hasMore 판단
      const messages = await this.chatMessageModel
        .find(query)
        .sort({ createdAt: -1 }) // 최신 메시지부터 (내림차순)
        .limit(limit + 1);

      // hasMore 판단
      const hasMore = messages.length > limit;
      const messagesData = hasMore ? messages.slice(0, limit) : messages;

      // 다음 커서 (마지막 메시지의 _id)
      const nextCursor =
        hasMore && messagesData.length > 0
          ? messagesData[messagesData.length - 1]._id.toString()
          : undefined;

      // 모든 senderId를 수집하여 Users 조회
      const senderIds = [...new Set(messagesData.map((msg) => msg.senderId))];
      const senders = await this.usersRepository.find({
        where: senderIds.map((id) => ({ id })),
      });

      // senderId로 빠르게 찾기 위한 Map 생성
      const senderMap = new Map(senders.map((user) => [user.id, user]));

      const mapped = messagesData.map((msg) => {
        const sender = senderMap.get(msg.senderId);

        return {
          id: msg._id.toString(),
          roomId,
          message: msg.content,
          type: (msg.type || 'text') as 'text' | 'system' | 'file',
          createdAt: (msg as any).createdAt.toISOString(),
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          sender: {
            id: msg.senderId,
            name: sender?.name || '알 수 없음',
            image: sender?.image || undefined,
            isMentor: sender?.role === UserRole.MENTOR || false,
            socketId: undefined,
            roomId,
          } as ChatUser,
        };
      });

      return {
        data: mapped.reverse(), // 시간순 정렬 (오래된 것부터)
        hasMore,
        nextCursor,
        count: mapped.length,
      };
    } catch (error) {
      this.logger.error(`Failed to get room messages: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('메시지 조회에 실패했습니다.');
    }
  }

  async sendMessage(
    roomId: string,
    userId: string,
    message: string,
    fileUrl?: string,
    fileName?: string,
  ) {
    try {
      const room = await this.chatRoomModel.findOne({ roomId });
      if (!room) {
        throw new NotFoundException('채팅방을 찾을 수 없습니다.');
      }

      if (!room.participants.includes(userId)) {
        throw new NotFoundException('채팅방에 참여하지 않은 사용자입니다.');
      }

      const type = fileUrl ? ChatMessageType.FILE : ChatMessageType.TEXT;
      const chatMessage = await this.chatMessageModel.create({
        room: room._id,
        senderId: userId,
        content: message,
        type,
      });

      this.logger.log(`Message sent successfully in room: ${roomId}`);
      return {
        id: chatMessage._id.toString(),
        roomId,
        userId,
        message,
        createdAt: (chatMessage as any).createdAt.toISOString(),
        fileUrl,
        fileName,
      };
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('메시지 전송에 실패했습니다.');
    }
  }

  async issueWebRTCToken(roomId: string, userId: string) {
    try {
      const room = await this.chatRoomModel.findOne({ roomId });
      if (!room) {
        throw new NotFoundException('채팅방을 찾을 수 없습니다.');
      }

      if (!room.participants.includes(userId)) {
        throw new NotFoundException('채팅방에 참여하지 않은 사용자입니다.');
      }

      // TODO: 실제 WebRTC 토큰 생성 로직 구현
      const token = `webrtc_${roomId}_${userId}_${Date.now()}`;
      const expiresIn = 3600; // 1시간

      this.logger.log(`WebRTC token issued for room: ${roomId}`);
      return {
        roomId,
        userId,
        token,
        expiresIn,
      };
    } catch (error) {
      this.logger.error(`Failed to issue WebRTC token: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('토큰 발급에 실패했습니다.');
    }
  }
}
