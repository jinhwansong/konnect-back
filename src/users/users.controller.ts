import { UserDto } from '@/auth/dto/auth.dto';
import { JwtAuthGuard } from '@/common/guard/jwt.guard';
import { User } from '@/common/decorators/user.decorator';
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('user')
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
  async profile(@User('id') user: string) {
    return this.userService.profile(user);
  }
}
