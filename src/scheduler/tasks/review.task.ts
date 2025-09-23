import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SchedulerService } from '../scheduler.service';

@Injectable()
export class ReviewTask {
  constructor(private readonly schedulerService: SchedulerService) {}
  @Cron('0 12 * * *')
  async handleReservationStatus() {
    await this.schedulerService.remindReviews();
  }
}
