import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateFcmTokenDto {
  @ApiProperty({ description: 'FCM 토큰' })
  @IsString()
  token: string;
}
