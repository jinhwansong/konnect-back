import { Users } from '@/entities';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class JoinDto extends PickType(Users, ['email', 'name', 'nickname', 'phone']) {
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
export class LoginDto extends PickType(Users, ['email', 'password']) {}
export class UserDto extends PickType(Users, [
  'email',
  'name',
  'nickname',
  'phone',
  'image',
  'role',
]) {}