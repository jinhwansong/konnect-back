import { PaginationDto } from '@/common/dto/page.dto';
import { MentoringStatus } from '@/common/enum/status.enum';
import {
  MentoringReservation,
  MentoringReview,
  MentoringSession,
  Users,
} from '@/entities';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create.review.dto';
import { UpdateReviewDto } from './dto/update.review.dto';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectRepository(MentoringReview)
    private readonly reviewRepository: Repository<MentoringReview>,
    @InjectRepository(MentoringSession)
    private readonly sessionRepository: Repository<MentoringSession>,
    private readonly dataSource: DataSource,
  ) {}

  async createReview(body: CreateReviewDto, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      try {
        const mentee = await manager.findOne(Users, { where: { id: userId } });
        if (!mentee) {
          throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }

        const reservation = await manager.findOne(MentoringReservation, {
          where: {
            id: body.reservationId,
          },
          relations: ['session', 'session.mentor', 'mentee'],
        });
        if (!reservation) {
          throw new NotFoundException('멘토링 예약 정보를 찾을 수 없습니다.');
        }

        if (reservation.mentee.id !== userId) {
          throw new BadRequestException(
            '본인의 예약만 후기를 작성할 수 있습니다.',
          );
        }

        if (reservation.status !== MentoringStatus.COMPLETED) {
          throw new BadRequestException(
            '완료된 멘토링만 후기를 작성할 수 있습니다.',
          );
        }
        
        const existing = await manager.findOne(MentoringReview, {
          where: {
            reservation: { id: body.reservationId },
          },
        });

        if (existing) {
          throw new ConflictException('이미 후기를 작성한 예약입니다.');
        }
        
        const review = manager.create(MentoringReview, {
          mentee,
          reservation,
          rating: body.rating,
          content: body.content,
          session: reservation.session,
        });
        
        const savedReview = await manager.save(MentoringReview, review);
        await this.recalculateSessionRating(review.session.id, manager);
        
        this.logger.log(`Review created successfully for reservation ${body.reservationId}`);
        return { message: '후기를 작성하셨습니다.' };
      } catch (error) {
        this.logger.error(`Failed to create review for reservation ${body.reservationId}: ${error.message}`);
        throw error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException
          ? error
          : new InternalServerErrorException('후기 작성 중 오류가 발생했습니다.');
      }
    });
  }

  async updateReview(id: string, body: UpdateReviewDto, userId: string) {
    try {
      const review = await this.reviewRepository.findOne({
        where: { id },
        relations: ['mentee', 'session'],
      });

      if (!review) {
        throw new NotFoundException('후기를 찾을 수 없습니다.');
      }

      if (review.mentee.id !== userId) {
        throw new ForbiddenException(
          '본인이 작성한 후기만 수정할 수 있습니다.',
        );
      }
      
      if (body.content) review.content = body.content;
      if (body.rating) review.rating = body.rating;

      await this.reviewRepository.save(review);
      await this.recalculateSessionRating(review.session.id);
      
      this.logger.log(`Review updated successfully: ${id}`);
      return { message: '후기를 수정하셨습니다.' };
    } catch (error) {
      this.logger.error(`Failed to update review ${id}: ${error.message}`);
      throw error instanceof NotFoundException || error instanceof ForbiddenException
        ? error
        : new InternalServerErrorException('후기 수정 중 오류가 발생했습니다.');
    }
  }
  async deleteReview(id: string, userId: string) {
    try {
      const review = await this.reviewRepository.findOne({
        where: { id },
        relations: ['mentee', 'session'],
      });
      if (!review) throw new NotFoundException('후기를 찾을 수 없습니다.');

      if (review.mentee.id !== userId)
        throw new ForbiddenException(
          '본인이 작성한 후기만 삭제할 수 있습니다.',
        );

      await this.reviewRepository.remove(review);
      await this.recalculateSessionRating(review.session.id);
      
      this.logger.log(`Review deleted successfully: ${id}`);
      return { message: '후기가 성공적으로 삭제되었습니다.' };
    } catch (error) {
      this.logger.error(`Failed to delete review ${id}: ${error.message}`);
      throw error instanceof NotFoundException || error instanceof ForbiddenException
        ? error
        : new InternalServerErrorException('후기 삭제 중 오류가 발생했습니다.');
    }
  }

  async getMyReviews(userId: string, { page = 1, limit = 10 }: PaginationDto) {
    try {
      const [reviews, total] = await this.reviewRepository
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.session', 'session')
        .leftJoinAndSelect('session.mentor', 'mentor')
        .leftJoinAndSelect('mentor.user', 'user')
        .where('review.mentee.id = :userId', { userId })
        .orderBy('review.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const items = reviews.map((res) => ({
        id: res.id,
        content: res.content,
        rating: res.rating,
        createdAt: res.createdAt,
        sessionTitle: res.session.title,
        mentorName: res.session.mentor.user.nickname,
      }));

      return {
        message: '내 후기 목록 조회 성공',
        totalPage: Math.ceil(total / limit),
        data: items,
      };
    } catch (error) {
      this.logger.error(`Failed to get my reviews for user ${userId}: ${error.message}`);
      throw new InternalServerErrorException(
        '내 후기 목록을 가져오는 중 오류가 발생했습니다.',
      );
    }
  }

  async getMentorReceivedReviews(
    userId: string,
    { page = 1, limit = 10 }: PaginationDto,
  ) {
    try {
      const [reviews, total] = await this.reviewRepository
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.session', 'session')
        .leftJoinAndSelect('session.mentor', 'mentor')
        .leftJoinAndSelect('mentor.user', 'mentorUser')
        .leftJoinAndSelect('review.mentee', 'mentee')
        .where('mentorUser.id = :userId', { userId })
        .orderBy('review.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const items = reviews.map((res) => ({
        id: res.id,
        content: res.content,
        rating: res.rating,
        createdAt: res.createdAt,
        sessionTitle: res.session.title,
        menteeName: res.mentee.nickname,
      }));

      return {
        message: '내가 받은 후기 조회 성공',
        totalPage: Math.ceil(total / limit),
        data: items,
      };
    } catch (error) {
      this.logger.error(`Failed to get mentor received reviews for user ${userId}: ${error.message}`);
      throw new InternalServerErrorException(
        '내가 받은 후기 조회 (멘토)을 가져오는 중 오류가 발생했습니다.',
      );
    }
  }

  private async recalculateSessionRating(sessionId: string, manager?: any) {
    const session = await (manager || this.sessionRepository).findOne(MentoringSession, {
      where: { id: sessionId },
      relations: ['reviews'],
    });
    if (!session) return;
    
    const [reviews, count] = await (manager || this.reviewRepository).findAndCount(MentoringReview, {
      where: { session: { id: sessionId } },
    });
    
    const avg = count > 0 ? reviews.reduce((sum, acc) => sum + acc.rating, 0) / count : 0;
    session.averageRating = avg;
    session.reviewCount = count;
    
    await (manager || this.sessionRepository).save(MentoringSession, session);
    this.logger.log(`Session rating recalculated for session ${sessionId}: ${avg.toFixed(2)} (${count} reviews)`);
  }
}
