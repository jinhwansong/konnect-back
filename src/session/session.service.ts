import { PaginationDto } from '@/common/dto/page.dto';
import { MentoringReview } from '@/entities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SessionService {
    constructor(
        @InjectRepository(MentoringReview)
        private readonly reviewRepository: Repository<MentoringReview>
    ){}
    async getMentorReviews(sessionId: string, { page = 1, limit = 10 }: PaginationDto){
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
                data:items,
            };
        } catch (error) {
                throw new InternalServerErrorException('후기 목록을 가져오는 중 오류가 발생했습니다.');
        }
    }
}
