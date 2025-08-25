import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ChatRoom } from './chat-room.schema';
import { ChatMessage } from './chat-message.schema';

@Schema({ timestamps: true })
export class ChatParticipant extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ChatRoom' })
  room: ChatRoom;

  @Prop({ type: String, required: true })
  user: string;

  @Prop({ type: Types.ObjectId, ref: 'ChatMessage' })
  lastReadMessage?: ChatMessage;

  @Prop({ default: false })
  isTyping: boolean;

  @Prop({ default: true })
  micOn: boolean;

  @Prop({ default: true })
  camOn: boolean;
}

export const ChatParticipantSchema =
  SchemaFactory.createForClass(ChatParticipant);
