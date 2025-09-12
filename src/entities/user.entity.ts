import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Like } from './like.entity';
import { Mentors } from './mentor.entity';
import { MentoringReservation } from './mentoring-reservation.entity';
import { MentoringReview } from './mentoring-review.entity';
import { Payment } from './payment.entity';
import { SocialAccount } from './social-account.entity';
import { UserRole } from '@/common/enum/status.enum';
import { Comment } from './comment.entity';

@Entity({ schema: 'konnect', name: 'users' })
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  email: string;
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  password: string | null;

  @Column({ type: 'varchar', length: 30, unique: true, nullable: false })
  nickname: string;
  @Column({ type: 'varchar', length: 30, nullable: false })
  name: string;
  @Column({ type: 'varchar', length: 11, unique: true, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MENTEE })
  role: UserRole;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt: Date;
  @ApiProperty({ description: '사용자와 연결된 멘토', required: true })
  @OneToOne(() => Mentors, (mentor) => mentor.user, { cascade: true })
  mentorProfile: Mentors;
  @ApiProperty({ description: '소셜로그인', required: true })
  @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user)
  socialAccounts: SocialAccount[];
  @ApiProperty({ description: '멘토링 리뷰(멘티)', required: true })
  @OneToMany(() => MentoringReview, (review) => review.mentee)
  review: MentoringReview[];
  @ApiProperty({ description: '아티클 댓글', required: true })
  @OneToMany(() => Comment, (comments) => comments.author)
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
