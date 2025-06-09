import { MemtoringStatus, Status } from '@/common/enum/status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Users } from './user.entity';
import { MentoringSession } from './mentoring-session.entity';
import { Payment } from './payment.entity';

@Entity({ schema: 'konnect', name: 'mentoring_reservation' })
export class MentoringReservation {
  @ApiProperty({
    example: 'b1a8f3e1-3b0f-4e9b-98a2-c4f0e6d3a3b4',
    description: '예약 UUID',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ApiProperty({
    example: MemtoringStatus.PENDING,
    description: '예약 상태',
    enum: MemtoringStatus,
    required: true,
  })
  @Column({
    type: 'enum',
    enum: MemtoringStatus,
    default: Status.PENDING,
  })
  status: Status;
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '날짜 형식은 YYYY-MM-DD 형식이어야 합니다.',
  })
  @IsNotEmpty()
  @ApiProperty({
    example: '2023-05-15',
    description: '예약 날짜',
    required: true,
  })
  @Column({ type: 'date', nullable: false })
  date: string;
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: '시간 형식은 HH:MM 형식이어야 합니다.',
  })
  @IsNotEmpty()
  @ApiProperty({
    example: '10:00',
    description: '예약 시작 시간',
    required: true,
  })
  @Column({ type: 'time', nullable: false })
  startTime: string;
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: '시간 형식은 HH:MM 형식이어야 합니다.',
  })
  @IsNotEmpty()
  @ApiProperty({
    example: '11:00',
    description: '예약 종료 시간',
    required: true,
  })
  @Column({ type: 'time', nullable: false })
  endTime: string;
  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '멘토링 예약 등록일',
    required: false,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '멘토링 예약 수정일',
    required: false,
  })
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
