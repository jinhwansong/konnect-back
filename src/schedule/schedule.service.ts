import { MentoringReservation, MentoringSchedule, Mentors } from '@/entities';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateMentoringScheduleDto,
  UpdateMentoringScheduleDto,
} from './dto/schedule.dto';
import { PaginationDto } from '@/common/dto/page.dto';
import { MentoringStatus } from '@/common/enum/status.enum';
import { UpdateReservationStatusDto } from './dto/reservation.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(MentoringSchedule)
    private readonly scheduleRepository: Repository<MentoringSchedule>,
    @InjectRepository(Mentors)
    private readonly mentorRepository: Repository<Mentors>,
    @InjectRepository(MentoringReservation)
    private readonly reservationRepository: Repository<MentoringReservation>,
    private readonly httpService: HttpService,
  ) {}

  async createSchedule(userId: string, body: CreateMentoringScheduleDto) {
    const mentor = await this.mentorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!mentor)
      throw new ForbiddenException('본인의 스케줄만 등록할 수 있습니다.');
    const schedule = this.scheduleRepository.create({ ...body, mentor });
    await this.scheduleRepository.save(schedule);

    return { message: '정기 스케줄이 성공적으로 등록되었습니다.' };
  }

  async updateSchedule(
    userId: string,
    scheduleId: string,
    body: UpdateMentoringScheduleDto,
  ) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: { mentor: { user: true } },
    });

    if (!schedule)
      throw new NotFoundException('해당 스케줄을 찾을 수 없습니다.');
    if (schedule.mentor.user.id !== userId) {
      throw new ForbiddenException('본인의 스케줄만 수정할 수 있습니다.');
    }

    Object.assign(schedule, body);
    await this.scheduleRepository.save(schedule);

    return { message: '정기 스케줄이 성공적으로 수정되었습니다.' };
  }

  async deleteSchedule(userId: string, scheduleId: string) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: { mentor: { user: true } },
    });

    if (!schedule)
      throw new NotFoundException('해당 스케줄을 찾을 수 없습니다.');
    if (schedule.mentor.user.id !== userId) {
      throw new ForbiddenException('본인의 스케줄만 삭제할 수 있습니다.');
    }

    await this.scheduleRepository.remove(schedule);
    return { message: '정기 스케줄이 성공적으로 삭제되었습니다.' };
  }

  async getScheduleList(userId: string) {
    const mentor = await this.mentorRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!mentor) {
      throw new NotFoundException('멘토 정보를 찾을 수 없습니다.');
    }

    const schedules = await this.scheduleRepository.find({
      where: { mentor: { id: mentor.id } },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
    const result = schedules.map((item) => ({
      dayOfWeek: item.dayOfWeek,
      endTime: item.endTime,
      startTime: item.startTime,
      id: item.id,
    }));
    return {
      message: '멘토가 등록한 정기 스케줄 목록을 반환합니다.',
      data: result,
    };
  }

  async getMentorReservationList(
    userId: string,
    { page = 1, limit = 10 }: PaginationDto,
  ) {
    try {
      const mentor = await this.mentorRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!mentor) {
        throw new NotFoundException('멘토 정보를 찾을 수 없습니다.');
      }

      const [query, total] = await this.reservationRepository
        .createQueryBuilder('reservation')
        .leftJoinAndSelect('reservation.session', 'session')
        .leftJoinAndSelect('reservation.mentee', 'mentee')
        .where('session.mentorId = :mentorId', { mentorId: mentor.id })
        .orderBy('reservation.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const items = query.map((item) => ({
        id: item.id,
        title: item.session.title,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        status: item.status,
        createdAt: item.createdAt,
        menteeName: item.mentee.nickname,
        menteeEmail: item.mentee.email,
        menteePhone: item.mentee.phone,
      }));
      return {
        message: ' 예약된 멘토링 목록을 불러왔습니다.',
        totalPages: Math.ceil(total / limit),
        data: items,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        '예약된 멘토링 목록을 불러오는 중 오류가 발생했습니다. ',
      );
    }
  }
  async getMentorReservationDetail(userId: string, reservationId: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['session', 'session.mentor', 'session.mentor.user', 'mentee'],
    });
    if (!reservation) {
      throw new NotFoundException('예약 정보를 찾을 수 없습니다.');
    }

    if (reservation.session.mentor.user.id !== userId) {
      throw new ForbiddenException('해당 예약 정보에 접근할 수 없습니다.');
    }
    return {
      id: reservation.id,
      title: reservation.session.title,
      date: reservation.date,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      question: reservation.question,
      status: reservation.status,
      createdAt: reservation.createdAt,
      rejectReason: reservation.rejectReason,
      menteeName: reservation.mentee.nickname,
      menteeEmail: reservation.mentee.email,
      menteePhone: reservation.mentee.phone,
    };
  }
  async updateReservationStatus(
    userId: string,
    reservationId: string,
    body: UpdateReservationStatusDto,
  ) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['session', 'session.mentor', 'session.mentor.user'],
    });

    if (!reservation) {
      throw new NotFoundException('예약 정보를 찾을 수 없습니다.');
    }

    if (reservation.session.mentor.user.id !== userId) {
      throw new ForbiddenException('해당 예약을 처리할 수 없습니다.');
    }

    if (body.status === MentoringStatus.CONFIRMED) {
      reservation.status = MentoringStatus.CONFIRMED;
      reservation.rejectReason = null;
    } else if (body.status === MentoringStatus.CANCELLED) {
      if (!body.rejectReason) {
        throw new BadRequestException('거절 사유를 입력해주세요.');
      }
      reservation.status = MentoringStatus.CANCELLED;
      reservation.rejectReason = body.rejectReason;

      // 환불 로직
      const paymentKey = reservation.payments.paymentKey;
      const cancelReason = body.rejectReason;
      if (!paymentKey) {
        throw new BadRequestException(
          '결제 정보가 존재하지 않아 환불할 수 없습니다.',
        );
      }
      try {
        const secretKey = Buffer.from(
          `${process.env.TOSS_SECRET_KEY}:`,
        ).toString('base64');

        await firstValueFrom(
          this.httpService.post(
            `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
            {
              cancelReason,
            },
            {
              headers: {
                Authorization: `Basic ${secretKey}`,
                'Content-Type': 'application/json',
              },
            },
          ),
        );
      } catch (err) {
        throw new InternalServerErrorException(
          '환불 처리 중 오류가 발생했습니다.',
        );
      }
    } else {
      throw new BadRequestException('허용되지 않은 상태입니다.');
    }

    await this.reservationRepository.save(reservation);

    return {
      message: `예약이 ${body.status === 'confirmed' ? '수락' : '거절'}되었습니다.`,
    };
  }
}
