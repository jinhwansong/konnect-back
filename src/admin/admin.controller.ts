import { UserListDto } from '@/admin/dto/user.dto';
import { JwtAuthGuard } from '@/auth/jwt.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { PaginationDto } from '@/common/dto/page.dto';
import { UserRole } from '@/common/enum/status.enum';
import { RolesGuard } from '@/common/guard/roles.guard';
import { UndefinedToNullInterceptor } from '@/common/interceptors/undefinedToNullInterceptor';
import { Controller, Get, Param, ParseIntPipe, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { MentorDetailDto, MentorListDto } from './dto/mentor.dto';

@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('관리자')
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
    type: [UserListDto],
  })
  @ApiResponse({
    status: 404,
    description: '사용자 목록 를 찾을 수 없습니다.',
  })
  @Get('users')
  async getUserList(
    @Query() dto: PaginationDto,
  ): Promise<{ data: UserListDto[]; totalPage: number, message:string }> {
    return this.adminService.getUserList(dto);
  }

  @ApiOperation({ summary: '멘토 신청 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: '멘토 신청 목록',
    type: [MentorListDto],
  })
  @ApiResponse({
    status: 500,
    description: '멘토 신청 정보를 찾을 수 없습니다.',
  })
  @Get('mentors')
  async getMentorList(
    @Query() dto: PaginationDto,
  ): Promise<{ data: MentorListDto[], totalPage: number, message:string }> {
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
  async getMentorDetail(@Param('id', ParseIntPipe) id: string) {
    return this.adminService.getMentorDetail(id);
  }
}
