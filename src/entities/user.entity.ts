import { UserRole } from '@/common/enum/status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsBase64, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Mentors } from './mentor.entity';
import { SocialAccount } from './social-account.entity';
import { MentoringReview } from './mentoring-review.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import { MentoringReservation } from './mentoring-reservation.entity';
import { Payment } from './payment.entity';

@Entity({ schema: 'konnect', name: 'users' })
export class Users {
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
  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
    nullable: false,
  })
  email: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'P@ssw0rd!',
    description: '비밀번호 (해시 저장)',
    required: false,
  })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  password: string | null;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'john_doe', description: '닉네임', required: true })
  @Column({ type: 'varchar', length: 30, unique: true, nullable: false })
  nickname: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'John Doe',
    description: '사용자 이름',
    required: true,
  })
  @Column({ type: 'varchar', length: 30, nullable: false })
  name: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '01012345678',
    description: '휴대폰번호 (형식: 01012345678)',
    required: false,
  })
  @Column({ type: 'varchar', length: 11, unique: true, nullable: false })
  phone: string;
  @IsBase64()
  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: '프로필 이미지 URL',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  image: string;
  @ApiProperty({
    example: UserRole.MENTEE,
    description: '사용자 등급 (MENTOR, MENTEE, ADMIN)',
    required: true,
    enum: UserRole,
  })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.MENTEE })
  role: UserRole;
  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '계정 생성일',
    required: false,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '계정 정보 수정일',
    required: false,
  })
  @UpdateDateColumn()
  updatedAt: Date;
  @ApiProperty({ description: '사용자와 연결된 멘토', required: true })
  @OneToOne(() => Mentors, (mentor) => mentor.user, { cascade: true })
  @JoinColumn()
  mentorProfile: Mentors;
  @ApiProperty({ description: '소셜로그인', required: true })
  @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user)
  socialAccounts: SocialAccount[];
  @ApiProperty({ description: '멘토링 리뷰(멘티)', required: true })
  @OneToMany(() => MentoringReview, (review) => review.mentee)
  review: MentoringReview[];
  @ApiProperty({ description: '아티클 댓글', required: true })
  @OneToMany(() => Comment, (comments) => comments.user)
  comments: Comment[];
  @ApiProperty({ description: '좋아요 (멘토링, 아티클)', required: true })
  @OneToMany(() => Like, (likes) => likes.user)
  likes: Like[];
  @ApiProperty({ description: '멘토링 예약', required: true })
  @OneToMany(() => MentoringReservation, (reservation) => reservation.mentee)
  reservation: MentoringReservation[];
  @ApiProperty({ description: '멘토링 결제', required: true })
  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];
}
