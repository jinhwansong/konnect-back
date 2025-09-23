import {
  Like,
  MentoringReservation,
  MentoringReview,
  MentoringSession,
  Users,
} from '@/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MentoringReview,
      Users,
      MentoringReservation,
      Like,
      MentoringSession,
    ]),
    NotificationModule,
  ],
  providers: [ReviewService],
  controllers: [ReviewController],
  exports: [ReviewService],
})
export class ReviewModule {}
