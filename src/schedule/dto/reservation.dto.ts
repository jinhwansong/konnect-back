import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MentorReservationListResponseDto {
  @ApiProperty({
    description: '예약 ID',
    example: 'b2a9c1ef-27f4-4c02-ae34-0fcecc30c9f1',
  })
  id: string;

  @ApiProperty({ description: '세션 제목', example: 'React 입문 강의' })
  title: string;

  @ApiProperty({ description: '예약날짜', example: '2025-07-27' })
  date: string;

  @ApiProperty({ description: '시작 시간', example: '14:00:00' })
  startTime: string;

  @ApiProperty({ description: '종료 시간', example: '15:00:00' })
  endTime: string;

  @ApiProperty({
    description: '예약 상태',
    example: 'pending',
    enum: ['pending', 'confirmed', 'rejected'],
  })
  status: string;

  @ApiProperty({
    description: '예약 생성 시간',
    example: '2025-07-27T14:32:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({ description: '멘티 이름', example: '김철수' })
  menteeName: string;

  @ApiProperty({ description: '멘티 이메일', example: 'mentee@example.com' })
  menteeEmail: string;

  @ApiProperty({ description: '멘티 전화번호', example: '010-1234-5678' })
  menteePhone: string;
}

export class MentorReservationDetailResponseDto {
  @ApiProperty({
    description: '예약 ID',
    example: 'b2a9c1ef-27f4-4c02-ae34-0fcecc30c9f1',
  })
  id: string;

  @ApiProperty({ description: '세션 제목', example: 'React 입문 강의' })
  title: string;

  @ApiProperty({ description: '예약 날짜', example: '2025-07-30' })
  date: string;

  @ApiProperty({ description: '시작 시간', example: '14:00:00' })
  startTime: string;

  @ApiProperty({ description: '종료 시간', example: '15:00:00' })
  endTime: string;

  @ApiProperty({
    description: '멘티가 남긴 사전 질문',
    example: '포트폴리오에 뭐 넣어야 할까요?',
  })
  question: string;

  @ApiProperty({
    description: '거절 사유',
    example: '요청 시간에 일정이 겹칩니다.',
    required: false,
  })
  rejectReason?: string;

  @ApiProperty({
    description: '예약 상태',
    example: 'pending',
    enum: ['pending', 'confirmed', 'rejected'],
  })
  status: string;

  @ApiProperty({
    description: '예약 생성 시간',
    example: '2025-07-27T14:32:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({ description: '멘티 이름', example: '김철수' })
  menteeName: string;

  @ApiProperty({ description: '멘티 이메일', example: 'mentee@example.com' })
  menteeEmail: string;

  @ApiProperty({ description: '멘티 전화번호', example: '010-1234-5678' })
  menteePhone: string;
}

export class UpdateReservationStatusDto {
  @ApiProperty({
    description: '거절 사유 (status가 rejected일 때만 필수)',
    example: '해당 시간에 다른 일정이 있습니다.',
    required: false,
  })
  @IsString()
  rejectReason: string;
}
