import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Mentors } from './mentor.entity';
import { MentoringReservation } from './mentoring-reservation.entity';
import { MentoringReview } from './mentoring-review.entity';
import { MentoringCategory } from '@/common/enum/category.enum';
import { Like } from './like.entity';

@Entity({ schema: 'konnect', name: 'mentoring_sessions' })
export class MentoringSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'int', nullable: false })
  price: number;

  @Column({ type: 'int', nullable: false })
  duration: number;
  @Column({ type: 'float', default: 0 })
  averageRating: number;
  @Column({ type: 'int', default: 0 })
  reviewCount: number;
  @Column({ type: 'enum', enum: MentoringCategory })
  category: MentoringCategory;
  @Column({ default: true })
  isPublic: boolean;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ApiProperty({ description: '멘토링 제공자 (멘토)', required: true })
  @ManyToOne(() => Mentors, (mentor) => mentor.sessions, {
    onDelete: 'CASCADE',
  })
  mentor: Mentors;
  @ApiProperty({ description: '멘토링 예약', required: true })
  @OneToMany(() => MentoringReservation, (reservation) => reservation.session)
  reservation: MentoringReservation[];
  @OneToMany(() => MentoringReview, (review) => review.session)
  reviews: MentoringReview[];
  @OneToMany(() => Like, (like) => like.session)
  likes: Like[];
}
