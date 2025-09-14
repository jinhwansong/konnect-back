import { JwtAuthGuard } from '@/common/guard/jwt.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
import { UserRole } from '@/common/enum/status.enum';
import { UndefinedToNullInterceptor } from '@/common/interceptors/undefinedToNull.Interceptor';
import {
  Body,
  Controller,
  Get,
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
import { CreateMentorDto, MentorProfileResponseDto } from './dto/mentor.dto';
import { MentorsService } from './mentors.service';
import {
  UpdateCareerDto,
  UpdateCompanyDto,
  UpdateCompanyHiddenDto,
  UpdateExpertiseDto,
  UpdatePositionDto,
} from './dto/update.dto';

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
  @ApiOperation({ summary: '회사명 변경' })
  @ApiResponse({
    status: 200,
    description: '회사명이 변경되었습니다.',
    type: UpdateCompanyDto,
  })
  @ApiResponse({ status: 404, description: '멘토 정보를 찾을 수 없습니다.' })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Patch('company')
  async updateCompany(
    @User('id') userId: string,
    @Body() body: UpdateCompanyDto,
  ) {
    return this.mentorService.updateCompany(userId, body);
  }

  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: '전문 분야 변경' })
  @ApiResponse({
    status: 200,
    description: '전문 분야가 변경되었습니다.',
    type: UpdateExpertiseDto,
  })
  @ApiResponse({ status: 404, description: '멘토 정보를 찾을 수 없습니다.' })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Patch('expertise')
  async updateExpertise(
    @User('id') userId: string,
    @Body() body: UpdateExpertiseDto,
  ) {
    return this.mentorService.updateExpertise(userId, body);
  }

  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: '직책 변경' })
  @ApiResponse({
    status: 200,
    description: '직책이 변경되었습니다.',
    type: UpdatePositionDto,
  })
  @ApiResponse({ status: 404, description: '멘토 정보를 찾을 수 없습니다.' })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Patch('position')
  async updatePosition(
    @User('id') userId: string,
    @Body() body: UpdatePositionDto,
  ) {
    return this.mentorService.updatePosition(userId, body);
  }

  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: '연차 변경' })
  @ApiResponse({
    status: 200,
    description: '연차가 변경되었습니다.',
    type: UpdateCareerDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (형식 오류, 인증 실패 등)',
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Patch('career')
  async updateCareer(
    @User('id') userId: string,
    @Body() body: UpdateCareerDto,
  ) {
    return this.mentorService.updateCareer(userId, body);
  }

  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: '회사명 공개 여부 설정' })
  @ApiResponse({ status: 200, description: '공개 여부가 수정되었습니다.' })
  @ApiResponse({ status: 404, description: '멘토 정보를 찾을 수 없습니다.' })
  @Patch('company-name')
  async updatePublicCompanyName(
    @User('id') userId: string,
    @Body() body: UpdateCompanyHiddenDto,
  ) {
    return this.mentorService.updatePublicCompanyName(userId, body);
  }

  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: '멘토 정보' })
  @ApiResponse({
    status: 200,
    description: '멘토 정보 입니다.',
    type: MentorProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: '멘토 정보를 찾을 수 없습니다.' })
  @Get('')
  async mentorProfile(@User('id') userId: string) {
    return this.mentorService.mentorProfile(userId);
  }
}
