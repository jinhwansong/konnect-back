import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SchedulerService } from '../scheduler.service';

@Injectable()
export class ReservationsTask {
  constructor(private readonly schedulerService: SchedulerService) {}
  @Cron('0 */30 * * *')
  async handleReservationStatus() {
    await this.schedulerService.updateMentoringStatus();
  }
  @Cron('0 */5 * * *')
  async handleProgressReservationStatus() {
    await this.schedulerService.ProgressReservations();
  }
  @Cron('0 * * * *')
  async handleExpiredReservations() {
    this.schedulerService.expirePendingReservations();
  }
}
