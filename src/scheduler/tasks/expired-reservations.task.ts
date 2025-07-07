import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { SchedulerService } from "../scheduler.service";

@Injectable()
export class ExpiredReservationsTask {
    constructor(
        private readonly schedulerService: SchedulerService,
    ) {}
    @Cron('0 * * * *')
    async handleExpiredReservations() {
        this.schedulerService.expirePendingReservations();
    }
}