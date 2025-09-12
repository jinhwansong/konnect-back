import { ChatMessageType, ChatRoomStatus } from '@/common/enum/status.enum';
import { ChatMessage } from '@/schema/chat-message.schema';
import { ChatParticipant } from '@/schema/chat-participant.schema';
import { ChatRoom } from '@/schema/chat-room.schema';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
    @InjectModel(ChatParticipant.name)
    private chatParticipantModel: Model<ChatParticipant>,
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
      return room;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('이미 생성된 방이 있습니다.');
      }
      throw new InternalServerErrorException('채팅방 생성에 실패했습니다.');
    }
  }
  async sendMessage(
    roomId: string,
    senderId: string,
    content: string,
    type: ChatMessageType = ChatMessageType.TEXT,
  ) {
    try {
      const room = await this.chatMessageModel.findOne({ roomId });
      if (!room) throw new NotFoundException('채팅룸이 존재하지 않습니다.');
      const message = await this.chatMessageModel.create({
        room: room._id,
        sender: senderId,
        content,
        type,
      });

      return message;
    } catch (error) {
      throw new InternalServerErrorException('메시지 전송에 실패했습니다.');
    }
  }
}
