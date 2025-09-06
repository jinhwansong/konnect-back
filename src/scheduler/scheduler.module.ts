import { MentoringReservation } from '@/entities';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerService } from './scheduler.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoom, ChatRoomSchema } from '@/schema/chat-room.schema';
import { ChatRoomTask } from './tasks/chat-room.task';
import { ReservationsTask } from './tasks/update-reservation';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([MentoringReservation]),
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
  providers: [ReservationsTask, SchedulerService, ChatRoomTask],
})
export class SchedulerModule {}
