import { ChatRoomStatus } from '@/common/enum/status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class JoinRoomResponseDto {
  @ApiProperty({ example: ChatRoomStatus.WAITING, enum: ChatRoomStatus })
  status: string;
}
