import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Comment } from "./comment.entity";
import { Like } from "./like.entity";
import { Users } from "./user.entity";

@Entity({ schema: 'konnect', name: 'articles' })
export class Article {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  content: string;
  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail: string;
  
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