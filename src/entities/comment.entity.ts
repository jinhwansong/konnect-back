import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ schema: 'konnect', name: 'comment' })
export class Comment {
  @ApiProperty({
    example: 'b1a8f3e1-3b0f-4e9b-98a2-c4f0e6d3a3b4',
    description: '댓글 UUID',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '정말 좋은 글이에요!',
    description: '댓글 내용',
    required: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  content: string;

  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '댓글 등록일',
    required: false,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '댓글 수정일',
    required: false,
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // @ApiProperty({ description: '댓글 작성자', required: true })
  // @ManyToOne(() => Users, (user) => user.comments, {
  //   onDelete: 'CASCADE',
  // })
  // user: Users;
  // @ApiProperty({ description: '댓글 대상 (아티클)', required: false })
  // @ManyToOne(() => Article, (article) => article.comments, {
  //   nullable: true,
  //   onDelete: 'CASCADE',
  // })
  // article: Article;
}