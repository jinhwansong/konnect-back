import { ApiProperty } from '@nestjs/swagger';

export class DonePaymentResponseDto {
  @ApiProperty({
    description: '예약 ID',
    example: '6f4c1c3d-89ab-4c3d-b3f2-1f9a3a2b7e6f',
  })
  reservationId: string;

  @ApiProperty({ description: '멘토 이름', example: '홍길동' })
  mentorName: string;

  @ApiProperty({ description: '예약 날짜', example: '2025-08-21' })
  date: string;

  @ApiProperty({ description: '시작 시간', example: '10:00' })
  startTime: string;

  @ApiProperty({ description: '종료 시간', example: '11:00' })
  endTime: string;

  @ApiProperty({
    description: '화상 미팅 URL (아직 생성 안됐으면 null)',
    example: 'https://meet.konnect.com/abc123',
    nullable: true,
    required: false,
  })
  meetingUrl?: string | null;
}
