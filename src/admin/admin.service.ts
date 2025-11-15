import { PaginationDto } from '@/common/dto/page.dto';
import {
  MentorStatus,
  NotificationType,
  PaymentStatus,
  UserRole,
} from '@/common/enum/status.enum';
import {
  Article,
  Mentors,
  MentoringReservation,
  MentoringReview,
  MentoringSession,
  Notice,
  Notification,
  Payment,
  Users,
} from '@/entities';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ApproveOrRejectMentorDto } from './dto/approve.dto';
import { AdminQueryDto } from './dto/admin-query.dto';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notice.dto';
import { NotificationService } from '@/notification/notification.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Mentors)
    private readonly mentorRepository: Repository<Mentors>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(MentoringReview)
    private readonly reviewRepository: Repository<MentoringReview>,
    @InjectRepository(MentoringReservation)
    private readonly reservationRepository: Repository<MentoringReservation>,
    @InjectRepository(MentoringSession)
    private readonly sessionRepository: Repository<MentoringSession>,
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
    private readonly notificationService: NotificationService,
    private readonly dataSource: DataSource,
  ) {}
  // 멘토 신청 목록 조회
  async getMentorList({ page = 1, limit = 10 }: PaginationDto) {
    try {
      const queryBuilder = this.mentorRepository
        .createQueryBuilder('mentor')
        .leftJoinAndSelect('mentor.user', 'user')
        .select([
          'mentor.id',
          'mentor.expertise',
          'user.email',
          'user.name',
          'mentor.status',
          'mentor.createdAt',
        ])
        .orderBy('mentor.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);
      const [result, total] = await queryBuilder.getManyAndCount();
      const data = result.map((mentor) => ({
        id: mentor.id,
        expertise: mentor.expertise,
        status: mentor.status,
        createdAt: mentor.createdAt,
        email: mentor.user.email,
        name: mentor.user.name,
      }));

      this.logger.log(`Retrieved ${total} mentor applications`);
      return {
        data,
        total,
        totalPage: Math.ceil(total / limit),
        message: '멘토신청 목록을 조회했습니다.',
      };
    } catch (error) {
      this.logger.error(`Failed to get mentor list: ${error.message}`);
      throw new InternalServerErrorException(
        '멘토 신청 정보를 찾을 수 없습니다.',
      );
    }
  }
  // 멘토 상세 조회
  async getMentorDetail(id: string) {
    try {
      const mentor = await this.mentorRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!mentor) {
        throw new NotFoundException('멘토를 찾을 수 없습니다.');
      }

      this.logger.log(`Retrieved mentor detail for ID: ${id}`);
      return {
        id: mentor.id,
        expertise: mentor.expertise,
        email: mentor.user.email,
        name: mentor.user.name,
        status: mentor.status,
        createdAt: mentor.createdAt,
        company: mentor.company,
        introduce: mentor.introduce,
        position: mentor.position,
        career: mentor.career,
        portfolio: mentor.portfolio,
        image: mentor.user.image,
        phone: mentor.user.phone,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get mentor detail for ID ${id}: ${error.message}`,
      );
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException(
            '멘토 상세 정보를 불러오는 데 실패했습니다.',
          );
    }
  }
  // 유저 목록 조회
  async getUserList({ page = 1, limit = 10 }: PaginationDto) {
    try {
      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.email',
          'user.nickname',
          'user.name',
          'user.role',
          'user.createdAt',
        ])
        .orderBy('user.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);
      const [result, total] = await queryBuilder.getManyAndCount();
      const data = result.map((user) => ({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      }));

      this.logger.log(`Retrieved ${total} users`);
      return {
        data,
        totalPage: Math.ceil(total / limit),
        message: '사용자 목록을 조회했습니다.',
      };
    } catch (error) {
      this.logger.error(`Failed to get user list: ${error.message}`);
      throw new InternalServerErrorException('사용자 목록을 찾을 수 없습니다.');
    }
  }
  // 승인 / 거절
  async approveMentor(
    mentorId: string,
    userId: string,
    body: ApproveOrRejectMentorDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      try {
        const admin = await manager.findOne(Users, {
          where: { id: userId },
        });
        if (!admin) throw new NotFoundException('사용자를 찾을 수 없습니다.');

        if (admin.role !== UserRole.ADMIN)
          throw new ForbiddenException(
            '관리자만 이 작업을 수행할 수 있습니다.',
          );

        const mentor = await manager.findOne(Mentors, {
          where: { id: mentorId },
          relations: ['user'],
        });
        if (!mentor)
          throw new NotFoundException('멘토 정보를 찾을 수 없습니다.');

        if (body.status === MentorStatus.REJECTED && !body.reason) {
          throw new BadRequestException('거절 사유를 입력해야 합니다.');
        }

        mentor.status = body.status;
        mentor.reason = body.reason || null;

        if (body.status === MentorStatus.REJECTED) {
          mentor.rejectedAt = new Date();
        } else {
          mentor.rejectedAt = null;
          mentor.reason = null;
          mentor.user.role = UserRole.MENTOR;
          await manager.save(Users, mentor.user);
        }

        await manager.save(Mentors, mentor);

        this.logger.log(
          `Mentor ${mentorId} ${body.status === MentorStatus.REJECTED ? 'rejected' : 'approved'} by admin ${userId}`,
        );

        let savedNotification: Notification;

        if (body.status === MentorStatus.REJECTED) {
          savedNotification = await this.notificationService.save(
            manager,
            mentor.user.id,
            NotificationType.MENTOR,
            `멘토 신청이 거절되었습니다. 사유: ${body.reason}`,
            `/mentor/apply/${mentor.id}`,
          );
          this.notificationService.sendFcm(mentor.user.id, savedNotification);

          return {
            message: '멘토가 거절되었습니다.',
          };
        }
        savedNotification = await this.notificationService.save(
          manager,
          mentor.user.id,
          NotificationType.RESERVATION,
          '멘토 신청이 승인되었습니다.',
          `/mentor/${mentor.id}`,
        );

        await this.notificationService.sendFcm(
          mentor.user.id,
          savedNotification,
        );
        return {
          message: '멘토가 승인되었습니다.',
        };
      } catch (error) {
        this.logger.error(
          `Failed to approve/reject mentor ${mentorId}: ${error.message}`,
        );
        throw error instanceof BadRequestException ||
          error instanceof ForbiddenException ||
          error instanceof NotFoundException
          ? error
          : new InternalServerErrorException(
              '멘토 승인/거절 처리 중 오류가 발생했습니다.',
            );
      }
    });
  }

  // 대시보드 통계 조회
  async getDashboard() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // 오늘 가입자 수
      const todayUsers = await this.userRepository
        .createQueryBuilder('user')
        .where('user.createdAt >= :today', { today })
        .andWhere('user.createdAt < :tomorrow', { tomorrow })
        .getCount();

      // 어제 가입자 수
      const yesterdayUsers = await this.userRepository
        .createQueryBuilder('user')
        .where('user.createdAt >= :yesterday', { yesterday })
        .andWhere('user.createdAt < :today', { today })
        .getCount();

      // 오늘 결제액
      const todayPayments = await this.paymentRepository
        .createQueryBuilder('payment')
        .where('payment.createdAt >= :today', { today })
        .andWhere('payment.createdAt < :tomorrow', { tomorrow })
        .andWhere('payment.status = :status', { status: PaymentStatus.SUCCESS })
        .getMany();

      const todayPaymentAmount = todayPayments.reduce(
        (sum, p) => sum + p.price,
        0,
      );
      const todayPaymentCount = todayPayments.length;

      // 어제 결제액
      const yesterdayPayments = await this.paymentRepository
        .createQueryBuilder('payment')
        .where('payment.createdAt >= :yesterday', { yesterday })
        .andWhere('payment.createdAt < :today', { today })
        .andWhere('payment.status = :status', { status: PaymentStatus.SUCCESS })
        .getMany();

      const yesterdayPaymentAmount = yesterdayPayments.reduce(
        (sum, p) => sum + p.price,
        0,
      );

      // 오늘 예약 수
      const todayReservations = await this.reservationRepository
        .createQueryBuilder('reservation')
        .where('reservation.createdAt >= :today', { today })
        .andWhere('reservation.createdAt < :tomorrow', { tomorrow })
        .getCount();

      // 어제 예약 수
      const yesterdayReservations = await this.reservationRepository
        .createQueryBuilder('reservation')
        .where('reservation.createdAt >= :yesterday', { yesterday })
        .andWhere('reservation.createdAt < :today', { today })
        .getCount();

      // 신규 멘토 신청 수
      const pendingMentors = await this.mentorRepository.count({
        where: { status: MentorStatus.PENDING },
      });

      // 최근 결제 목록
      const recentPayments = await this.paymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.user', 'user')
        .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
        .orderBy('payment.createdAt', 'DESC')
        .take(5)
        .getMany();

      // 최근 멘토 신청 목록
      const recentApplications = await this.mentorRepository
        .createQueryBuilder('mentor')
        .leftJoinAndSelect('mentor.user', 'user')
        .orderBy('mentor.createdAt', 'DESC')
        .take(5)
        .getMany();

      // 7일간 트렌드 데이터
      const trends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const signupCount = await this.userRepository
          .createQueryBuilder('user')
          .where('user.createdAt >= :date', { date })
          .andWhere('user.createdAt < :nextDate', { nextDate })
          .getCount();

        const paymentCount = await this.paymentRepository
          .createQueryBuilder('payment')
          .where('payment.createdAt >= :date', { date })
          .andWhere('payment.createdAt < :nextDate', { nextDate })
          .andWhere('payment.status = :status', { status: PaymentStatus.SUCCESS })
          .getCount();

        trends.push({
          date: `${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`,
          signup: signupCount,
          payment: paymentCount,
        });
      }

      const userDelta = yesterdayUsers > 0
        ? Math.round(((todayUsers - yesterdayUsers) / yesterdayUsers) * 100)
        : 0;
      const paymentDelta = yesterdayPaymentAmount > 0
        ? Math.round(
            ((todayPaymentAmount - yesterdayPaymentAmount) /
              yesterdayPaymentAmount) *
              100,
          )
        : 0;
      const reservationDelta = yesterdayReservations > 0
        ? Math.round(
            ((todayReservations - yesterdayReservations) /
              yesterdayReservations) *
              100,
          )
        : 0;

      return {
        metrics: [
          {
            id: 'new-users',
            label: '오늘 가입자',
            value: todayUsers,
            delta: Math.abs(userDelta),
            trend: userDelta > 0 ? 'up' : userDelta < 0 ? 'down' : 'neutral',
            subText: '어제 대비',
          },
          {
            id: 'payments',
            label: '오늘 결제액',
            value: todayPaymentAmount,
            delta: Math.abs(paymentDelta),
            trend:
              paymentDelta > 0 ? 'up' : paymentDelta < 0 ? 'down' : 'neutral',
            subText: `오늘 결제 건수 ${todayPaymentCount}건`,
          },
          {
            id: 'reservations',
            label: '오늘 예약',
            value: todayReservations,
            delta: Math.abs(reservationDelta),
            trend:
              reservationDelta > 0
                ? 'up'
                : reservationDelta < 0
                  ? 'down'
                  : 'neutral',
          },
          {
            id: 'mentor-applications',
            label: '신규 멘토 신청',
            value: pendingMentors,
            delta: 0,
            trend: 'neutral',
          },
        ],
        recentPayments: recentPayments.map((p) => ({
          id: p.id,
          userName: p.user.name,
          amount: p.price,
          status: p.status === PaymentStatus.REFUNDED ? '환불' : '성공',
          paidAt: p.createdAt.toISOString(),
        })),
        recentApplications: recentApplications.map((m) => ({
          id: m.id,
          applicantName: m.user.name,
          careerYears: m.career || 0,
          submittedAt: m.createdAt.toISOString(),
          status: m.status,
        })),
        trends,
      };
    } catch (error) {
      this.logger.error(`Failed to get dashboard: ${error.message}`);
      throw new InternalServerErrorException('대시보드 데이터를 불러오는 데 실패했습니다.');
    }
  }

  // 사용자 목록 조회 (검색, 필터링, 정렬)
  async getUserListWithFilters(dto: AdminQueryDto & { role?: string; status?: string }) {
    try {
      const { page = 1, limit = 10, q, role, status, sort = 'createdAt:desc' } = dto;

      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .where('user.deletedAt IS NULL');

      if (q) {
        queryBuilder.andWhere(
          '(user.name LIKE :q OR user.email LIKE :q OR user.nickname LIKE :q OR user.id LIKE :q)',
          { q: `%${q}%` },
        );
      }

      if (role && role !== 'all') {
        queryBuilder.andWhere('user.role = :role', { role });
      }

      // status는 deletedAt 기준으로 판단 (suspended는 추후 구현)
      if (status && status !== 'all') {
        if (status === 'suspended') {
          // TODO: suspended 상태 필드 추가 시 구현
        }
      }

      const [sortField, sortDirection] = sort.split(':');
      if (sortField && sortDirection) {
        queryBuilder.orderBy(`user.${sortField}`, sortDirection.toUpperCase() as 'ASC' | 'DESC');
      } else {
        queryBuilder.orderBy('user.createdAt', 'DESC');
      }

      const [result, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const data = result.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        status: user.deletedAt ? 'suspended' : 'active',
      }));

      return {
        data,
        meta: {
          page,
          limit,
          totalCount: total,
          totalPages: Math.ceil(total / limit),
          sort,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get user list: ${error.message}`);
      throw new InternalServerErrorException('사용자 목록을 찾을 수 없습니다.');
    }
  }

  // 사용자 상태 변경
  async updateUserStatus(userId: string, suspended: boolean) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      if (suspended) {
        user.deletedAt = new Date();
      } else {
        user.deletedAt = null;
      }

      await this.userRepository.save(user);
      this.logger.log(`User ${userId} status updated: ${suspended ? 'suspended' : 'active'}`);

      return { message: `사용자가 ${suspended ? '정지' : '활성화'}되었습니다.` };
    } catch (error) {
      this.logger.error(`Failed to update user status: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('사용자 상태 변경 중 오류가 발생했습니다.');
    }
  }

  // 결제 목록 조회
  async getPaymentList(dto: AdminQueryDto & { status?: string }) {
    try {
      const { page = 1, limit = 10, q, status, sort = 'createdAt:desc' } = dto;

      const queryBuilder = this.paymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.user', 'user');

      if (q) {
        queryBuilder.andWhere(
          '(user.name LIKE :q OR payment.orderId LIKE :q OR payment.id LIKE :q)',
          { q: `%${q}%` },
        );
      }

      if (status && status !== 'all') {
        const statusMap: Record<string, PaymentStatus> = {
          성공: PaymentStatus.SUCCESS,
          실패: PaymentStatus.FAILED,
          환불: PaymentStatus.REFUNDED,
        };
        if (statusMap[status]) {
          queryBuilder.andWhere('payment.status = :status', {
            status: statusMap[status],
          });
        }
      }

      const [sortField, sortDirection] = sort.split(':');
      if (sortField && sortDirection) {
        queryBuilder.orderBy(
          `payment.${sortField}`,
          sortDirection.toUpperCase() as 'ASC' | 'DESC',
        );
      } else {
        queryBuilder.orderBy('payment.createdAt', 'DESC');
      }

      const [result, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const statusMap: Record<PaymentStatus, string> = {
        [PaymentStatus.SUCCESS]: '성공',
        [PaymentStatus.FAILED]: '실패',
        [PaymentStatus.REFUNDED]: '환불',
        [PaymentStatus.PENDING]: '대기',
      };

      const data = result.map((p) => ({
        id: p.id,
        orderId: p.orderId,
        userName: p.user.name,
        amount: p.price,
        status: statusMap[p.status] || '대기',
        paidAt: p.createdAt.toISOString(),
      }));

      return {
        data,
        meta: {
          page,
          limit,
          totalCount: total,
          totalPages: Math.ceil(total / limit),
          sort,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get payment list: ${error.message}`);
      throw new InternalServerErrorException('결제 목록을 찾을 수 없습니다.');
    }
  }

  // 아티클 목록 조회
  async getArticleList(dto: AdminQueryDto & { status?: string }) {
    try {
      const { page = 1, limit = 10, q, status, sort = 'createdAt:desc' } = dto;

      const queryBuilder = this.articleRepository
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.author', 'author')
        .leftJoin('article.likes', 'likes')
        .addSelect('COUNT(likes.id)', 'likeCount')
        .groupBy('article.id')
        .addGroupBy('author.id');

      if (q) {
        queryBuilder.andWhere(
          '(article.title LIKE :q OR author.name LIKE :q OR article.id LIKE :q)',
          { q: `%${q}%` },
        );
      }

      // status는 아티클에 published 필드가 없으므로 무시 (추후 구현 가능)

      const [sortField, sortDirection] = sort.split(':');
      if (sortField && sortDirection) {
        queryBuilder.orderBy(
          `article.${sortField}`,
          sortDirection.toUpperCase() as 'ASC' | 'DESC',
        );
      } else {
        queryBuilder.orderBy('article.createdAt', 'DESC');
      }

      const [result, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const data = result.map((a) => ({
        id: a.id,
        title: a.title,
        author: a.author.name,
        views: a.views,
        likes: a.likes?.length || 0,
        createdAt: a.createdAt.toISOString(),
        status: 'published', // TODO: published 필드 추가 시 수정
      }));

      return {
        data,
        meta: {
          page,
          limit,
          totalCount: total,
          totalPages: Math.ceil(total / limit),
          sort,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get article list: ${error.message}`);
      throw new InternalServerErrorException('아티클 목록을 찾을 수 없습니다.');
    }
  }

  // 리뷰 목록 조회
  async getReviewList(dto: AdminQueryDto & { reported?: string }) {
    try {
      const { page = 1, limit = 10, q, reported, sort = 'createdAt:desc' } = dto;

      const queryBuilder = this.reviewRepository
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.mentee', 'mentee')
        .leftJoinAndSelect('review.session', 'session');

      if (q) {
        queryBuilder.andWhere(
          '(mentee.name LIKE :q OR session.title LIKE :q OR review.id LIKE :q)',
          { q: `%${q}%` },
        );
      }

      // reported는 리뷰에 reported 필드가 없으므로 무시 (추후 구현 가능)

      const [sortField, sortDirection] = sort.split(':');
      if (sortField && sortDirection) {
        queryBuilder.orderBy(
          `review.${sortField}`,
          sortDirection.toUpperCase() as 'ASC' | 'DESC',
        );
      } else {
        queryBuilder.orderBy('review.createdAt', 'DESC');
      }

      const [result, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const data = result.map((r) => ({
        id: r.id,
        targetSession: r.session?.title || '알 수 없음',
        author: r.mentee.name,
        rating: r.rating,
        createdAt: r.createdAt.toISOString(),
        reported: false, // TODO: reported 필드 추가 시 수정
      }));

      return {
        data,
        meta: {
          page,
          limit,
          totalCount: total,
          totalPages: Math.ceil(total / limit),
          sort,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get review list: ${error.message}`);
      throw new InternalServerErrorException('리뷰 목록을 찾을 수 없습니다.');
    }
  }

  // 공지사항 목록 조회
  async getNoticeList(dto: AdminQueryDto & { published?: string }) {
    try {
      const { page = 1, limit = 10, q, published, sort = 'createdAt:desc' } = dto;

      const queryBuilder = this.noticeRepository.createQueryBuilder('notice');

      if (q) {
        queryBuilder.andWhere(
          '(notice.title LIKE :q OR notice.content LIKE :q OR notice.id LIKE :q)',
          { q: `%${q}%` },
        );
      }

      if (published && published !== 'all') {
        const isPublished = published === 'true';
        queryBuilder.andWhere('notice.published = :published', { published: isPublished });
      }

      const [sortField, sortDirection] = sort.split(':');
      if (sortField && sortDirection) {
        queryBuilder.orderBy(
          `notice.${sortField}`,
          sortDirection.toUpperCase() as 'ASC' | 'DESC',
        );
      } else {
        queryBuilder.orderBy('notice.createdAt', 'DESC');
      }

      const [result, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const data = result.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        published: n.published,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      }));

      return {
        data,
        meta: {
          page,
          limit,
          totalCount: total,
          totalPages: Math.ceil(total / limit),
          sort,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get notice list: ${error.message}`);
      throw new InternalServerErrorException('공지사항 목록을 찾을 수 없습니다.');
    }
  }

  // 공지사항 생성
  async createNotice(dto: CreateNoticeDto) {
    try {
      const notice = this.noticeRepository.create({
        title: dto.title,
        content: dto.content,
        published: dto.published || false,
      });

      const saved = await this.noticeRepository.save(notice);
      this.logger.log(`Notice created: ${saved.id}`);

      return {
        id: saved.id,
        title: saved.title,
        content: saved.content,
        published: saved.published,
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to create notice: ${error.message}`);
      throw new InternalServerErrorException('공지사항 생성 중 오류가 발생했습니다.');
    }
  }

  // 공지사항 수정
  async updateNotice(id: string, dto: UpdateNoticeDto) {
    try {
      const notice = await this.noticeRepository.findOne({ where: { id } });
      if (!notice) {
        throw new NotFoundException('공지사항을 찾을 수 없습니다.');
      }

      if (dto.title !== undefined) notice.title = dto.title;
      if (dto.content !== undefined) notice.content = dto.content;
      if (dto.published !== undefined) notice.published = dto.published;

      const saved = await this.noticeRepository.save(notice);
      this.logger.log(`Notice updated: ${saved.id}`);

      return {
        id: saved.id,
        title: saved.title,
        content: saved.content,
        published: saved.published,
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to update notice: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('공지사항 수정 중 오류가 발생했습니다.');
    }
  }

  // 공지사항 삭제
  async deleteNotice(id: string) {
    try {
      const notice = await this.noticeRepository.findOne({ where: { id } });
      if (!notice) {
        throw new NotFoundException('공지사항을 찾을 수 없습니다.');
      }

      await this.noticeRepository.remove(notice);
      this.logger.log(`Notice deleted: ${id}`);
      return { message: '공지사항이 삭제되었습니다.' };
    } catch (error) {
      this.logger.error(`Failed to delete notice: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('공지사항 삭제 중 오류가 발생했습니다.');
    }
  }

  // 멘토링 세션 목록 조회
  async getMentoringSessions(dto: AdminQueryDto & { status?: string }) {
    try {
      const { page = 1, limit = 10, q, status, sort = 'createdAt:desc' } = dto;

      const queryBuilder = this.sessionRepository
        .createQueryBuilder('session')
        .leftJoinAndSelect('session.mentor', 'mentor')
        .leftJoinAndSelect('mentor.user', 'user');

      if (q) {
        queryBuilder.andWhere(
          '(session.title LIKE :q OR session.description LIKE :q OR user.name LIKE :q OR session.id LIKE :q)',
          { q: `%${q}%` },
        );
      }

      if (status && status !== 'all') {
        if (status === 'published') {
          queryBuilder.andWhere('session.isPublic = :isPublic', { isPublic: true });
        } else if (status === 'draft') {
          queryBuilder.andWhere('session.isPublic = :isPublic', { isPublic: false });
        }
      }

      const [sortField, sortDirection] = sort.split(':');
      if (sortField && sortDirection) {
        if (sortField === 'startAt') {
          // startAt은 reservation의 date와 startTime을 조합해야 함
          queryBuilder.orderBy('session.createdAt', sortDirection.toUpperCase() as 'ASC' | 'DESC');
        } else {
          queryBuilder.orderBy(`session.${sortField}`, sortDirection.toUpperCase() as 'ASC' | 'DESC');
        }
      } else {
        queryBuilder.orderBy('session.createdAt', 'DESC');
      }

      const [result, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        data: result.map((session) => ({
          id: session.id,
          title: session.title,
          mentorName: session.mentor?.user?.name || '알 수 없음',
          category: session.category,
          isPublic: session.isPublic,
          startAt: session.createdAt.toISOString(),
          price: session.price,
        })),
        meta: {
          page,
          limit,
          totalCount: total,
          totalPages: Math.ceil(total / limit),
          sort,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get mentoring sessions: ${error.message}`);
      throw new InternalServerErrorException('멘토링 세션 목록을 찾을 수 없습니다.');
    }
  }

  // 멘토링 세션 공개 상태 변경
  async toggleSessionPublic(id: string, isPublic: boolean) {
    try {
      const session = await this.sessionRepository.findOne({ where: { id } });
      if (!session) {
        throw new NotFoundException('멘토링 세션을 찾을 수 없습니다.');
      }

      session.isPublic = isPublic;
      await this.sessionRepository.save(session);

      this.logger.log(`Session ${id} public status changed to ${isPublic}`);
      return { message: `세션이 ${isPublic ? '공개' : '비공개'}로 변경되었습니다.` };
    } catch (error) {
      this.logger.error(`Failed to toggle session public: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('세션 상태 변경 중 오류가 발생했습니다.');
    }
  }

  // 멘토링 예약 목록 조회
  async getMentoringReservations(dto: AdminQueryDto & { status?: string }) {
    try {
      const { page = 1, limit = 10, q, status, sort = 'createdAt:desc' } = dto;

      const queryBuilder = this.reservationRepository
        .createQueryBuilder('reservation')
        .leftJoinAndSelect('reservation.session', 'session')
        .leftJoinAndSelect('session.mentor', 'mentor')
        .leftJoinAndSelect('mentor.user', 'mentorUser')
        .leftJoinAndSelect('reservation.mentee', 'mentee')
        .leftJoinAndSelect('reservation.payments', 'payment');

      if (q) {
        queryBuilder.andWhere(
          '(session.title LIKE :q OR mentee.name LIKE :q OR mentee.email LIKE :q OR reservation.id LIKE :q)',
          { q: `%${q}%` },
        );
      }

      if (status && status !== 'all') {
        if (status === 'pending') {
          queryBuilder.andWhere('reservation.status = :status', { status: 'pending' });
        } else if (status === 'confirmed') {
          queryBuilder.andWhere('reservation.status = :status', { status: 'confirmed' });
        } else if (status === 'cancelled') {
          queryBuilder.andWhere('reservation.status = :status', { status: 'cancelled' });
        }
      }

      const [sortField, sortDirection] = sort.split(':');
      if (sortField && sortDirection) {
        if (sortField === 'time') {
          queryBuilder.orderBy('reservation.date', sortDirection.toUpperCase() as 'ASC' | 'DESC');
          queryBuilder.addOrderBy('reservation.startTime', sortDirection.toUpperCase() as 'ASC' | 'DESC');
        } else {
          queryBuilder.orderBy(`reservation.${sortField}`, sortDirection.toUpperCase() as 'ASC' | 'DESC');
        }
      } else {
        queryBuilder.orderBy('reservation.createdAt', 'DESC');
      }

      const [result, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return {
        data: result.map((reservation) => ({
          id: reservation.id,
          sessionTitle: reservation.session?.title || '알 수 없음',
          menteeName: reservation.mentee?.name || '알 수 없음',
          time: `${reservation.date} ${reservation.startTime}`,
          status: reservation.status,
          paid: !!reservation.payments,
        })),
        meta: {
          page,
          limit,
          totalCount: total,
          totalPages: Math.ceil(total / limit),
          sort,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get mentoring reservations: ${error.message}`);
      throw new InternalServerErrorException('멘토링 예약 목록을 찾을 수 없습니다.');
    }
  }

  // 멘토링 예약 상태 변경
  async updateReservationStatus(id: string, status: 'confirmed' | 'cancelled') {
    try {
      const reservation = await this.reservationRepository.findOne({ where: { id } });
      if (!reservation) {
        throw new NotFoundException('멘토링 예약을 찾을 수 없습니다.');
      }

      reservation.status = status as any;
      await this.reservationRepository.save(reservation);

      this.logger.log(`Reservation ${id} status changed to ${status}`);
      return { message: `예약이 ${status === 'confirmed' ? '확정' : '취소'}되었습니다.` };
    } catch (error) {
      this.logger.error(`Failed to update reservation status: ${error.message}`);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('예약 상태 변경 중 오류가 발생했습니다.');
    }
  }
}
