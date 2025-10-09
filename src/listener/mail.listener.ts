import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MentoringReservation } from '@/entities';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from '@/mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MailListener {
  constructor(
    private readonly mailService: MailService,
    @InjectRepository(MentoringReservation)
    private readonly reservationRepository: Repository<MentoringReservation>,
  ) {}
  @OnEvent('room.created')
  async handleMailSending(payload: { reservationId: string }) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: payload.reservationId },
      relations: ['session', 'session.mentor', 'session.mentor.user', 'mentee'],
    });
    if (!reservation) return;
    const meetingLink = `${process.env.FRONT_URL}/room/${reservation.id}`;
    await this.mailService.sendReservationConfirmed(reservation, meetingLink);
  }
  @OnEvent('reservation.refunded')
  async handleRefunded(payload: { reservationId: string }) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: payload.reservationId },
      relations: ['session', 'session.mentor', 'session.mentor.user'],
    });

    if (!reservation) return;

    await this.mailService.sendReservationCancelledForMentor(reservation);
  }
}
