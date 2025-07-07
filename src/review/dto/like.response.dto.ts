import { ApiProperty } from '@nestjs/swagger';

export class ToggleLikeResponseDto {
  @ApiProperty({ example: '좋아요 추가됨' })
  message: string;

  @ApiProperty({ example: true, description: 'true = 좋아요 됨, false = 좋아요 취소됨' })
  liked: boolean;
}