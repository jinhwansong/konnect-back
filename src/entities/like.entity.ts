import { LikeType } from "@/common/enum/status.enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ schema: 'konnect', name: 'likes' })
export class Like {
  @ApiProperty({
    example: 'b1a8f3e1-3b0f-4e9b-98a2-c4f0e6d3a3b4',
    description: '좋아요 UUID',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @IsEnum(LikeType)
  @ApiProperty({
    example: LikeType.ARTICLE,
    description: '좋아요 대상 타입 (REVIEW, ARTICLE)',
    enum: LikeType,
    required: true,
  })
  @Column('enum', {
    enum: LikeType,
    nullable: true,
    default: LikeType.ARTICLE,
  })
  targetType: LikeType;

  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '좋아요 등록일',
    required: false,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '좋아요 수정일',
    required: false,
  })
  @UpdateDateColumn()
  updatedAt: Date;
  // @ApiProperty({ description: '좋아요를 누른 사용자', required: true })
  // @ManyToOne(() => Users, (user) => user.likes, {
  //   onDelete: 'CASCADE',
  // })
  // user: Users;

  // @ApiProperty({ description: '좋아요 대상 (멘토링 후기)', required: false })
  // @ManyToOne(() => MentoringReview, (review) => review.likes, {
  //   nullable: true,
  //   onDelete: 'CASCADE',
  // })
  // review?: MentoringReview;
  // @ApiProperty({ description: '좋아요 대상 (아티클)', required: false })
  // @ManyToOne(() => Article, (article) => article.likes, {
  //   nullable: true,
  //   onDelete: 'CASCADE',
  // })
  // article?: Article;
}