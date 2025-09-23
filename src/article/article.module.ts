import { Article, Mentors, Users, Like, Comment } from '@/entities';
import { RedisService } from '@/redis/redis.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Mentors, Like, Users, Comment]),
    NotificationModule,
  ],
  controllers: [ArticleController],
  providers: [ArticleService, RedisService],
  exports: [ArticleService],
})
export class ArticleModule {}
