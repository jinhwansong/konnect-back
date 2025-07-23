import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class sendEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user@example.com',
    description: '인증용 이메일',
    required: true,
  })
  email: string;
}
export class verifyCodeDto extends sendEmailDto {
  @IsNotEmpty()
  @ApiProperty({
    example: '123456',
    description: '이메일로 전송된 인증 코드',
    required: true,
  })
  code: string;
}
