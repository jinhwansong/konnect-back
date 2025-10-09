import { ChatMessageType, ChatRoomStatus } from '@/common/enum/status.enum';
import { ChatMessage } from '@/schema/chat-message.schema';
import { ChatParticipant } from '@/schema/chat-participant.schema';
import { ChatRoom } from '@/schema/chat-room.schema';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
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

  async getRoomMessages(roomId: string, userId: string) {
    try {
      const room = await this.chatRoomModel.findOne({ roomId });
      if (!room) {
        throw new NotFoundException('채팅방을 찾을 수 없습니다.');
      }

      if (!room.participants.includes(userId)) {
        throw new NotFoundException('채팅방에 참여하지 않은 사용자입니다.');
      }

      const messages = await this.chatMessageModel
        .find({ room: room._id })
        .sort({ createdAt: 1 });

      this.logger.log(`Found ${messages.length} messages in room: ${roomId}`);
      return messages.map((msg) => ({
        id: msg._id.toString(),
        roomId,
        userId: msg.senderId,
        message: msg.content,
        createdAt: (msg as any).createdAt.toISOString(),
      }));
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
      console.log('roomId:::', roomId)
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
