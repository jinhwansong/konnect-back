import { JwtAuthGuard } from '@/auth/jwt.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
import { PaginationDto } from '@/common/dto/page.dto';
import { UserRole } from '@/common/enum/status.enum';
import { RolesGuard } from '@/common/guard/roles.guard';
import { UndefinedToNullInterceptor } from '@/common/interceptors/undefinedToNullInterceptor';
import { Body, Controller, Get, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MenteePaymentHistoryDto, MentorIComeResponseDto } from './dto/icome.dto';
import { ConfirmPaymentDto, RefundPaymentDto } from './dto/payment.dto';
import { PaymentService } from './payment.service';

@ApiTags('Payment')
@UseInterceptors(UndefinedToNullInterceptor)

@ApiBearerAuth('access-token')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @UseGuards(JwtAuthGuard)
  @Post('confirm')
  @ApiOperation({ summary: '결제 성공 시 Toss confirm 처리' })
  async confirmPayment(@Body() body:ConfirmPaymentDto, @User() userId:string) {
    return this.paymentService.confirmPayment(body,userId);
  }

  @Roles(UserRole.MENTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('mentor-income')
  @ApiOperation({ summary: '멘토 수입 내역 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
      status: 200,
      description: '멘토 수입 내역',
      type: MentorIComeResponseDto,
      isArray:true
  })
  @ApiResponse({
      status: 500,
      description: '멘토 수입 내역 목록을 찾을 수 없습니다.',
  })
  async getMentorIncome(
    @User() userId:string,
    @Query() query: PaginationDto,
  ) {
    return this.paymentService.getMentorIncome(userId, query);
  }
  @UseGuards(JwtAuthGuard)
  @Get('mentee-income')
  @ApiOperation({ summary: '멘티 결제 내역 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
      status: 200,
      description: '멘티 결제 내역',
      type: MenteePaymentHistoryDto,
      isArray:true
  })
  @ApiResponse({
      status: 500,
      description: '멘티 결제 내역 목록을 찾을 수 없습니다.',
  })
  async getMenteeIncome(
    @User() userId:string,
    @Query() query: PaginationDto,
  ) {
    return this.paymentService.getMenteeIncome(userId, query);
  }
  @UseGuards(JwtAuthGuard)
  @Post('refund')
  @ApiOperation({ summary: '결제 환불' })
  async refundPayment(
    @User() userId: string,
    @Body() body: RefundPaymentDto,
  ) {
    return this.paymentService.refundPayment(userId, body);
  }
}
