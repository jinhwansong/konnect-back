import { UserRole } from '@/common/enum/status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsBase64, IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class JoinDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user@example.com',
    description: '이메일 (로그인용)',
    required: true,
  })
  email: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'john_doe', description: '닉네임', required: true })
  nickname: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'John Doe',
    description: '사용자 이름',
    required: true,
  })
  name: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '01012345678',
    description: '휴대폰번호 (형식: 01012345678)',
    required: false,
  })
  phone: string;
  @ApiProperty({
    example: 'P@ssw0rd!',
    description: '비밀번호 (8자 이상, 영문자, 숫자, 특수문자 포함)',
    required: true,
  })
  @IsString()
  @Matches(
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
    {
      message:
        '비밀번호는 8자 이상이며, 영문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.',
    },
  )
  password: string;
}
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user@example.com',
    description: '이메일 (로그인용)',
    required: true,
  })
  email: string;
  @ApiProperty({
    example: 'P@ssw0rd!',
    description: '비밀번호 (8자 이상, 영문자, 숫자, 특수문자 포함)',
    required: true,
  })
  @IsString()
  @Matches(
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
    {
      message:
        '비밀번호는 8자 이상이며, 영문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.',
    },
  )
  password: string;
}
export class UserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user@example.com',
    description: '이메일 (로그인용)',
    required: true,
  })
  email: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'john_doe', description: '닉네임', required: true })
  nickname: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'John Doe',
    description: '사용자 이름',
    required: true,
  })
  name: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '01012345678',
    description: '휴대폰번호 (형식: 01012345678)',
    required: false,
  })
  phone: string;
  @ApiProperty({
    example: UserRole.MENTEE,
    description: '사용자 등급 (MENTOR, MENTEE, ADMIN)',
    required: true,
    enum: UserRole,
  })
  role: UserRole;
  @IsBase64()
  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: '프로필 이미지 URL',
    required: false,
  })
  image: string;
}

