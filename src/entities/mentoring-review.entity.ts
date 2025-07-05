import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Mentors } from "./mentor.entity";
import { Like } from "./like.entity";
import { Users } from "./user.entity";

@Entity({ schema: 'konnect', name: 'mentoring_reviews' })
export class MentoringReview {
  @ApiProperty({
    example: 'b1a8f3e1-3b0f-4e9b-98a2-c4f0e6d3a3b4',
    description: '멘토링후기 UUID',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(5)
  @ApiProperty({ example: 5, description: '평점 (1 ~ 5)', required: true })
  @Column({ type: 'int', nullable: false })
  rating: number;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '정말 유익한 멘토링이었습니다!',
    description: '후기 내용',
    required: true,
  })
  @Column({ type: 'text', nullable: false })
  content: string;

  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '후기 등록일',
    required: false,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '후기 수정일',
    required: false,
  })
  @UpdateDateColumn()
  updatedAt: Date;
  @ApiProperty({ description: '멘토링 후기 작성자 (멘티)', required: true })
  @ManyToOne(() => Users, (user) => user.review, {
    onDelete: 'CASCADE',
  })
  mentee: Users;

  @ApiProperty({ description: '리뷰 대상 멘토', required: true })
  @ManyToOne(() => Mentors, (mentor) => mentor.review, {
    onDelete: 'CASCADE',
  })
  mentor: Mentors;
  @OneToMany(() => Like, (like) => like.review)
  likes: Like[];
}