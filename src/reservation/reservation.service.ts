import { PaginationDto } from '@/common/dto/page.dto';
import { DayOfWeek } from '@/common/enum/day.enum';
import { MentoringStatus } from '@/common/enum/status.enum';
import { MentoringReservation, MentoringSchedule, MentoringSession, Users } from '@/entities';
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
  async getAvailableTimes(id: string, date: string) {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['mentor'],
    });
    if (!session) throw new NotFoundException('세션을 찾을 수 없습니다.');
    const mentor = session.mentor;
    const dayOfWeek = this.getDayOfWeek(new Date(date));

    // 멘토 스케줄 조회
    const schedules = await this.scheduleRepository.find({
      where: { mentor: { id: mentor.id }, dayOfWeek },
    });

    // 예약된 시간 조회
    const reservation = await this.reservationRepository.find({
      where: { session: { id }, date },
    });

    const reservationTime = reservation.map((time) => ({
      startTime: time.startTime,
      endTime: time.endTime,
    }));

    // 예약 가능한 시간
    const availableTime = schedules
      .filter((time) => {
        return !reservationTime.some(
          (item) =>
            time.startTime === item.startTime && time.endTime === item.endTime,
        );
      })
      .map((time) => ({
        startTime: time.startTime,
        endTime: time.endTime,
      }));
    return { availableTime };
  }

  async createReservation(userId: string, body: CreateReservationDto) {
    const { sessionId, date,startTime,endTime,question } = body;
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

  async getMyReservations(userId:string, { page = 1, limit = 10 }: PaginationDto) {
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
}
