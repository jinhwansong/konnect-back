import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoom, ChatRoomSchema } from '@/schema/chat-room.schema';
import { ChatMessage, ChatMessageSchema } from '@/schema/chat-message.schema';
import {
  ChatParticipant,
  ChatParticipantSchema,
} from '@/schema/chat-participant.schema';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: ChatParticipant.name, schema: ChatParticipantSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
