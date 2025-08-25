import { ChatRoomStatus } from '@/common/enum/status.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class ChatRoom extends Document {
  @Prop({ required: true, unique: true, default: uuidv4 })
  roomId: string;
  @Prop({ type: [String], required: true })
  participants: string[];

  @Prop({ default: ChatRoomStatus.WAITING, enum: ChatRoomStatus })
  status: string;
  @Prop({ type: String, required: true })
  startTime: Date;

  @Prop({ type: String, required: true })
  endTime: Date;
  @Prop()
  reservationId: string;

  @Prop({ default: true })
  isVideoRoom: boolean;
}
export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
export type ChatRoomDocument = ChatRoom & Document;
