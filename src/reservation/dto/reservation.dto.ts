import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

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

  @ApiProperty({ example: 'CONFIRMED', description: '예약 상태' })
  status: string;

  @ApiProperty({ example: '포트폴리오 피드백' })
  sessionTitle: string;

  @ApiProperty({ example: '김멘토' })
  mentorName: string;

  @ApiProperty({
    example: 'https://toss.im/receipt/12345',
    description: '결제 영수증 URL',
    required: false,
  })
  receiptUrl?: string;

  @ApiProperty({ example: false, description: '후기 작성 여부' })
  hasReview: boolean;
}