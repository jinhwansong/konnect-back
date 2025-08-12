import { PaginationDto } from '@/common/dto/page.dto';
import { DayOfWeek } from '@/common/enum/day.enum';
import { MentoringStatus } from '@/common/enum/status.enum';
import {
  MentoringReservation,
  MentoringSchedule,
  MentoringSession,
  Users,
} from '@/entities';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReservationDto } from './dto/reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(MentoringSession)
    private readonly sessionRepository: Repository<MentoringSession>,
    @InjectRepository(MentoringReservation)
    private readonly reservationRepository: Repository<MentoringReservation>,
    @InjectRepository(MentoringSchedule)
    private readonly scheduleRepository: Repository<MentoringSchedule>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}
  private getDayOfWeek(date: Date): DayOfWeek {
    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    return days[date.getDay()] as DayOfWeek;
  }
  private toMin(t: string) {
    // "HH:mm:ss" or "HH:mm"
    const [hh, mm] = t.split(':').map(Number);
    return hh * 60 + (mm ?? 0);
  }

  private toTime(m: number) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    return `${hh}:${mm}:00`;
  }
  private subtractIntervals(
    base: Array<{ start: number; end: number }>,
    cuts: Array<{ start: number; end: number }>,
  ) {
    // base: 스케줄 구간들, cuts: 예약 구간들
    // 결과: 예약을 뺀 가용 구간들
    let result = [...base];

    for (const cut of cuts) {
      const next: typeof result = [];
      for (const seg of result) {
        // 완전히 겹치지 않으면 그대로 유지
        if (cut.end <= seg.start || cut.start >= seg.end) {
          next.push(seg);
          continue;
        }
        // 앞쪽 남는 구간
        if (cut.start > seg.start) {
          next.push({ start: seg.start, end: Math.max(seg.start, cut.start) });
        }
        // 뒷쪽 남는 구간
        if (cut.end < seg.end) {
          next.push({ start: Math.min(cut.end, seg.end), end: seg.end });
        }
      }
      result = next;
    }

    // 길이 0 제거
    return result.filter((s) => s.end - s.start > 0);
  }
  async getAvailableTimes(id: string, date: string) {
    try {
      const session = await this.sessionRepository.findOne({
        where: { id },
        relations: ['mentor'],
      });

      if (!session) throw new NotFoundException('세션을 찾을 수 없습니다.');

      const mentorId = session.mentor.id;
      const dayOfWeek = this.getDayOfWeek(new Date(date));

      // 멘토 스케줄 조회
      const schedules = await this.scheduleRepository.find({
        where: { mentor: { id: mentorId }, dayOfWeek },
        order: { startTime: 'ASC' },
      });

      const baseRanges = schedules.map((s) => ({
        start: this.toMin(s.startTime),
        end: this.toMin(s.endTime),
      }));

      // 해당 날짜의 예약 조회
      const reservation = await this.reservationRepository.find({
        where: { session: { id }, date },
        order: { startTime: 'ASC' },
      });

      // 예약 구간을 분(min) 단위로
      const cutRanges = reservation.map((r) => ({
        start: this.toMin(r.startTime),
        end: this.toMin(r.endTime),
      }));

      let freeRanges = this.subtractIntervals(baseRanges, cutRanges);

      const slotMinutes = session.duration;
      const slots: Array<{ startTime: string; endTime: string }> = [];

      for (const fr of freeRanges) {
        for (let t = fr.start; t + slotMinutes <= fr.end; t += slotMinutes) {
          slots.push({
            startTime: this.toTime(t),
            endTime: this.toTime(t + slotMinutes),
          });
        }
      }

      return { data: slots };
    } catch (error) {
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException(
            '예약 가능한 시간 조회 중 오류가 발생했습니다.',
          );
    }
  }

  async createReservation(userId: string, body: CreateReservationDto) {
    const { sessionId, date, startTime, endTime, question } = body;
    try {
      const session = await this.sessionRepository.findOne({
        where: { id: sessionId },
      });
      if (!session) throw new NotFoundException('세션을 찾을 수 없습니다.');

      // 중복 여부
      const isReserved = await this.reservationRepository.findOne({
        where: {
          session: { id: sessionId },
          date,
          startTime: startTime,
          endTime: endTime,
        },
      });
      if (isReserved) {
        throw new ConflictException('해당 시간은 이미 예약되었습니다.');
      }
      const mentee = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!mentee) throw new NotFoundException('유저를 찾을 수 없습니다.');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const newReservation = this.reservationRepository.create({
        endTime,
        startTime,
        date,
        mentee,
        question,
        session,
        expiresAt,
        status: MentoringStatus.PENDING,
      });

      await this.reservationRepository.save(newReservation);

      return {
        reservationId: newReservation.id,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        '멘토링 예약 중 오류가 발생했습니다.',
      );
    }
  }

  async getMyReservations(
    userId: string,
    { page = 1, limit = 10 }: PaginationDto,
  ) {
    const [reservation, total] = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.session', 'session')
      .leftJoinAndSelect('session.mentor', 'mentor')
      .leftJoinAndSelect('mentor.user', 'mentorUser')
      .leftJoin('reservation.payments', 'payment')
      .where('reservation.mentee.id = :userId', { userId })
      .orderBy('reservation.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const items = reservation.map((res) => ({
      id: res.id,
      date: res.date,
      startTime: res.startTime,
      endTime: res.endTime,
      status: res.status,
      sessionTitle: res.session.title,
      mentorName: res.session.mentor.user.name,
      receiptUrl: res.payments?.[0]?.receiptUrl || null,
      hasReview: res.review ? true : false,
    }));

    return {
      totalPage: Math.ceil(total / limit),
      items,
      message: '멘티 예약 내역 조회 성공',
    };
  }
  async getAvailableDays(mentorId: string) {
    const schedules = await this.scheduleRepository.find({
      where: { mentor: { id: mentorId } },
      select: ['dayOfWeek'],
    });
    if (!schedules || schedules.length === 0) {
      throw new NotFoundException('해당 멘토의 예약 가능한 스케줄이 없습니다.');
    }
    const uniqueDays = [...new Set(schedules.map((s) => s.dayOfWeek))];

    return { data: uniqueDays };
  }
}
