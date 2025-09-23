import { LikeType, NotificationType } from '@/common/enum/status.enum';
import { Article, Like, Mentors, Users } from '@/entities';
import { RedisService } from '@/redis/redis.service';
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
import { ArticleQueryDto, CreateArticleDto } from './dto/article.dto';
import striptags from 'striptags';
import { Comment } from '@/entities/comment.entity';
import { CreateCommentDto, PatchCommentDto } from './dto/comment.dto';
import { PaginationDto } from '@/common/dto/page.dto';
import { NotificationService } from '@/notification/notification.service';

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);

  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Mentors)
    private readonly mentorsRepository: Repository<Mentors>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly redisService: RedisService,
    private readonly notificationService: NotificationService,

    private readonly dataSource: DataSource,
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
      thumbnail: entity.thumbnail,
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
      this.logger.log(`Article deleted successfully: ${id}`);
      return { message: '아티클이 성공적으로 삭제되었습니다.' };
    } catch (error) {
      this.logger.error(`Failed to delete article ${id}: ${error.message}`);
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
      const mentor = await this.mentorsRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });
      if (!mentor) throw new NotFoundException('멘토를 찾을 수 없습니다.');

      const thumbnailUrls = thumbnail
        ? `uploads/article/${thumbnail.filename}`
        : null;

      const article = this.articleRepository.create({
        ...body,
        thumbnail: thumbnailUrls,
        author: { id: userId },
      });

      const savedArticle = await this.articleRepository.save(article);
      this.logger.log(`Article created successfully: ${savedArticle.id}`);
      return savedArticle;
    } catch (error) {
      this.logger.error(
        `Failed to create article: ${error.message}`,
        error.stack,
      );
      throw error instanceof NotFoundException ||
        error instanceof ForbiddenException
        ? error
        : new InternalServerErrorException(
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
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

      const article = await this.articleRepository.findOne({
        where: { id },
        relations: ['author'],
      });
      if (!article) throw new NotFoundException('아티클을 찾을 수 없습니다.');

      const existing = await this.likeRepository.findOne({
        where: {
          article: { id },
          user: { id: userId },
        },
      });

      if (existing) {
        await this.likeRepository.remove(existing);
        this.logger.log(
          `Article like removed for article ${id} by user ${userId}`,
        );
        return { message: '좋아요 취소됨', liked: false };
      }

      const like = this.likeRepository.create({
        targetType: LikeType.ARTICLE,
        article,
        user,
      });
      await this.likeRepository.save(like);
      this.logger.log(`Article like added for article ${id} by user ${userId}`);

      if (article.author.id !== userId) {
        await this.notificationService.save(
          null,
          article.author.id,
          NotificationType.ARTICLE,
          `${user.nickname}님이 회원님의 아티클을 좋아합니다.`,
          `/articles/${article.id}`,
        );
      }

      return { message: '좋아요 추가됨', liked: true };
    } catch (error) {
      this.logger.error(
        `Failed to toggle like for article ${id}: ${error.message}`,
        error.stack,
      );
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

    const image = uploaded.map(
      (file) => `${process.env.SERVER_HOST}/uploads/article/${file.filename}`,
    );
    return { image };
  }

  /** 댓글부분 */
  async deleteComment(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');
    if (comment.author.id !== userId)
      throw new ForbiddenException('삭제 권한이 없습니다.');
    await this.commentRepository.remove(comment);
    return { message: '댓글이 삭제되었습니다.' };
  }
  async updateComment(id: string, userId: string, body: PatchCommentDto) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');
    if (comment.author.id !== userId)
      throw new ForbiddenException('수정 권한이 없습니다.');
    comment.content = body.content;
    this.commentRepository.save(comment);
    return { message: '댓글이 수정되었습니다.' };
  }
  async getComment(articleId: string, { page = 1, limit = 10 }: PaginationDto) {
    try {
      const queryBuilder = this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.author', 'author')
        .leftJoinAndSelect('comment.children', 'children')
        .leftJoinAndSelect('children.author', 'childrenAuthor')
        .where('comment.articleId = :articleId', { articleId })
        .andWhere('comment.parentId IS NULL')
        .orderBy('comment.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);
      const [result, total] = await queryBuilder.getManyAndCount();
      const data = result.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: {
          nickname: comment.author.nickname,
          image: comment.author.image,
        },
        children: comment.children.map((child) => ({
          id: child.id,
          content: child.content,
          createdAt: child.createdAt,
          author: {
            nickname: child.author.nickname,
            image: child.author.image,
          },
        })),
      }));
      const totalAll = await this.commentRepository.count({
        where: { article: { id: articleId } },
      });
      return {
        data,
        totalAll,
        totalPage: Math.ceil(total / limit),
        message: '댓글 목록을 조회했습니다.',
      };
    } catch (error) {
      throw new InternalServerErrorException('댓글 목록 를 찾을 수 없습니다.');
    }
  }
  async createComment(id: string, userId: string, body: CreateCommentDto) {
    return this.dataSource.transaction(async (manager) => {
      try {
        const article = await manager.findOne(Article, {
          where: { id },
          relations: ['author'],
        });
        if (!article) throw new NotFoundException('아티클을 찾을 수 없습니다.');

        const author = await manager.findOne(Users, { where: { id: userId } });
        if (!author) throw new NotFoundException('사용자를 찾을 수 없습니다.');

        const comment = manager.create(Comment, {
          content: body.content,
          article,
          author,
        });

        let parent: Comment | null = null;
        if (body.parentId) {
          const parent = await manager.findOne(Comment, {
            where: { id: body.parentId },
          });
          if (!parent)
            throw new NotFoundException('부모 댓글을 찾을 수 없습니다.');
          comment.parent = parent;
        }

        await manager.save(Comment, comment);
        this.logger.log(`Comment created successfully for article ${id}`);

        if (parent) {
          // 대댓글 → 부모 댓글 작성자
          if (parent.author.id !== userId) {
            await this.notificationService.save(
              manager,
              parent.author.id,
              NotificationType.ARTICLE,
              `${author.nickname}님이 회원님의 댓글에 답글을 남겼습니다.`,
              `/articles/${article.id}#comment-${comment.id}`,
            );
          }
        } else {
          // 댓글 → 아티클 작성자
          if (article.author.id !== userId) {
            await this.notificationService.save(
              manager,
              article.author.id,
              NotificationType.ARTICLE,
              `${author.nickname}님이 회원님의 아티클에 댓글을 남겼습니다.`,
              `/articles/${article.id}#comment-${comment.id}`,
            );
          }
        }

        return { message: '댓글/대댓글이 작성되었습니다.' };
      } catch (error) {
        this.logger.error(
          `Failed to create comment for article ${id}: ${error.message}`,
        );
        throw error instanceof NotFoundException
          ? error
          : new InternalServerErrorException(
              '댓글 작성 중 오류가 발생했습니다.',
            );
      }
    });
  }
}
