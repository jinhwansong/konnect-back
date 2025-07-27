import { UserListDto } from '@/admin/dto/user.dto';
import { JwtAuthGuard } from '@/auth/jwt.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
import { PaginationDto } from '@/common/dto/page.dto';
import { UserRole } from '@/common/enum/status.enum';
import { RolesGuard } from '@/common/guard/roles.guard';
import { UndefinedToNullInterceptor } from '@/common/interceptors/undefinedToNull.Interceptor';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ApproveOrRejectMentorDto } from './dto/approve.dto';
import { MentorDetailDto, MentorListDto } from './dto/mentor.dto';

@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @ApiOperation({ summary: '사용자 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: '사용자 목록 조회 성공',
    type: UserListDto,
    isArray: true,
  })
  @ApiResponse({
    status: 404,
    description: '사용자 목록 를 찾을 수 없습니다.',
  })
  @Get('users')
  async getUserList(@Query() dto: PaginationDto) {
    return this.adminService.getUserList(dto);
  }

  @ApiOperation({ summary: '멘토 신청 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: '멘토 신청 목록',
    type: MentorListDto,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: '멘토 신청 정보를 찾을 수 없습니다.',
  })
  @Get('mentors')
  async getMentorList(@Query() dto: PaginationDto) {
    return this.adminService.getMentorList(dto);
  }

  @ApiOperation({ summary: '멘토 상세 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '멘토 상세 정보',
    type: MentorDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: '해당 멘토를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '멘토 상세 정보를 불러오는 데 실패했습니다.',
  })
  @Get('mentors/:id')
  async getMentorDetail(@Param('id') id: string) {
    return this.adminService.getMentorDetail(id);
  }
  @ApiOperation({ summary: '승인/거절' })
  @ApiBody({
    type: ApproveOrRejectMentorDto,
    examples: {
      승인: {
        summary: '멘토 승인',
        value: { status: 'approved' },
      },
      거절: {
        summary: '멘토 거절',
        value: { status: 'rejected', reason: '포트폴리오 기준 미달' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '멘토 승인 또는 거절 성공',
    schema: {
      example: { message: '멘토가 승인되었습니다.' },
    },
  })
  @ApiResponse({
    status: 400,
    description: '거절 시 사유 누락 등 잘못된 요청',
  })
  @ApiResponse({
    status: 403,
    description: '관리자만 접근 가능한 요청',
  })
  @ApiResponse({
    status: 404,
    description: '멘토 또는 관리자 계정 없음',
  })
  @Post('mentors/:id/approve')
  async approveMentor(
    @Param('id') id: string,
    @User('id') userId: string,
    @Body() body: ApproveOrRejectMentorDto,
  ) {
    return this.adminService.approveMentor(id, userId, body);
  }
}
