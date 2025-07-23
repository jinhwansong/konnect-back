import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class duplicateEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user@example.com',
    description: '이메일 (로그인용)',
    required: true,
  })
  email: string;
}

export class duplicateNicknameDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'john_doe', description: '닉네임', required: true })
  nickname: string;
}
