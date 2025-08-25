import { ChatRoomStatus, MentoringStatus } from '@/common/enum/status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ example: '2025-07-08', description: '예약 날짜 (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '10:00', description: '시작 시간 (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '11:00', description: '종료 시간 (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: '세션 ID', description: '멘토링 세션 ID' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    example: 'React를 학습할 때 어떤 순서로 접근해야 하나요?',
    description: '사전 질문',
  })
  @IsString()
  @IsNotEmpty()
  question: string;
}

export class ReservationItemDto {
  @ApiProperty({ example: 'a1b2c3d4-5678-90ef-ghij-klmnopqrstuv' })
  id: string;

  @ApiProperty({ example: '2025-07-10' })
  date: string;

  @ApiProperty({ example: '14:00' })
  startTime: string;

  @ApiProperty({ example: '15:00' })
  endTime: string;

  @ApiProperty({ example: MentoringStatus.CONFIRMED, description: '예약 상태' })
  status: string;

  @ApiProperty({ example: '포트폴리오 피드백' })
  sessionTitle: string;

  @ApiProperty({ example: '김멘토' })
  mentorName: string;
  @ApiProperty({ example: 'uuid' })
  roomId: string;
  @ApiProperty({
    example: 'waiting',
    enum: ChatRoomStatus,
    default: ChatRoomStatus.WAITING,
  })
  canEnter: ChatRoomStatus;
}

export class ReservationClearItemDto {
  @ApiProperty({ example: 'a1b2c3d4-5678-90ef-ghij-klmnopqrstuv' })
  id: string;

  @ApiProperty({ example: '2025-07-10' })
  date: string;

  @ApiProperty({ example: '14:00' })
  startTime: string;

  @ApiProperty({ example: '15:00' })
  endTime: string;

  @ApiProperty({ example: MentoringStatus.COMPLETED, description: '예약 상태' })
  status: string;

  @ApiProperty({ example: '포트폴리오 피드백' })
  sessionTitle: string;

  @ApiProperty({ example: '김멘토' })
  mentorName: string;
  @ApiProperty({ example: false })
  reviewWritten: boolean;
}
