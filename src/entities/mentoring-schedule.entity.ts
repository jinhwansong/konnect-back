import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Mentors } from './mentor.entity';

@Entity({ schema: 'konnect', name: 'mentoring_schedules' })
export class MentoringSchedule {
  @ApiProperty({
    example: 'b1a8f3e1-3b0f-4e9b-98a2-c4f0e6d3a3b4',
    description: '일정 UUID',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ApiProperty({
    example: 'MONDAY',
    description: '멘토링 가능한 요일',
    enum: [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ],
    required: true,
  })
  @Column({
    type: 'enum',
    enum: [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ],
    nullable: false,
  })
  dayOfWeek:
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';
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
  @ApiProperty({ description: '연결된 멘토 (시간 설정자)', required: true })
  @ManyToOne(() => Mentors, (mentor) => mentor.schedule, {
    onDelete: 'CASCADE',
  })
  mentor: Mentors;
}
