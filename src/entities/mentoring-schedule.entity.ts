import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Mentors } from './mentor.entity';
import { DayOfWeek } from '@/common/enum/day.enum';

@Entity({ schema: 'konnect', name: 'mentoring_schedules' })
export class MentoringSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: DayOfWeek,
    nullable: false,
  })
  dayOfWeek: DayOfWeek;

  @Column({ type: 'time', nullable: false })
  startTime: string;
  @Column({ type: 'time', nullable: false })
  endTime: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ApiProperty({ description: '연결된 멘토 (시간 설정자)', required: true })
  @ManyToOne(() => Mentors, (mentor) => mentor.schedule, {
    onDelete: 'CASCADE',
  })
  mentor: Mentors;
}
