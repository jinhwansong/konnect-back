import { MentoringStatus, MentorStatus } from '@/common/enum/status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MentoringSession } from './mentoring-session.entity';
import { Payment } from './payment.entity';
import { Users } from './user.entity';

@Entity({ schema: 'konnect', name: 'mentoring_reservation' })
export class MentoringReservation {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MentoringStatus,
    default: MentorStatus.PENDING,
  })
  status: MentorStatus;

  @Column({ type: 'date', nullable: false })
  date: string;
  @Column({ type: 'time', nullable: false })
  startTime: string;


  @Column({ type: 'time', nullable: false })
  endTime: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  @ApiProperty({ description: '예약한 멘티', required: true })
  @ManyToOne(() => Users, (user) => user.reservation, { onDelete: 'CASCADE' })
  mentee: Users;

  @ApiProperty({ description: '예약된 멘토링 세션', required: true })
  @ManyToOne(() => MentoringSession, (session) => session.reservation, {
    onDelete: 'CASCADE',
  })
  session: MentoringSession;
  @ApiProperty({ description: '결제된 멘토링 세션', required: true })
  @OneToMany(() => Payment, (payment) => payment.reservation)
  payments: Payment[];
}
