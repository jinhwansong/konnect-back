import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MentorsService } from './mentors.service';
import { JwtAuthGuard } from '@/auth/jwt.guard';
import { User } from '@/common/decorators/user.decorator';
import { CreateMentorDto } from './dto/mentor.dto';
import { UndefinedToNullInterceptor } from '@/common/interceptors/undefinedToNullInterceptor';

@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('멘토')
@Controller('mentors')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class MentorsController {
  constructor(private readonly mentorService: MentorsService) {}

  @ApiOperation({ summary: '멘토 신청' })
  @ApiResponse({
    status: 201,
    description: '멘토 신청 완료',
    type: CreateMentorDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Post('apply')
  async applyMentor(@User() user, @Body() dto: CreateMentorDto) {
    return this.mentorService.apply(user.id, dto);
  }
}
