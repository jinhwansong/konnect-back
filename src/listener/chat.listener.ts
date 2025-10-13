import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ChatService } from '@/chat/chat.service';
import { MentoringReservation } from '@/entities';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatListener {
  constructor(
    private readonly chatService: ChatService,
    @InjectRepository(MentoringReservation)
    private readonly reservationRepository: Repository<MentoringReservation>,
    private eventEmitter: EventEmitter2,
  ) {}
  @OnEvent('payment.confirmed')
  async handleRoomCreation(payload: { reservationId: string }) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: payload.reservationId },
      relations: ['session', 'session.mentor', 'session.mentor.user', 'mentee'],
    });
    if (!reservation) return;

    const room = await this.chatService.createRoom(
      reservation.id,
      [reservation.session.mentor.user.id, reservation.mentee.id],
      reservation.startTime,
      reservation.endTime,
    );

    reservation.roomId = room.roomId;
    await this.reservationRepository.save(reservation);
    this.eventEmitter.emit('room.created', { reservationId: reservation.id });
  }
}
