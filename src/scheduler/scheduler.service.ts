import { ChatRoomStatus, MentoringStatus } from '@/common/enum/status.enum';
import { MentoringReservation } from '@/entities';
import { ChatRoom, ChatRoomDocument } from '@/schema/chat-room.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class SchedulerService {
  constructor(
    @InjectRepository(MentoringReservation)
    private readonly reservationRepository: Repository<MentoringReservation>,
    @InjectModel(ChatRoom.name)
    private chatRoomModel: Model<ChatRoomDocument>,
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

  async updateRoomStatuses() {
    const now = new Date();
    const rooms = await this.chatRoomModel.find();
    for (const room of rooms) {
      const start = new Date(room.startTime);
      const end = new Date(room.endTime);

      // 진행시간일떄
      if (now >= new Date(start.getTime() - 10 * 60 * 1000) && now <= end) {
        if (room.status !== ChatRoomStatus.PROGRESS) {
          room.status = ChatRoomStatus.PROGRESS;
          await room.save();
        }
      } else if (now > end) {
        if (room.status !== ChatRoomStatus.CLOSED) {
          room.status = ChatRoomStatus.CLOSED;
          await room.save();
        }
      }
    }
  }

  async updateMentoringStatus() {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().slice(0, 8);
    const toComplete = await this.reservationRepository
      .createQueryBuilder('reservation')
      .where('reservation.status = :status', {
        status: MentoringStatus.CONFIRMED,
      })
      .andWhere(
        '(reservation.date < :today OR (reservation.date = :today AND reservation.endTime < :currentTime))',
        { today, currentTime },
      )
      .getMany();
    for (const reservation of toComplete) {
      reservation.status = MentoringStatus.COMPLETED;
      await this.reservationRepository.save(reservation);
    }
  }
  async ProgressReservations() {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().slice(0, 8);
    const toProgress = await this.reservationRepository
      .createQueryBuilder('r')
      .where('r.status = :status', { status: MentoringStatus.CONFIRMED })
      .andWhere(
        '(r.date = :today AND r.startTime <= ADDTIME(:currentTime, "00:10:00") AND r.endTime >= :currentTime)',
        { today, currentTime },
      )
      .getMany();

    for (const r of toProgress) {
      r.status = MentoringStatus.PROGRESS;
      await this.reservationRepository.save(r);
    }
  }
}
