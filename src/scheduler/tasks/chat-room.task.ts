import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SchedulerService } from '../scheduler.service';

@Injectable()
export class ChatRoomTask {
  constructor(private readonly schedulerService: SchedulerService) {}
  @Cron('1 * * * *')
  async handleChatRoom() {
    this.schedulerService.updateRoomStatuses();
  }
}
