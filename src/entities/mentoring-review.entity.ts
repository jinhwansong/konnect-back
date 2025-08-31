import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Like } from './like.entity';
import { MentoringReservation } from './mentoring-reservation.entity';
import { MentoringSession } from './mentoring-session.entity';
import { Users } from './user.entity';

@Entity({ schema: 'konnect', name: 'mentoring_reviews' })
export class MentoringReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'int', nullable: false })
  rating: number;
  @Column({ type: 'text', nullable: false })
  content: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ApiProperty({ description: '멘토링 후기 작성자 (멘티)', required: true })
  @ManyToOne(() => Users, (user) => user.review, {
    onDelete: 'CASCADE',
  })
  mentee: Users;

  @OneToMany(() => Like, (like) => like.review)
  likes: Like[];

  @OneToOne(() => MentoringReservation, (reservation) => reservation.review, {
    onDelete: 'CASCADE',
  })
  @ApiProperty({ description: '후기를 남긴 멘토링 예약 정보', required: true })
  @JoinColumn()
  reservation: MentoringReservation;

  @ManyToOne(() => MentoringSession, (session) => session.reviews, {
    onDelete: 'CASCADE',
  })
  @ApiProperty({ description: '해당 리뷰가 속한 멘토링 세션' })
  session: MentoringSession;
}
