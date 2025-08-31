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
import { MentoringReview } from './mentoring-review.entity';
import { MentoringSession } from './mentoring-session.entity';
import { Payment } from './payment.entity';
import { Users } from './user.entity';
import { MentoringStatus } from '@/common/enum/status.enum';

@Entity({ schema: 'konnect', name: 'mentoring_reservation' })
export class MentoringReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MentoringStatus,
    default: MentoringStatus.PENDING,
  })
  status: MentoringStatus;

  @Column({ type: 'date', nullable: false })
  date: string;
  @Column({ type: 'time', nullable: false })
  startTime: string;

  @Column({ type: 'time', nullable: false })
  endTime: string;

  @Column({ type: 'text', nullable: false })
  question: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;
  @Column({ type: 'text', nullable: true })
  rejectReason?: string;
  @Column({ type: 'varchar', nullable: true })
  roomId: string;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  @ApiProperty({ description: '예약한 멘티', required: true })
  @ManyToOne(() => Users, (user) => user.reservation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menteeId' })
  mentee: Users;

  @ApiProperty({ description: '예약된 멘토링 세션', required: true })
  @ManyToOne(() => MentoringSession, (session) => session.reservation, {
    onDelete: 'CASCADE',
  })
  session: MentoringSession;
  @ApiProperty({ description: '결제된 멘토링 세션', required: true })
  @OneToOne(() => Payment, (payment) => payment.reservation)
  payments: Payment;

  @OneToOne(() => MentoringReview, (review) => review.reservation)
  review: MentoringReview;
}
