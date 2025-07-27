import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { MentoringReview } from './mentoring-review.entity';
import { Users } from './user.entity';
import { LikeType } from '@/common/enum/status.enum';

@Entity({ schema: 'konnect', name: 'likes' })
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('enum', {
    enum: LikeType,
    nullable: true,
    default: LikeType.ARTICLE,
  })
  targetType: LikeType;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ApiProperty({ description: '좋아요를 누른 사용자', required: true })
  @ManyToOne(() => Users, (user) => user.likes, {
    onDelete: 'CASCADE',
  })
  user: Users;

  @ApiProperty({ description: '좋아요 대상 (멘토링 후기)', required: false })
  @ManyToOne(() => MentoringReview, (review) => review.likes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  review?: MentoringReview;
  @ApiProperty({ description: '좋아요 대상 (아티클)', required: false })
  @ManyToOne(() => Article, (article) => article.likes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  article?: Article;
}
