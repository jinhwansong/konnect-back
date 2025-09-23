import { MentoringSchedule, MentoringSession, Mentors } from '@/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentoringController } from './mentoring.controller';
import { MentoringService } from './mentoring.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mentors, MentoringSession, MentoringSchedule]),
  ],
  controllers: [MentoringController],
  providers: [MentoringService],
  exports: [MentoringService],
})
export class MentoringModule {}
