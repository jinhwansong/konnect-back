import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom, ChatRoomSchema } from '@/schema/chat-room.schema';
import { ChatMessage, ChatMessageSchema } from '@/schema/chat-message.schema';
import {
  ChatParticipant,
  ChatParticipantSchema,
} from '@/schema/chat-participant.schema';
import { ChatController } from './chat.controller';
import { User, UserSchema } from '@/schema/user.schema';
import { Users } from '@/entities';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: ChatParticipant.name, schema: ChatParticipantSchema },
      { name: User.name, schema: UserSchema },
    ]),
    TypeOrmModule.forFeature([Users]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
