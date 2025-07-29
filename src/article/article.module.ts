import { Article, Mentors, Users, Like } from '@/entities';
import { RedisService } from '@/redis/redis.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Mentors, Like, Users])],
  controllers: [ArticleController],
  providers: [ArticleService, RedisService],
  exports: [ArticleService],
})
export class ArticleModule {}
