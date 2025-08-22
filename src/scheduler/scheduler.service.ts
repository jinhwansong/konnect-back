import { MentoringStatus } from '@/common/enum/status.enum';
import { MentoringReservation } from '@/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class SchedulerService {
  constructor(
    @InjectRepository(MentoringReservation)
    private readonly reservationRepository: Repository<MentoringReservation>,
  ) {}

  async expirePendingReservations() {
    const now = new Date();

    const expired = await this.reservationRepository.find({
      where: {
        status: MentoringStatus.PENDING,
        expiresAt: LessThan(now),
      },
    });

    if (expired.length === 0) return;

    for (const reservation of expired) {
      await this.reservationRepository.update(reservation.id, {
        status: MentoringStatus.EXPIRED,
      });
    }
  }
}
