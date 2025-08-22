import { JwtAuthGuard } from '@/common/guard/jwt.guard';
import { User } from '@/common/decorators/user.decorator';
import { PaginationDto } from '@/common/dto/page.dto';
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
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateReservationDto,
  ReservationItemDto,
} from './dto/reservation.dto';
import { ReservationService } from './reservation.service';
import { DonePaymentResponseDto } from './dto/reservation.response.dto';

@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('Reservation')
@Controller('reservation')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}
  @ApiOperation({ summary: '멘토링 예약 가능 시간 조회' })
  @ApiQuery({ name: 'date', required: true, example: '2025-07-08' })
  @ApiResponse({
    status: 200,
    description: '예약 가능한 시간 목록을 반환합니다.',
    schema: {
      example: {
        availableTime: [
          { startTime: '14:00', endTime: '15:00' },
          { startTime: '15:00', endTime: '16:00' },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '세션 또는 멘토를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '멘토링 예약 가능 시간 조회 중 오류가 발생했습니다.',
  })
  @Get('available-times/:id')
  async getAvailableTimes(
    @Param('id') id: string,
    @Query('date') date: string,
  ) {
    return this.reservationService.getAvailableTimes(id, date);
  }

  @ApiResponse({
    status: 200,
    description: '예약 가능한 요일 리스트',
    schema: {
      example: {
        availableDays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 멘토의 스케줄이 존재하지 않습니다.',
  })
  @ApiOperation({ summary: '멘토링 예약 가능 날짜 조회' })
  @Get('available-days/:id')
  async getAvailableDays(@Param('id') mentorId: string) {
    return this.reservationService.getAvailableDays(mentorId);
  }

  @ApiOperation({ summary: '멘토링 예약 등록' })
  @ApiResponse({
    status: 201,
    description: '예약이 등록되고 결제를 유도합니다.',
  })
  @ApiResponse({
    status: 409,
    description: '해당 시간은 이미 예약되었습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '세션 또는 유저 정보를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '멘토링 예약 중 오류가 발생했습니다.',
  })
  @Post('')
  async createReservation(
    @User('id') userId: string,
    @Body() body: CreateReservationDto,
  ) {
    return this.reservationService.createReservation(userId, body);
  }

  @ApiOperation({ summary: '멘티 예약 내역 조회' })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: '페이지 번호 (기본값: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: '페이지당 개수 (기본값: 10)',
  })
  @ApiResponse({
    status: 200,
    description: '멘티 예약 내역을 조회합니다.',
    type: ReservationItemDto,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: '예약 내역 조회 중 오류가 발생했습니다.',
  })
  @Get('my')
  async getMyReservations(
    @User('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.reservationService.getMyReservations(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    description: '결제 완료 후 예약 확정 정보',
    type: DonePaymentResponseDto,
  })
  @Get('done/:orderId')
  @ApiOperation({ summary: '결제 완료 페이지 - 예약 확정' })
  async donePayment(
    @User('id') userId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.reservationService.confirmReservation(userId, orderId);
  }
}
