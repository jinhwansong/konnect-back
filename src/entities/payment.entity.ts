import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MentoringReservation } from "./mentoring-reservation.entity";
import { PaymentStatus } from "@/common/enum/status.enum";
import { Users } from "./user.entity";

@Entity({ schema: 'konnect', name: 'payment' })
export class Payment {
  @ApiProperty({
    example: 'b1a8f3e1-3b0f-4e9b-98a2-c4f0e6d3a3b4',
    description: '결제 UUID',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 50000,
    description: '결제 금액 (원)',
    required: true,
  })
  @Column({ type: 'int', nullable: false })
  price: number;
  @ApiProperty({ description: '주문 번호', example: 'ord_202402191234' })
  @Column({ type: 'varchar', length: 60, nullable: false })
  orderId: string;

  @ApiProperty({
    description: '토스 페이먼츠 결제 고유번호',
    required: false,
    example: '5zJ4xY7m9wAqBnE2vN8k',
  })
  @Column({ type: 'varchar', length: 60, nullable: true })
  paymentKey: string;

  @ApiProperty({
    example: 'https://toss.im/receipt/123456',
    description: '영수증 링크 (Toss Payments)',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  receiptUrl: string;
  @ApiProperty({
    description: '결제 상태',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    example: PaymentStatus.PENDING,
  })
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;
  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '멘토링 등록일',
    required: false,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '멘토링 수정일',
    required: false,
  })
  @UpdateDateColumn()
  updatedAt: Date;
  @ApiProperty({ description: '멘토링 결제 (멘티)', required: true })
  @ManyToOne(() => Users, (user) => user.payments, { onDelete: 'CASCADE' })
  user: Users;
  @ApiProperty({ description: '결제된 예약', required: true })
  @ManyToOne(
    () => MentoringReservation,
    (reservation) => reservation.payments,
    {
      onDelete: 'CASCADE',
    },
  )
  reservation: MentoringReservation;
}