import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoom, ChatRoomSchema } from '@/schema/chat-room.schema';
import { ChatMessage, ChatMessageSchema } from '@/schema/chat-message.schema';
import {
  ChatParticipant,
  ChatParticipantSchema,
} from '@/schema/chat-participant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: ChatParticipant.name, schema: ChatParticipantSchema },
    ]),
  ],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
