import { JwtAuthGuard } from '@/auth/jwt.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
import { UserRole } from '@/common/enum/status.enum';
import { UndefinedToNullInterceptor } from '@/common/interceptors/undefinedToNull.Interceptor';
import {
  Body,
  Controller,
  Delete,
  Get,
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
import {
  BulkCreateMentoringScheduleDto,
  BulkUpdateMentoringScheduleDto,
  GetScheduleListResponseDto,
} from './dto/schedule.dto';
import { ScheduleService } from './schedule.service';
import { PaginationDto } from '@/common/dto/page.dto';
import {
  MentorReservationDetailResponseDto,
  MentorReservationListResponseDto,
  UpdateReservationStatusDto,
} from './dto/reservation.dto';

@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('Schedule')
@ApiBearerAuth('access-token')
@Controller('schedule')
@Roles(UserRole.MENTOR)
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post('')
  @ApiOperation({ summary: '멘토 정기 스케줄 등록' })
  @ApiResponse({
    status: 201,
    description: '정기 스케줄이 성공적으로 등록되었습니다.',
  })
  @ApiResponse({
    status: 403,
    description: '본인의 스케줄만 등록할 수 있습니다.',
  })
  async createSchedule(
    @User('id') userId: string,
    @Body() body: BulkCreateMentoringScheduleDto,
  ) {
    return this.scheduleService.createSchedule(userId, body.data);
  }

  @Patch('')
  @ApiOperation({ summary: '멘토 정기 스케줄 수정' })
  @ApiResponse({
    status: 200,
    description: '정기 스케줄이 성공적으로 수정되었습니다.',
  })
  @ApiResponse({
    status: 403,
    description: '본인의 스케줄만 수정할 수 있습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '해당 스케줄을 찾을 수 없습니다.',
  })
  async updateSchedule(
    @User('id') userId: string,
    @Body() body: BulkUpdateMentoringScheduleDto,
  ) {
    console.log('🔥 PATCH body:', body);
    return this.scheduleService.updateSchedule(userId, body.data);
  }

  @ApiOperation({ summary: '멘토 정기 스케줄 삭제' })
  @ApiResponse({
    status: 200,
    description: '정기 스케줄이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({
    status: 403,
    description: '본인의 스케줄만 삭제할 수 있습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '해당 스케줄을 찾을 수 없습니다.',
  })
  @Delete(':id')
  async deleteSchedule(
    @Param('id') scheduleId: string,
    @User('id') userId: string,
  ) {
    return this.scheduleService.deleteSchedule(userId, scheduleId);
  }

  @ApiOperation({ summary: '멘토 정기 스케줄 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '멘토가 등록한 정기 스케줄 목록을 반환합니다.',
    type: GetScheduleListResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '멘토 정보를 찾을 수 없습니다.',
  })
  @Get('')
  async getMyScheduleList(@User('id') userId: string) {
    return this.scheduleService.getScheduleList(userId);
  }

  @ApiOperation({ summary: '멘토 예약 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: '등록된 세션 목록',
    type: MentorReservationListResponseDto,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: '등록된 세션 목록을 찾을 수 없습니다.',
  })
  @Get('reservations')
  async getMentorReservationList(
    @User('id') userId: string,
    @Query() dto: PaginationDto,
  ) {
    return this.scheduleService.getMentorReservationList(userId, dto);
  }
  @ApiOperation({ summary: '멘토 예약 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '예약 상세 정보 반환',
    type: MentorReservationDetailResponseDto,
  })
  @Get('reservations/:id')
  async getMentorReservationDetail(
    @User('id') userId: string,
    @Param('id') reservationId: string,
  ) {
    return this.scheduleService.getMentorReservationDetail(
      userId,
      reservationId,
    );
  }
  @Patch('reservations/:id/status')
  @ApiOperation({ summary: '멘토 예약 수락/거절 처리' })
  @ApiBody({
    description: '예약 상태 변경 요청',
    examples: {
      수락: {
        summary: '예약 수락',
        value: {
          status: 'confirmed',
        },
      },
      거절: {
        summary: '예약 거절 + 환불 처리',
        value: {
          status: 'rejected',
          rejectReason: '일정이 맞지 않아 진행이 어렵습니다.',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '예약 상태 변경 성공' })
  @ApiResponse({ status: 400, description: '요청 형식 또는 조건 오류' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '예약 없음' })
  async updateReservationStatus(
    @User('id') userId: string,
    @Param('id') reservationId: string,
    @Body() body: UpdateReservationStatusDto,
  ) {
    return this.scheduleService.updateReservationStatus(
      userId,
      reservationId,
      body,
    );
  }
}
