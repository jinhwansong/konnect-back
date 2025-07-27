import { JwtAuthGuard } from '@/auth/jwt.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
import { UserRole } from '@/common/enum/status.enum';
import { UndefinedToNullInterceptor } from '@/common/interceptors/undefinedToNull.Interceptor';
import {
  Body,
  Controller,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateMentorDto } from './dto/mentor.dto';
import { UpdateMentorPublicDto } from './dto/public.dto';
import { MentorsService } from './mentors.service';

@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('Mentor')
@Controller('mentor')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class MentorsController {
  constructor(private readonly mentorService: MentorsService) {}

  @ApiOperation({ summary: '멘토 신청' })
  @ApiResponse({
    status: 201,
    description: '멘토 신청 완료',
  })
  @ApiResponse({
    status: 500,
    description: '멘토 신청 중 오류가 발생했습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '멘토 신청 중 오류가 발생했습니다.',
  })
  @Post('apply')
  async applyMentor(@User('id') userId: string, @Body() body: CreateMentorDto) {
    return this.mentorService.apply(userId, body);
  }

  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: '멘토 세션 공개 여부 설정' })
  @ApiResponse({ status: 200, description: '공개 여부가 수정되었습니다.' })
  @ApiResponse({ status: 404, description: '멘토 정보를 찾을 수 없습니다.' })
  @Patch('public')
  async updatePublicStatus(
    @User('id') userId: string,
    @Body() body: UpdateMentorPublicDto,
  ) {
    return this.mentorService.updatePublicStatus(userId, body.isPublic);
  }
}
