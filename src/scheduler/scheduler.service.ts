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
}
