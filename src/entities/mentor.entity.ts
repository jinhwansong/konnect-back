import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MentoringSchedule } from './mentoring-schedule.entity';
import { MentoringSession } from './mentoring-session.entity';
import { Users } from './user.entity';
import { MentorStatus } from '@/common/enum/status.enum';

@Entity({ schema: 'konnect', name: 'mentors' })
export class Mentors {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: 20, nullable: true })
  company: string;
  @Column({ type: 'varchar', nullable: false, length: 100 })
  introduce: string;
  @Column({ type: 'varchar', nullable: true })
  position: string;
  @Column({ type: 'simple-array', nullable: false })
  expertise: string[];
  @Column('varchar')
  career: string;
  @Column({ type: 'varchar', nullable: false })
  portfolio: string;
  @Column({ type: 'enum', enum: MentorStatus, default: MentorStatus.PENDING })
  status: MentorStatus;
  @Column({ type: 'varchar', nullable: true, length: 100 })
  reason: string;
  @Column({ default: true })
  isCompanyHidden: boolean;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column({ type: 'timestamp', nullable: true })
  rejectedAt?: Date;
  @ApiProperty({ description: '멘토와 연결된 사용자', required: true })
  @OneToOne(() => Users, (user) => user.mentorProfile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;
  @ApiProperty({ description: '멘토링 세션', required: true })
  @OneToMany(() => MentoringSession, (session) => session.mentor)
  sessions: MentoringSession[];
  @ApiProperty({ description: '멘토링 시간 조정', required: true })
  @OneToMany(() => MentoringSchedule, (schedule) => schedule.mentor)
  schedule: MentoringSchedule[];
}
