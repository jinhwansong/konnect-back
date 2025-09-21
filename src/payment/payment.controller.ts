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
  Get,
  HttpCode,
  HttpStatus,
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
  MenteePaymentHistoryDto,
  MentorIComeResponseDto,
} from './dto/icome.dto';
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '결제 성공 시 Toss confirm 처리' })
  @ApiResponse({
    status: 200,
    description: '결제가 성공적으로 처리되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '결제 정보가 올바르지 않거나 이미 처리된 결제입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '결제 처리 중 오류가 발생했습니다.',
  })
  async confirmPayment(
    @Body() body: ConfirmPaymentDto,
    @User('id') userId: string,
  ) {
    return this.paymentService.confirmPayment(body, userId);
  }

  @Roles(UserRole.MENTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('mentor-income')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '멘토 수입 내역 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: '멘토 수입 내역',
    type: MentorIComeResponseDto,
    isArray: true,
  })
  @ApiResponse({
    status: 403,
    description: '멘토 권한이 필요합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '멘토 수입 내역 목록을 찾을 수 없습니다.',
  })
  async getMentorIncome(
    @User('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.paymentService.getMentorIncome(userId, query);
  }
  @UseGuards(JwtAuthGuard)
  @Get('mentee-income')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '멘티 결제 내역 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: '멘티 결제 내역',
    type: MenteePaymentHistoryDto,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: '멘티 결제 내역 목록을 찾을 수 없습니다.',
  })
  async getMenteeIncome(
    @User('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.paymentService.getMenteeIncome(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '결제 환불' })
  @ApiResponse({
    status: 200,
    description: '환불이 성공적으로 처리되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '환불할 수 없는 결제입니다.',
  })
  @ApiResponse({
    status: 404,
    description: '결제 정보를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '환불 처리 중 오류가 발생했습니다.',
  })
  async refundPayment(
    @User('id') userId: string,
    @Body() body: RefundPaymentDto,
  ) {
    return this.paymentService.refundPayment(userId, body);
  }
}
