import { PaginationDto } from '@/common/dto/page.dto';
import { MentoringStatus, PaymentStatus } from '@/common/enum/status.enum';
import { MentoringReservation, Payment, Users } from '@/entities';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { DataSource, Repository } from 'typeorm';
import { ConfirmPaymentDto, RefundPaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(MentoringReservation)
    private reservationRepository: Repository<MentoringReservation>,
    private readonly httpService: HttpService,
    private readonly dataSource: DataSource,
  ) {}

  async confirmPayment(body: ConfirmPaymentDto, userId: string) {
    // 사용자 조회
    const user = await this.userRepository.findOne({ where: { id: userId } });
    try {
      // 중복 결제 방지
      const exist = await this.paymentRepository.findOne({
        where: { orderId: body.orderId, status: PaymentStatus.SUCCESS },
      });
      if (exist) {
        return {
          message: '이미 결제 완료된 예약입니다.',
          receiptUrl: exist.receiptUrl,
        };
      }
      // 예약 정보 조회
      const reservation = await this.reservationRepository.findOne({
        where: { id: body.orderId },
        relations: { session: true },
      });

      if (!reservation) {
        throw new BadRequestException('해당 예약을 찾을 수 없습니다.');
      }
      if (body.price !== reservation.session.price) {
        throw new BadRequestException(
          '결제 금액이 예약 금액과 일치하지 않습니다.',
        );
      }
      const res = await firstValueFrom(
        this.httpService.post(
          'https://api.tosspayments.com/v1/payments/confirm',
          {
            orderId: body.orderId,
            amount: body.price,
            paymentKey: body.paymentKey,
          },
          {
            headers: {
              Authorization: `Basic ${Buffer.from(
                `${process.env.TOSS_SECRET}:`,
              ).toString('base64')}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      await this.dataSource.transaction(async (manager) => {
        const payments = manager.getRepository(Payment);
        const reservations = manager.getRepository(MentoringReservation);

        // 결제 정보 저장
        const payment = payments.create({
          paymentKey: body.paymentKey,
          orderId: body.orderId,
          price: body.price,
          receiptUrl: res.data.receipt.url,
          status: PaymentStatus.SUCCESS,
          user,
        });
        await payments.save(payment);
        await reservations.update(
          { id: body.orderId },
          { status: MentoringStatus.CONFIRMED, paidAt: new Date() },
        );
      });

      return {
        message: '결제에 성공했습니다.',
      };
    } catch (error) {
      console.log('error', error);
      // Toss 응답이 있는 경우: 잔액 부족, 카드 거절 등
      const reason = error?.response?.data?.message || '알 수 없는 오류';
      const code = error?.response?.data?.code || 'UNKNOWN';

      const reservation = await this.reservationRepository.findOne({
        where: { id: body.orderId },
      });

      const failLog = this.paymentRepository.create({
        orderId: body.orderId,
        paymentKey: body.paymentKey,
        price: body.price,
        status: PaymentStatus.FAILED,
        failReason: `${code}: ${reason}`,
        user,
        reservation,
      });
      await this.paymentRepository.save(failLog);

      throw new BadRequestException(`결제 실패: ${reason}`);
    }
  }

  async getMentorIncome(
    userId: string,
    { page = 1, limit = 10 }: PaginationDto,
  ) {
    const [payment, total] = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.reservation', 'reservation')
      .leftJoin('reservation.session', 'session')
      .leftJoin('session.mentor', 'mentor')
      .leftJoin('payment.user', 'mentee')
      .where('mentor.user.id = :userId', { userId })
      .andWhere('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .orderBy('payment.createdAt', 'DESC')
      .select([
        'payment.id',
        'payment.price',
        'payment.createdAt',
        'mentee.name',
        'session.title',
      ])
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    const income = payment.map((p) => ({
      id: p.id,
      price: p.price,
      menteeName: p.user.name,
      createdAt: p.createdAt,
      programTitle: p.reservation.session.title,
    }));

    return {
      totalPage: Math.ceil(total / limit),
      items: income,
      message: '멘토 수입 내역을 조회했습니다.',
    };
  }

  async getMenteeIncome(
    userId: string,
    { page = 1, limit = 10 }: PaginationDto,
  ) {
    const [payment, total] = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.reservation', 'reservation')
      .leftJoin('reservation.session', 'session')
      .leftJoin('session.mentor', 'mentor')
      .leftJoin('mentor.user', 'mentorUser')
      .where('payment.user.id = :userId', { userId })
      .andWhere('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .orderBy('payment.createdAt', 'DESC')
      .select([
        'payment.id',
        'payment.price',
        'payment.receiptUrl',
        'payment.createdAt',
        'payment.orderId',
        'payment.status',
        'mentorUser.name',
        'session.title',
      ])
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    const income = payment.map((p) => ({
      id: p.id,
      price: p.price,
      receiptUrl: p.receiptUrl,
      orderId: p.orderId,
      status: p.status,
      mentorName: p.reservation.session.mentor.user.name,
      programTitle: p.reservation.session.title,
      createdAt: p.createdAt,
    }));

    return {
      totalPage: Math.ceil(total / limit),
      items: income,
      message: '멘토 수입 내역을 조회했습니다.',
    };
  }

  async refundPayment(userId: string, body: RefundPaymentDto) {
    return this.dataSource.transaction(async (manager) => {
      const payment = await this.paymentRepository.findOne({
        where: { paymentKey: body.paymentKey, user: { id: userId } },
        relations: ['reservation'],
      });
      if (!payment || payment.user.id !== userId) {
        throw new BadRequestException(
          '결제 정보를 찾을 수 없거나 권한이 없습니다.',
        );
      }

      if (payment.reservation.status === MentoringStatus.COMPLETED) {
        throw new BadRequestException('이미 진행된 멘토링 입니다.');
      }
      if (payment.reservation.status === MentoringStatus.PROGRESS) {
        throw new BadRequestException('이미 승인된 멘토링 입니다.');
      }
      const secretKey = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString(
        'base64',
      );

      const response = await firstValueFrom(
        this.httpService.post(
          `https://api.tosspayments.com/v1/payments/${body.paymentKey}/cancel`,
          {
            cancelReason: '구매자가 취소를 원함',
          },
          {
            headers: {
              Authorization: `Basic ${secretKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      if (response.data.status !== 'CANCELED') {
        throw new BadRequestException('환불 처리 중 오류가 발생했습니다.');
      }
      payment.status = PaymentStatus.REFUNDED;
      await manager.save(payment);

      payment.reservation.status = MentoringStatus.CANCELLED;
      await manager.save(payment.reservation);

      return {
        message: '환불 및 예약이 취소되었습니다.',
        status: PaymentStatus.REFUNDED,
      };
    });
  }
}
