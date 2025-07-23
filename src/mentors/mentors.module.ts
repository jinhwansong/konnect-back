import {
  MentoringReservation,
  MentoringReview,
  MentoringSchedule,
  MentoringSession,
  Mentors,
  Payment,
  Users,
} from '@/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentorsController } from './mentors.controller';
import { MentorsService } from './mentors.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      Mentors,
      MentoringSession,
      MentoringSchedule,
      MentoringReservation,
      Payment,
      MentoringReview,
    ]),
  ],
  controllers: [MentorsController],
  providers: [MentorsService],
  exports: [MentorsService],
})
export class MentorsModule {}
