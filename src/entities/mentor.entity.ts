import { Status } from '@/common/enum/status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Users } from './user.entity';
import { MentoringSession } from './mentoring-session.entity';
import { MentoringReview } from './mentoring-review.entity';
import { MentoringSchedule } from './mentoring-schedule.entity';

@Entity({ schema: 'konnect', name: 'mentors' })
export class Mentors {
  @ApiProperty({
    example: 'b1a8f3e1-3b0f-4e9b-98a2-c4f0e6d3a3b4',
    description: '사용자 UUID',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user@example.com',
    description: '이메일 (로그인용)',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Google',
    description: '소속 회사명',
    required: false,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  company: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '10년차 프론트엔드 개발자입니다.',
    description: '멘토 자기소개',
    required: true,
  })
  @Column({ type: 'text', nullable: false })
  introduce: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '프론트엔드',
    description: '직책',
    required: false,
  })
  @Column({ type: 'varchar', nullable: true })
  position: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'React, Next.js',
    description: '전문 분야',
    required: true,
  })
  @Column({ type: 'varchar', nullable: false })
  expertise: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '주니어(1~3년)',
    description: '연차',
    required: true,
  })
  @Column('varchar')
  career: string;
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({
    example: 'https://portfolio.example.com',
    description: '포트폴리오 페이지 url',
    required: true,
  })
  @Column({ type: 'varchar', nullable: false })
  portfolio: string;
  @ApiProperty({
    example: Status.PENDING,
    description: '승인 여부',
    enum: Status,
    required: true,
  })
  @IsBoolean()
  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status: Status;
  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '멘토 등록일',
    required: false,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '멘토 정보 수정일',
    required: false,
  })
  @UpdateDateColumn()
  updatedAt: Date;
  @ApiProperty({ description: '멘토와 연결된 사용자', required: true })
  @OneToOne(() => Users, (user) => user.mentorProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;
  @ApiProperty({ description: '멘토링 세션', required: true })
  @OneToMany(() => MentoringSession, (session) => session.mentor)
  sessions: MentoringSession[];
  @ApiProperty({ description: '멘토링 리뷰(멘토)', required: true })
  @OneToMany(() => MentoringReview, (review) => review.mentor)
  review: MentoringReview[];
  @ApiProperty({ description: '멘토링 시간 조정', required: true })
  @OneToMany(() => MentoringSchedule, (schedule) => schedule.mentor)
  schedule: MentoringSchedule[];
}
