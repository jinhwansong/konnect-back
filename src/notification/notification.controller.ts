import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
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
import { NotificationService } from './notification.service';
import { User } from '@/common/decorators/user.decorator';
import {
  CreateNotificationDto,
  MarkAllAsReadResponseDto,
  NotificationResponseDto,
} from './dto/notification.dto';
import { UpdateFcmTokenDto } from './dto/fcm.dto';
import { UndefinedToNullInterceptor } from '@/common/interceptors/undefinedToNull.Interceptor';
import { JwtAuthGuard } from '@/common/guard/jwt.guard';

@ApiTags('notification')
@Controller('notification')
@UseInterceptors(UndefinedToNullInterceptor)
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '내 알림 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '알림 목록 조회 성공',
    type: [NotificationResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  async getMyNotifications(@User('id') userId: string) {
    return this.notificationService.findByUser(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: '읽지 않은 알림 개수 조회' })
  @ApiResponse({
    status: 200,
    description: '읽지 않은 알림 개수 조회 성공',
    schema: {
      example: { count: 5 },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  async getUnreadCount(@User('id') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Post()
  @ApiOperation({ summary: '알림 생성 (테스트용 또는 내부 호출)' })
  @ApiResponse({
    status: 201,
    description: '알림 생성 성공',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  @HttpCode(201)
  async create(
    @User('id') userId: string,
    @Body() body: CreateNotificationDto,
  ) {
    return this.notificationService.save(
      null,
      userId,
      body.type,
      body.message,
      body.link,
    );
  }
  @HttpCode(200)
  @ApiOperation({ summary: '내 모든 알림 삭제' })
  @ApiResponse({
    status: 200,
    description: '모든 알림 삭제 성공',
    schema: {
      example: { message: '모든 알림 삭제 성공' },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  @Delete('all')
  async deleteAll(@User('id') userId: string) {
    return this.notificationService.deleteAll(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: '알림 읽음 처리' })
  @ApiResponse({
    status: 200,
    description: '알림 읽음 처리 성공',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
  })
  @ApiResponse({
    status: 404,
    description: '알림을 찾을 수 없음',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  @HttpCode(200)
  async markAsRead(@User('id') userId: string, @Param('id') id: string) {
    return this.notificationService.markAsRead(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '알림 삭제' })
  @ApiResponse({
    status: 200,
    description: '알림 삭제 성공',
    schema: {
      example: { success: true },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
  })
  @ApiResponse({
    status: 404,
    description: '알림을 찾을 수 없음',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  @HttpCode(200)
  async delete(@Param('id') id: string, @User('id') userId: string) {
    return this.notificationService.delete(id, userId);
  }

  @Patch('read/all')
  @ApiOperation({ summary: '내 모든 알림 읽음 처리' })
  @ApiResponse({
    status: 200,
    description: '모든 알림 읽음 처리 성공',
    type: MarkAllAsReadResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  @HttpCode(200)
  async markAllAsRead(@User('id') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Patch('fcm-token')
  async updateFcmToken(
    @User('id') userId: string,
    @Body() body: UpdateFcmTokenDto,
  ) {
    return this.notificationService.updateFcmToken(userId, body.token);
  }

  // 경로 파라미터는 실제 FCM 토큰 문자열을 의미하도록 token 으로 명시
  @Delete('fcm-token/:token')
  async removeFcmToken(
    @User('id') userId: string,
    @Param('token') token: string,
  ) {
    return this.notificationService.removeToken(userId, token);
  }
}
