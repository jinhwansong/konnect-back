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
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create.review.dto';
import { UpdateReviewDto } from './dto/update.review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(MentoringReview)
    private readonly reviewRepository: Repository<MentoringReview>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(MentoringReservation)
    private readonly reservationRepository: Repository<MentoringReservation>,

    @InjectRepository(MentoringSession)
    private readonly sessionRepository: Repository<MentoringSession>,
  ) {}

  async createReview(body: CreateReviewDto, userId: string) {
    try {
      const mentee = await this.userRepository.findOneBy({ id: userId });
      const reservation = await this.reservationRepository.findOne({
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
      const existing = await this.reviewRepository.findOne({
        where: {
          reservation: { id: body.reservationId },
        },
      });

      if (existing) {
        throw new ConflictException('이미 후기를 작성한 예약입니다.');
      }
      const review = this.reviewRepository.create({
        mentee,
        reservation,
        rating: body.rating,
        content: body.content,
        session: reservation.session,
      });
      await this.reviewRepository.save(review);

      await this.recalculateSessionRating(review.session.id);
      return { message: '후기를 작성하셨습니다.' };
    } catch (error) {
      console.log('error : ', error);
      throw new InternalServerErrorException(
        '후기 작성 중 오류가 발생했습니다.',
      );
    }
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
      return { message: '후기를 수정하셨습니다.' };
    } catch (error) {
      console.error('error : ', error);
      throw new InternalServerErrorException(
        '후기 수정 중 오류가 발생했습니다.',
      );
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
      return { message: '후기가 성공적으로 삭제되었습니다.' };
    } catch (error) {
      throw new InternalServerErrorException(
        '후기 삭제 중 오류가 발생했습니다.',
      );
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
      console.error('error : ', error);
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
      throw new InternalServerErrorException(
        '내가 받은 후기 조회 (멘토)을 가져오는 중 오류가 발생했습니다.',
      );
    }
  }

  private async recalculateSessionRating(sessionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['reviews'],
    });
    if (!session) return;
    const [reviews, count] = await this.reviewRepository.findAndCount({
      where: { session: { id: sessionId } },
    });
    const avg =
      count > 0 ? reviews.reduce((sum, acc) => sum + acc.rating, 0) / count : 0;
    session.averageRating = avg;
    session.reviewCount = count;
    await this.sessionRepository.save(session);
  }
}
