import { PaginationDto } from '@/common/dto/page.dto';
import { MentoringReview, MentoringSession } from '@/entities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionQueryDto } from './dto/session.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(MentoringReview)
    private readonly reviewRepository: Repository<MentoringReview>,
    @InjectRepository(MentoringSession)
    private readonly sessionRepository: Repository<MentoringSession>,
  ) {}
  async getMentorReviews(
    sessionId: string,
    { page = 1, limit = 10 }: PaginationDto,
  ) {
    try {
      const [review, total] = await this.reviewRepository
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.mentee', 'mentee')
        .leftJoin('review.reservation', 'reservation')
        .leftJoin('reservation.session', 'session')
        .loadRelationCountAndMap('review.likeCount', 'review.likes')
        .where('session.id = :sessionId', { sessionId })
        .orderBy('review.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
      const items = review.map((res) => ({
        id: res.id,
        content: res.content,
        createdAt: res.createdAt,
        mentee: res.mentee,
        rating: res.rating,
        likeCount: res.likes ?? 0,
      }));
      return {
        message: '리뷰 목록 조회 성공',
        totalPages: Math.ceil(total / limit),
        data: items,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        '후기 목록을 가져오는 중 오류가 발생했습니다.',
      );
    }
  }
  async getSession({
    page = 1,
    limit = 10,
    sort = 'latest',
    category,
  }: SessionQueryDto) {
    const skip = (page - 1) * limit;
    const session = this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.mentor', 'mentor')
      .leftJoinAndSelect('mentor.user', 'user')
      .select([
        'session.id',
        'session.title',
        'session.description',
        'session.price',
        'session.duration',
        'session.createdAt',
        'session.averageRating',
        'session.category',
        'mentor.id',
        'mentor.position',
        'mentor.career',
        'mentor.company',
        'mentor.isCompanyHidden',
        'mentor.createdAt',
        'user.id',
        'user.nickname',
        'user.image',
      ])
      .where('session.isPublic = :isPublic', { isPublic: true });

    if (category) {
      session.andWhere('session.category = :category', { category });
    }

    switch (sort) {
      case 'mentor':
        session.orderBy('mentor.createdAt', 'DESC');
        break;
      case 'rating':
        session.orderBy('session.averageRating', 'DESC');
        break;
      case 'latest':
      default:
        session.orderBy('session.createdAt', 'DESC');
    }

    const [sessions, total] = await session
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = await Promise.all(
      sessions.map(async (item) => {
        const reviews = await this.reviewRepository.find({
          where: {
            reservation: {
              session: { id: item.id },
            },
          },
          relations: ['mentee'],
          order: { createdAt: 'DESC' },
          take: 3,
        });
        const previewReviews = reviews.map((review) => ({
          content: review.content,
          rating: review.rating,
          createdAt: review.createdAt,
          nickname: review.mentee.nickname,
        }));
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          duration: item.duration,
          previewReviews,
          mentor: {
            position: item.mentor.position,
            career: item.mentor.career,
            company: item.mentor.isCompanyHidden
              ? '비공개'
              : item.mentor.company,
            nickname: item.mentor.user.nickname,
            image: item.mentor.user.image,
          },
        };
      }),
    );

    return {
      message: '세션 목록 조회 성공',
      totalPages: Math.ceil(total / limit),
      data,
    };
  }
  async getSessionDetail(sessionId: string) {}
}
