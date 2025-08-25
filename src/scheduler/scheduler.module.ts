import { MentoringReservation } from '@/entities';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerService } from './scheduler.service';
import { ExpiredReservationsTask } from './tasks/expired-reservations.task';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoom, ChatRoomSchema } from '@/schema/chat-room.schema';
import { ChatRoomTask } from './tasks/chat-room.task';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([MentoringReservation]),
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
  providers: [ExpiredReservationsTask, SchedulerService, ChatRoomTask],
})
export class SchedulerModule {}
