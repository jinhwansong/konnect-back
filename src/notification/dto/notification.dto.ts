import { NotificationType } from '@/common/enum/status.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  @IsNotEmpty()
  @ApiProperty({
    enum: NotificationType,
    description: '알림 타입',
    example: NotificationType.RESERVATION,
  })
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '알림 메시지',
    example: '결제가 완료되었습니다.',
  })
  message: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '알림 클릭 시 이동할 링크',
    example: '/payment/123',
    required: false,
  })
  link?: string;
}

export class NotificationResponseDto {
  @IsUUID()
  @ApiProperty({
    description: '알림 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @IsEnum(NotificationType)
  @ApiProperty({
    enum: NotificationType,
    description: '알림 타입',
    example: NotificationType.RESERVATION,
  })
  type: NotificationType;

  @IsString()
  @ApiProperty({
    description: '알림 메시지',
    example: '결제가 완료되었습니다.',
  })
  message: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '알림 클릭 시 이동할 링크',
    example: '/payment/123',
    required: false,
  })
  link?: string;

  @ApiProperty({
    description: '읽음 여부',
    example: false,
    default: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: '알림 생성 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '알림 수정 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class MarkAllAsReadResponseDto {
  @ApiProperty({
    description: '처리 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '처리된 알림 개수',
    example: 5,
    required: false,
  })
  affected?: number;
}

export class UnreadCountResponseDto {
  @ApiProperty({
    description: '읽지 않은 알림 개수',
    example: 5,
  })
  count: number;
}