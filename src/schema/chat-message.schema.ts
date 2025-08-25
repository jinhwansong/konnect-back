import { Document, Types } from 'mongoose';
import { ChatRoom } from './chat-room.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ChatMessageType } from '@/common/enum/status.enum';

@Schema({ timestamps: true })
export class ChatMessage extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ChatRoom', required: true })
  room: ChatRoom;

  @Prop({ type: String, required: true })
  senderId: string;

  @Prop()
  content: string;

  @Prop({ type: String, enum: ChatMessageType, default: ChatMessageType.TEXT })
  type: string;

  @Prop({ type: [{ userId: String, emoji: String }], default: [] })
  reactions: { userId: string; emoji: string }[];
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
