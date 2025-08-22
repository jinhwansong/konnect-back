import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MentoringReservation } from './mentoring-reservation.entity';
import { Users } from './user.entity';
import { PaymentStatus } from '@/common/enum/status.enum';

@Entity({ schema: 'konnect', name: 'payment' })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: false })
  price: number;
  @Column({ type: 'varchar', length: 60, nullable: false })
  orderId: string;
  @Column({ type: 'varchar', length: 60, nullable: true })
  paymentKey: string;
  @Column({ type: 'text', nullable: true })
  receiptUrl: string;
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;
  @Column({ type: 'text', nullable: true })
  failReason: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ApiProperty({ description: '멘토링 결제 (멘티)', required: true })
  @ManyToOne(() => Users, (user) => user.payments, { onDelete: 'CASCADE' })
  user: Users;
  @ApiProperty({ description: '결제된 예약', required: true })
  @OneToOne(() => MentoringReservation, (reservation) => reservation.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  reservation: MentoringReservation;
}
