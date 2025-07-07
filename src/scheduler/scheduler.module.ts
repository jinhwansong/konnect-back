import { MentoringReservation } from '@/entities';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerService } from './scheduler.service';
import { ExpiredReservationsTask } from './tasks/expired-reservations.task';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([MentoringReservation]),
  ],
  providers: [ExpiredReservationsTask, SchedulerService],
})
export class SchedulerModule {}
