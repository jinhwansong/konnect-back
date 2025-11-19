import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MentoringReview, MentoringSession } from '@/entities';
import { SessionQueryDto } from './dto/session.dto';
import { PaginationDto } from '@/common/dto/page.dto';
import sanitizeHtml from 'sanitize-html';

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
      }));
      return {
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
        session.orderBy('session.createdAt', 'DESC');
        break;
      case 'priceAsc':
        session.orderBy('session.price', 'ASC');
        break;
      case 'priceDesc':
        session.orderBy('session.price', 'DESC');
        break;
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
          content: review.content.split('\n').slice(0, 3).join('\n'),
          rating: review.rating,
          createdAt: review.createdAt,
          nickname: review.mentee.nickname,
        }));
        const cleanText = sanitizeHtml(item.description, {
          allowedTags: [], // 태그 전부 제거
          allowedAttributes: {}, // 속성도 전부 제거
        });
const processedDescription = cleanText
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ') // 여러 스페이스 하나로
  .trim()
  .split('\n')
  .slice(0, 3)
  .join('\n');
        return {
          id: item.id,
          title: item.title,
          description: processedDescription,
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
      totalPages: Math.ceil(total / limit),
      data,
    };
  }
  async getSessionDetail(sessionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['mentor', 'mentor.user'],
    });
    if (!session) {
      throw new NotFoundException('세션을 찾을 수 없습니다.');
    }
    return {
      id: session.id,
      title: session.title,
      description: session.description,
      price: session.price,
      duration: session.duration,
      category: session.category,
      rating: session.averageRating,
      career: session.mentor.career,
      position: session.mentor.position,
      company: session.mentor.isCompanyHidden
        ? '비공개'
        : session.mentor.company,
      nickname: session.mentor.user.nickname,
      userId: session.mentor.id,
      image: session.mentor.user.image,
      createdAt: session.createdAt,
    };
  }
}
