import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateChatRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: '멘토링 101반',
    description: '채팅방의 표시 이름',
    required: true,
  })
  name: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    example: ['mentor-123', 'mentee-456'],
    description: '참여자 사용자 ID 목록 (멘토/멘티 포함)',
    type: [String],
    required: true,
  })
  participants: string[];
}

export class ChatRoomListQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '멘토링',
    description: '검색 키워드 (방 이름 기준)',
    required: false,
  })
  keyword?: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user-123',
    description: '보낸 사람 사용자 ID',
    required: true,
  })
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @ApiProperty({
    example: '안녕하세요',
    description: '메시지 본문',
    required: true,
  })
  message: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'https://example.com/file.pdf',
    description: '파일 URL (있는 경우)',
    required: false,
  })
  fileUrl?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'document.pdf',
    description: '파일 이름 (있는 경우)',
    required: false,
  })
  fileName?: string;
}

export class IssueWebRTCTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'room-abc',
    description: '참여할 채팅/화상 방 ID',
    required: true,
  })
  roomId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user-123',
    description: '토큰을 발급받으려는 사용자 ID',
    required: true,
  })
  userId: string;
}
