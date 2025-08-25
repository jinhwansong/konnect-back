import { ApiProperty } from '@nestjs/swagger';

export class JoinRoomResponseDto {
  @ApiProperty({ example: 'a6f8e12c-1234-4567-8901-abcdef123456' })
  reservationId: string;

  @ApiProperty({
    example: 'https://konnect.com/room/550e8400-e29b-41d4-a716-446655440000',
  })
  meetingUrl: string;
}
