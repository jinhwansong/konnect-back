import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdateNicknameDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'john_doe', description: '닉네임', required: true })
  nickname: string;
}

export class UpdatePhoneDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '01012345678',
    description: '휴대폰번호 (형식: 01012345678)',
    required: false,
  })
  phone: string;
}
export class UpdateImageDto {
  @ApiProperty({
    example: 'https://cdn.site.com/profile.jpg',
    description: '프로필 이미지 URL',
  })
  @IsString()
  image: string;
}

export class UpdatePasswordDto {
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
  currentPassword: string;

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
  newPassword: string;
}
