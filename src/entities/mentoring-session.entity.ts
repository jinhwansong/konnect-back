import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Mentors } from "./mentor.entity";
import { MentoringReservation } from "./mentoring-reservation.entity";

@Entity({ schema: 'konnect', name: 'mentoring_sessions' })
export class MentoringSession {
  @ApiProperty({
    example: 'b1a8f3e1-3b0f-4e9b-98a2-c4f0e6d3a3b4',
    description: '멘토링 세션 UUID',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'React 기초 강의',
    description: '멘토링 주제',
    required: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'React 기본 개념과 프로젝트 실습',
    description: '멘토링 설명',
    required: true,
  })
  @Column({ type: 'text', nullable: false })
  description: string;
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 50000,
    description: '멘토링 가격 (원)',
    required: true,
  })
  @Column({ type: 'int', nullable: false })
  price: number;
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 60,
    description: '1회당 멘토링 시간 (분 단위)',
    required: true,
  })
  @Column({ type: 'int', nullable: false })
  duration: number;
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
  @ApiProperty({ description: '멘토링 제공자 (멘토)', required: true })
  @ManyToOne(() => Mentors, (mentor) => mentor.sessions, {
    onDelete: 'CASCADE',
  })
  mentor: Mentors;
  @ApiProperty({ description: '멘토링 예약', required: true })
  @OneToMany(() => MentoringReservation, (reservation) => reservation.session)
  reservation: MentoringReservation[];
}