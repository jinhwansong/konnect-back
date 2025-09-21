import { MentoringReservation, MentoringSchedule, Mentors } from '@/entities';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import {
  CreateMentoringScheduleDto,
  UpdateMentoringScheduleDto,
} from './dto/schedule.dto';
import { PaginationDto } from '@/common/dto/page.dto';
import { MentoringStatus, PaymentStatus } from '@/common/enum/status.enum';
import { UpdateReservationStatusDto } from './dto/reservation.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectRepository(MentoringSchedule)
    private readonly scheduleRepository: Repository<MentoringSchedule>,
    @InjectRepository(Mentors)
    private readonly mentorRepository: Repository<Mentors>,
    @InjectRepository(MentoringReservation)
    private readonly reservationRepository: Repository<MentoringReservation>,
    private readonly httpService: HttpService,
    private readonly dataSource: DataSource,
  ) {}

  async createSchedule(userId: string, body: CreateMentoringScheduleDto[]) {
    return this.dataSource.transaction(async (manager) => {
      try {
        const mentor = await manager.findOne(Mentors, {
          where: { user: { id: userId } },
        });
        if (!mentor)
          throw new ForbiddenException('본인의 스케줄만 등록할 수 있습니다.');
        
        const schedule = body.map((item) => {
          return manager.create(MentoringSchedule, {
            mentor,
            dayOfWeek: item.dayOfWeek,
            startTime: item.startTime,
            endTime: item.endTime,
          });
        });
        
        await manager.save(MentoringSchedule, schedule);
        this.logger.log(`Schedule created successfully for user ${userId}: ${schedule.length} items`);
        return { message: '정기 스케줄이 성공적으로 등록되었습니다.' };
      } catch (error) {
        this.logger.error(`Failed to create schedule for user ${userId}: ${error.message}`);
        throw error instanceof ForbiddenException
          ? error
          : new InternalServerErrorException('스케줄 등록 중 오류가 발생했습니다.');
      }
    });
  }

  async updateSchedule(
    userId: string,
    schedules: UpdateMentoringScheduleDto[],
  ) {
    return this.dataSource.transaction(async (manager) => {
      try {
        const mentor = await manager.findOne(Mentors, {
          where: { user: { id: userId } },
        });
        if (!mentor)
          throw new ForbiddenException('본인의 스케줄만 수정할 수 있습니다.');

        const existing = await manager.find(MentoringSchedule, {
          where: {
            mentor: { user: { id: userId } },
          },
          relations: { mentor: { user: true } },
        });

        const incomingIds = schedules.map((s) => s.id).filter(Boolean);
        const toDelete = existing.filter(
          (item) =>
            !incomingIds.includes(item.id) && item.mentor.user.id === userId,
        );

        if (toDelete.length) {
          await manager.remove(MentoringSchedule, toDelete);
        }

        await this.updateExistingSchedules(userId, schedules, manager);
        await this.createNewSchedules(mentor, schedules, manager);
        
        this.logger.log(`Schedule updated successfully for user ${userId}: ${schedules.length} items`);
        return { message: '정기 스케줄이 성공적으로 수정되었습니다.' };
      } catch (error) {
        this.logger.error(`Failed to update schedule for user ${userId}: ${error.message}`);
        throw error instanceof ForbiddenException || error instanceof NotFoundException
          ? error
          : new InternalServerErrorException('스케줄 수정 중 오류가 발생했습니다.');
      }
    });
  }

  async deleteSchedule(userId: string, scheduleId: string) {
    try {
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
      this.logger.log(`Schedule deleted successfully: ${scheduleId} by user ${userId}`);
      return { message: '해당 정기 스케줄이 성공적으로 삭제되었습니다.' };
    } catch (error) {
      this.logger.error(`Failed to delete schedule ${scheduleId}: ${error.message}`);
      throw error instanceof NotFoundException || error instanceof ForbiddenException
        ? error
        : new InternalServerErrorException('스케줄 삭제 중 오류가 발생했습니다.');
    }
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
        .andWhere('reservation.status != :expired', {
          expired: MentoringStatus.EXPIRED,
        })
        .orderBy('reservation.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
      const items = query.map((item) => ({
        id: item.id,
        title: item.session.title,
        date: item.date,
        startTime: item.startTime.slice(0, 5),
        endTime: item.endTime.slice(0, 5),
        status: item.status,
        createdAt: item.createdAt,
        menteeName: item.mentee.nickname,
        menteePhone: item.mentee.phone,
      }));
      return {
        message: ' 예약된 멘토링 목록을 불러왔습니다.',
        totalPages: Math.ceil(total / limit),
        data: items,
      };
    } catch (error) {
      this.logger.error(`Failed to get mentor reservation list for user ${userId}: ${error.message}`);
      throw new InternalServerErrorException(
        '예약된 멘토링 목록을 불러오는 중 오류가 발생했습니다. ',
      );
    }
  }
  async getMentorReservationDetail(userId: string, reservationId: string) {
    try {
      const reservation = await this.reservationRepository.findOne({
        where: { id: reservationId, status: Not(MentoringStatus.EXPIRED) },
        relations: ['session', 'session.mentor', 'session.mentor.user', 'mentee'],
      });
      if (!reservation) {
        throw new NotFoundException('예약 정보를 찾을 수 없습니다.');
      }

      if (reservation.session.mentor.user.id !== userId) {
        throw new ForbiddenException('해당 예약 정보에 접근할 수 없습니다.');
      }
      
      this.logger.log(`Reservation detail retrieved for reservation ${reservationId}`);
      return {
        id: reservation.id,
        title: reservation.session.title,
        date: reservation.date,
        startTime: reservation.startTime.slice(0, 5),
        endTime: reservation.endTime.slice(0, 5),
        question: reservation.question,
        status: reservation.status,
        createdAt: reservation.createdAt,
        rejectReason: reservation.rejectReason,
        menteeName: reservation.mentee.nickname,
        menteeEmail: reservation.mentee.email,
        menteePhone: reservation.mentee.phone,
      };
    } catch (error) {
      this.logger.error(`Failed to get reservation detail ${reservationId}: ${error.message}`);
      throw error instanceof NotFoundException || error instanceof ForbiddenException
        ? error
        : new InternalServerErrorException('예약 상세 정보 조회 중 오류가 발생했습니다.');
    }
  }
  async updateReservationStatus(
    userId: string,
    reservationId: string,
    body: UpdateReservationStatusDto,
  ) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: [
        'session',
        'session.mentor',
        'session.mentor.user',
        'payments',
      ],
    });

    if (!reservation) {
      throw new NotFoundException('예약 정보를 찾을 수 없습니다.');
    }

    if (reservation.session.mentor.user.id !== userId) {
      throw new ForbiddenException('해당 예약을 처리할 수 없습니다.');
    }
    if (!body.rejectReason) {
      throw new BadRequestException('거절 사유를 입력해주세요.');
    }
    if (!reservation.payments.paymentKey) {
      throw new BadRequestException('결제 정보가 없어 환불할 수 없습니다.');
    }
    const paymentKey = reservation.payments.paymentKey;

    const secretKey = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString(
      'base64',
    );
    try {
      await firstValueFrom(
        this.httpService.post(
          `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
          { cancelReason: body.rejectReason },
          {
            headers: {
              Authorization: `Basic ${secretKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (err) {
      if (err.response?.data?.message) {
        throw new BadRequestException({
          message: err.response.data.message,
        });
      }
      throw new InternalServerErrorException(
        '환불 처리 중 오류가 발생했습니다.',
      );
    }
    await this.dataSource.transaction(async (manager) => {
      reservation.status = MentoringStatus.CANCELLED;
      reservation.rejectReason = body.rejectReason;
      await manager.save(reservation);

      reservation.payments.status = PaymentStatus.REFUNDED;
      await manager.save(reservation.payments);
    });
    
    this.logger.log(`Reservation rejected and refunded: ${reservationId}`);
    return { message: '예약이 거절이 완료되었습니다.' };
  }

  private async updateExistingSchedules(
    userId: string,
    schedules: UpdateMentoringScheduleDto[],
    manager: any,
  ) {
    const result = [];

    const toUpdate = schedules.filter((s) => s.id);
    for (const dto of toUpdate) {
      const schedule = await manager.findOne(MentoringSchedule, {
        where: { id: dto.id },
        relations: { mentor: { user: true } },
      });
      if (!schedule)
        throw new NotFoundException('해당 스케줄을 찾을 수 없습니다.');
      if (schedule.mentor.user.id !== userId) {
        throw new ForbiddenException('본인의 스케줄만 수정할 수 있습니다.');
      }

      this.assignScheduleFields(schedule, dto);
      result.push(await manager.save(MentoringSchedule, schedule));
    }

    return result;
  }
  private async createNewSchedules(
    mentor: Mentors,
    schedules: UpdateMentoringScheduleDto[],
    manager: any,
  ) {
    const result = [];

    const toCreate = schedules.filter((s) => !s.id);
    for (const dto of toCreate) {
      const newSchedule = manager.create(MentoringSchedule, {
        mentor,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
      });
      result.push(await manager.save(MentoringSchedule, newSchedule));
    }

    return result;
  }
  private assignScheduleFields(
    target: MentoringSchedule,
    source: Partial<UpdateMentoringScheduleDto>,
  ) {
    target.dayOfWeek = source.dayOfWeek;
    target.startTime = source.startTime;
    target.endTime = source.endTime;
  }
}
