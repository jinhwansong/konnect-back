import { LikeType } from '@/common/enum/status.enum';
import { Article, Like, Mentors, Users } from '@/entities';
import { RedisService } from '@/redis/redis.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleQueryDto, CreateArticleDto } from './dto/article.dto';
import striptags from 'striptags';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Mentors)
    private readonly mentorRepository: Repository<Mentors>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly redisService: RedisService,
  ) {}
  async getArticles({
    page = 1,
    limit = 10,
    sort = 'latest',
    category,
  }: ArticleQueryDto) {
    const skip = (page - 1) * limit;
    const article = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoin('article.likes', 'likes')
      .loadRelationCountAndMap('article.likeCount', 'article.likes')
      .select([
        'article.id',
        'article.title',
        'article.content',
        'article.thumbnail',
        'article.createdAt',
        'article.views',
        'article.category',
        'author.id',
        'author.nickname',
        'author.image',
      ]);

    if (category) {
      article.andWhere('article.category = :category', { category });
    }
    console.log(sort);
    switch (sort) {
      case 'likes':
        article
          .addSelect(
            (subQuery) =>
              subQuery
                .select('COUNT(*)')
                .from('likes', 'likes')
                .where('likes.articleId = article.id'),
            'likeCount',
          )
          .orderBy('likeCount', 'DESC');
        break;
      case 'latest':
      default:
        article.orderBy('article.createdAt', 'DESC');
    }
    const entities = await article.skip(skip).take(limit).getMany();

    const data = entities.map((entity) => ({
      id: entity.id,
      title: entity.title,
      thumbnail: `${process.env.SERVER_HOST}${entity.thumbnail}`,
      views: entity.views,
      likeCount: (entity as any).likeCount ?? 0,
      category: entity.category,
      createdAt: entity.createdAt,
      content: striptags(entity.content)
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split('\n')
        .slice(0, 2)
        .join('\n'),
      author: {
        id: entity.author.id,
        nickname: entity.author.nickname,
        image: entity.author.image,
      },
    }));

    const total = await article.getCount();

    return {
      totalPages: Math.ceil(total / limit),
      data,
    };
  }
  async deleteArticle(id: string, userId: string) {
    try {
      const article = await this.articleRepository.findOne({
        where: { id },
        relations: ['author'],
      });

      if (!article) throw new NotFoundException('아티클을 찾을 수 없습니다.');
      if (article.author.id !== userId)
        throw new ForbiddenException(
          '본인이 작성한 아티클만 삭제할 수 있습니다.',
        );
      await this.articleRepository.remove(article);
      return { message: '아티클이 성공적으로 삭제되었습니다.' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        '아티클 삭제 중 오류가 발생했습니다.',
      );
    }
  }
  async createArticle(
    body: CreateArticleDto,
    userId: string,
    thumbnail: Express.Multer.File | null,
  ) {
    try {
      const mentor = await this.mentorRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });
      if (!mentor) throw new NotFoundException('멘토를 찾을 수 없습니다.');
      const thumbnailUrls = thumbnail
        ? `/uploads/article/${thumbnail.filename}`
        : null;
      const article = this.articleRepository.create({
        ...body,
        thumbnail: thumbnailUrls,
        author: { id: userId },
      });

      return await this.articleRepository.save(article);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        '아티클 생성 중 오류가 발생했습니다.',
      );
    }
  }
  async getArticleDetail(id: string, userId?: string, clientIp?: string) {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author', 'likes'],
    });
    if (!article) throw new NotFoundException('아티클을 찾을 수 없습니다.');
    const redisKey = userId
      ? `article:viewed:${id}:user:${userId}`
      : `article:viewed:${id}:user:${clientIp}`;

    const alreadyViewed = await this.redisService.existsCount(redisKey);
    if (!alreadyViewed) {
      article.views += 1;
      await this.articleRepository.save(article);
      await this.redisService.saveCount(redisKey, '1');
    }
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      createdAt: article.createdAt,
      views: article.views,
      category: article.category,
      likeCount: article.likes.length ?? 0,
      author: {
        id: article.author.id,
        nickname: article.author.nickname,
        image: article.author.image,
      },
    };
  }
  async updateArticle(
    id: string,
    body: CreateArticleDto,
    userId: string,
    thumbnail: Express.Multer.File | null,
  ) {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!article) throw new NotFoundException('아티클을 찾을 수 없습니다.');
    if (article.author.id !== userId)
      throw new ForbiddenException('본인만 수정할 수 있습니다.');

    article.title = body.title ?? article.title;
    article.content = body.content ?? article.content;
    article.category = body.category ?? article.category;

    if (thumbnail) {
      article.thumbnail = `/uploads/article/${thumbnail.filename}`;
    }

    return await this.articleRepository.save(article);
  }
  async likedArticle(id: string, userId: string) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');
      const article = await this.articleRepository.findOne({
        where: { id },
      });
      if (!article) throw new NotFoundException('아티클을 찾을 수 없습니다.');
      const existing = await this.likeRepository.findOne({
        where: {
          article: { id: id },
          user: { id: userId },
        },
      });

      if (existing) {
        await this.likeRepository.remove(existing);
        return { message: '좋아요 취소됨', liked: false };
      }
      const like = this.likeRepository.create({
        targetType: LikeType.ARTICLE,
        article,
        user,
      });
      await this.likeRepository.save(like);
      return { message: '좋아요 추가됨', liked: true };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        '아티클 좋아요 중 오류가 발생했습니다.',
      );
    }
  }

  async getLikedArticles(articleIds: string[], userId: string) {
    const liked = await this.likeRepository
      .createQueryBuilder('like')
      .select('like.articleId', 'articleId')
      .where('like.userId = :userId', { userId })
      .andWhere('like.articleId IN (:...articleIds)', { articleIds })
      .getRawMany();

    return liked.map((l) => l.articleId);
  }
  async uploadEditorImages(files: { images?: Express.Multer.File[] }) {
    const uploaded = files.images;
    if (!uploaded || uploaded.length === 0) {
      throw new BadRequestException('이미지 파일이 없습니다.');
    }

    const urls = uploaded.map(
      (file) => `${process.env.SERVER_HOST}/uploads/article/${file.filename}`,
    );
    return { urls };
  }
}
