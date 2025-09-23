import {
  ChatRoomStatus,
  MentoringStatus,
  NotificationType,
} from '@/common/enum/status.enum';
import { MentoringReservation } from '@/entities';
import { NotificationService } from '@/notification/notification.service';
import { ChatRoom, ChatRoomDocument } from '@/schema/chat-room.schema';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Between, IsNull, LessThan, Repository } from 'typeorm';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(MentoringReservation)
    private readonly reservationRepository: Repository<MentoringReservation>,
    @InjectModel(ChatRoom.name)
    private chatRoomModel: Model<ChatRoomDocument>,
    private readonly notificationService: NotificationService,
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

      this.logger.log(`Reservation moved to PROGRESS: ${r.id}`);

      // ✅ 멘토링 시작 10분 전 리마인더 알림
      const menteeNoti = await this.notificationService.save(
        this.reservationRepository.manager,
        r.mentee.id,
        NotificationType.RESERVATION,
        `멘토링이 곧 시작됩니다. (${r.session.title})`,
      );
      await this.notificationService.sendFcm(r.mentee.id, menteeNoti);

      const mentorNoti = await this.notificationService.save(
        this.reservationRepository.manager,
        r.session.mentor.user.id,
        NotificationType.RESERVATION,
        `멘토링이 곧 시작됩니다. (${r.session.title})`,
      );
      await this.notificationService.sendFcm(
        r.session.mentor.user.id,
        mentorNoti,
      );
    }
  }

  async remindReviews() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const noReview = await this.reservationRepository.find({
      where: {
        status: MentoringStatus.COMPLETED,
        updatedAt: Between(yesterday, new Date()),
        review: IsNull(),
      },
      relations: ['mentee'],
    });

    for (const r of noReview) {
      const reviewNoti = await this.notificationService.save(
        this.reservationRepository.manager,
        r.mentee.id,
        NotificationType.REVIEW,
        '어제 완료된 멘토링에 후기를 남겨주세요!',
        `/reservations/${r.id}`,
      );
      await this.notificationService.sendFcm(r.mentee.id, reviewNoti);
    }
  }
}
