import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/auth/jwt.guard';
import { User } from '@/common/decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserDto } from '@/auth/dto/auth.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '회원정보' })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 입니다.',
    type: UserDto,
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Get('')
  async profile(@User() user) {
    return this.userService.profile(user.id);
  }
}
