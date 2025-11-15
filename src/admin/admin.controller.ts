import { UserListDto } from '@/admin/dto/user.dto';
import { JwtAuthGuard } from '@/common/guard/jwt.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
import { PaginationDto } from '@/common/dto/page.dto';
import { UserRole } from '@/common/enum/status.enum';
import { RolesGuard } from '@/common/guard/roles.guard';
import { UndefinedToNullInterceptor } from '@/common/interceptors/undefinedToNull.Interceptor';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import { AdminQueryDto } from './dto/admin-query.dto';
import { DashboardDataDto } from './dto/dashboard.dto';
import { MentorDetailDto, MentorListDto } from './dto/mentor.dto';
import { CreateNoticeDto, NoticeDto, UpdateNoticeDto } from './dto/notice.dto';

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
  @Get('dashboard')
  @ApiOperation({ summary: '대시보드 통계 조회' })
  @ApiResponse({
    status: 200,
    description: '대시보드 통계 조회 성공',
    type: DashboardDataDto,
  })
  @HttpCode(HttpStatus.OK)
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @ApiOperation({ summary: '사용자 목록 조회 (검색, 필터링, 정렬)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'q', required: false, description: '검색어' })
  @ApiQuery({ name: 'role', required: false, description: '역할 필터 (mentee, mentor, admin, all)' })
  @ApiQuery({ name: 'status', required: false, description: '상태 필터 (active, suspended, all)' })
  @ApiQuery({ name: 'sort', required: false, description: '정렬 (field:direction)', example: 'createdAt:desc' })
  @ApiResponse({
    status: 200,
    description: '사용자 목록 조회 성공',
  })
  @HttpCode(HttpStatus.OK)
  async getUserListWithFilters(@Query() dto: AdminQueryDto & { role?: string; status?: string }) {
    return this.adminService.getUserListWithFilters(dto);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: '사용자 상태 변경 (정지/활성화)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        suspended: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '사용자 상태 변경 성공',
  })
  @HttpCode(HttpStatus.OK)
  async updateUserStatus(
    @Param('id') id: string,
    @Body() body: { suspended: boolean },
  ) {
    return this.adminService.updateUserStatus(id, body.suspended);
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
  async approveMentor(
    @Param('id') id: string,
    @User('id') userId: string,
    @Body() body: ApproveOrRejectMentorDto,
  ) {
    return this.adminService.approveMentor(id, userId, body);
  }

  @Get('payments')
  @ApiOperation({ summary: '결제 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'q', required: false, description: '검색어' })
  @ApiQuery({ name: 'status', required: false, description: '상태 필터 (성공, 실패, 환불, all)' })
  @ApiQuery({ name: 'sort', required: false, description: '정렬 (field:direction)', example: 'createdAt:desc' })
  @ApiResponse({
    status: 200,
    description: '결제 목록 조회 성공',
  })
  @HttpCode(HttpStatus.OK)
  async getPaymentList(@Query() dto: AdminQueryDto & { status?: string }) {
    return this.adminService.getPaymentList(dto);
  }

  @Get('articles')
  @ApiOperation({ summary: '아티클 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'q', required: false, description: '검색어' })
  @ApiQuery({ name: 'sort', required: false, description: '정렬 (field:direction)', example: 'createdAt:desc' })
  @ApiResponse({
    status: 200,
    description: '아티클 목록 조회 성공',
  })
  @HttpCode(HttpStatus.OK)
  async getArticleList(@Query() dto: AdminQueryDto & { status?: string }) {
    return this.adminService.getArticleList(dto);
  }

  @Get('reviews')
  @ApiOperation({ summary: '리뷰 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'q', required: false, description: '검색어' })
  @ApiQuery({ name: 'reported', required: false, description: '신고 필터 (reported, not-reported, all)' })
  @ApiQuery({ name: 'sort', required: false, description: '정렬 (field:direction)', example: 'createdAt:desc' })
  @ApiResponse({
    status: 200,
    description: '리뷰 목록 조회 성공',
  })
  @HttpCode(HttpStatus.OK)
  async getReviewList(@Query() dto: AdminQueryDto & { reported?: string }) {
    return this.adminService.getReviewList(dto);
  }

  @Get('notices')
  @ApiOperation({ summary: '공지사항 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'q', required: false, description: '검색어' })
  @ApiQuery({ name: 'published', required: false, description: '발행 필터 (true, false, all)' })
  @ApiQuery({ name: 'sort', required: false, description: '정렬 (field:direction)', example: 'createdAt:desc' })
  @ApiResponse({
    status: 200,
    description: '공지사항 목록 조회 성공',
    type: [NoticeDto],
  })
  @HttpCode(HttpStatus.OK)
  async getNoticeList(@Query() dto: AdminQueryDto & { published?: string }) {
    return this.adminService.getNoticeList(dto);
  }

  @Post('notices')
  @ApiOperation({ summary: '공지사항 생성' })
  @ApiBody({ type: CreateNoticeDto })
  @ApiResponse({
    status: 201,
    description: '공지사항 생성 성공',
    type: NoticeDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createNotice(@Body() dto: CreateNoticeDto) {
    return this.adminService.createNotice(dto);
  }

  @Patch('notices/:id')
  @ApiOperation({ summary: '공지사항 수정' })
  @ApiBody({ type: UpdateNoticeDto })
  @ApiResponse({
    status: 200,
    description: '공지사항 수정 성공',
    type: NoticeDto,
  })
  @HttpCode(HttpStatus.OK)
  async updateNotice(@Param('id') id: string, @Body() dto: UpdateNoticeDto) {
    return this.adminService.updateNotice(id, dto);
  }

  @Delete('notices/:id')
  @ApiOperation({ summary: '공지사항 삭제' })
  @ApiResponse({
    status: 200,
    description: '공지사항 삭제 성공',
  })
  @HttpCode(HttpStatus.OK)
  async deleteNotice(@Param('id') id: string) {
    return this.adminService.deleteNotice(id);
  }

  @Get('mentoring/sessions')
  @ApiOperation({ summary: '멘토링 세션 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'q', required: false, description: '검색어' })
  @ApiQuery({ name: 'status', required: false, description: '상태 필터 (published, draft, all)' })
  @ApiQuery({ name: 'sort', required: false, description: '정렬 (field:direction)', example: 'createdAt:desc' })
  @ApiResponse({
    status: 200,
    description: '멘토링 세션 목록 조회 성공',
  })
  @HttpCode(HttpStatus.OK)
  async getMentoringSessions(@Query() dto: AdminQueryDto & { status?: string }) {
    return this.adminService.getMentoringSessions(dto);
  }

  @Patch('mentoring/sessions/:id/public')
  @ApiOperation({ summary: '멘토링 세션 공개 상태 변경' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isPublic: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '세션 공개 상태 변경 성공',
  })
  @HttpCode(HttpStatus.OK)
  async toggleSessionPublic(
    @Param('id') id: string,
    @Body() body: { isPublic: boolean },
  ) {
    return this.adminService.toggleSessionPublic(id, body.isPublic);
  }

  @Get('mentoring/reservations')
  @ApiOperation({ summary: '멘토링 예약 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'q', required: false, description: '검색어' })
  @ApiQuery({ name: 'status', required: false, description: '상태 필터 (pending, confirmed, cancelled, all)' })
  @ApiQuery({ name: 'sort', required: false, description: '정렬 (field:direction)', example: 'createdAt:desc' })
  @ApiResponse({
    status: 200,
    description: '멘토링 예약 목록 조회 성공',
  })
  @HttpCode(HttpStatus.OK)
  async getMentoringReservations(@Query() dto: AdminQueryDto & { status?: string }) {
    return this.adminService.getMentoringReservations(dto);
  }

  @Patch('mentoring/reservations/:id/status')
  @ApiOperation({ summary: '멘토링 예약 상태 변경' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['confirmed', 'cancelled'], example: 'confirmed' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '예약 상태 변경 성공',
  })
  @HttpCode(HttpStatus.OK)
  async updateReservationStatus(
    @Param('id') id: string,
    @Body() body: { status: 'confirmed' | 'cancelled' },
  ) {
    return this.adminService.updateReservationStatus(id, body.status);
  }
}
