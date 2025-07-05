import { JwtAuthGuard } from '@/auth/jwt.guard';
import { User } from '@/common/decorators/user.decorator';
import { UndefinedToNullInterceptor } from '@/common/interceptors/undefinedToNullInterceptor';
import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateMentorDto } from './dto/mentor.dto';
import { MentorsService } from './mentors.service';

@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('Mentor')
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
  @ApiResponse({ status: 500, description: '멘토 신청 중 오류가 발생했습니다.' })
  @ApiResponse({
    status: 500,
    description: '멘토 신청 중 오류가 발생했습니다.',
  })
  @Post('apply')
  async applyMentor(@User() user, @Body() dto: CreateMentorDto) {
    return this.mentorService.apply(user.id, dto);
  }
}
