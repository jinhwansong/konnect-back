import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Like } from './like.entity';
import { Users } from './user.entity';
import { ArticleCategory } from '@/common/enum/category.enum';
import { Comment } from './comment.entity';

@Entity({ schema: 'konnect', name: 'articles' })
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;
  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail: string;

  @Column({ type: 'enum', enum: ArticleCategory, nullable: true })
  category: ArticleCategory;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  @ApiProperty({ description: '작성자', required: true })
  @ManyToOne(() => Users, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  author: Users;
  @ApiProperty({ example: 0, description: '조회수', required: true })
  @Column({ type: 'int', default: 0 })
  views: number;

  @OneToMany(() => Like, (like) => like.article)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.article)
  comments: Comment[];
}
