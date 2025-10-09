import { ApiProperty } from '@nestjs/swagger';

export class ChatRoomSummaryDto {
  @ApiProperty({
    example: 'room-abc',
    description: '채팅방 ID',
  })
  id: string;

  @ApiProperty({
    example: '멘토링 101반',
    description: '채팅방 이름',
  })
  name: string;

  @ApiProperty({
    example: 2,
    description: '참여자 수',
  })
  participantCount: number;
}

export class ChatMessageDto {
  @ApiProperty({
    example: 'msg-1',
    description: '메시지 ID',
  })
  id: string;

  @ApiProperty({
    example: 'room-abc',
    description: '채팅방 ID',
  })
  roomId: string;

  @ApiProperty({
    example: 'user-123',
    description: '발신자 ID',
  })
  userId: string;

  @ApiProperty({
    example: '안녕하세요',
    description: '메시지 내용',
  })
  message: string;

  @ApiProperty({
    example: '2025-10-06T10:00:00.000Z',
    description: '생성 시간 (ISO 문자열)',
  })
  createdAt: string;

  @ApiProperty({
    example: 'https://example.com/file.pdf',
    description: '파일 URL',
    required: false,
  })
  fileUrl?: string;

  @ApiProperty({
    example: 'document.pdf',
    description: '파일 이름',
    required: false,
  })
  fileName?: string;
}

export class WebRTCTokenDto {
  @ApiProperty({
    example: 'room-abc',
    description: '채팅방 ID',
  })
  roomId: string;

  @ApiProperty({
    example: 'user-123',
    description: '사용자 ID',
  })
  userId: string;

  @ApiProperty({
    example: 'eyJhbGciOi...',
    description: 'WebRTC 토큰',
  })
  token: string;

  @ApiProperty({
    example: 3600,
    description: '토큰 만료 시간 (초)',
  })
  expiresIn: number;
}

export class ChatRoomResponseDto {
  @ApiProperty({
    example: '채팅방이 생성되었습니다.',
    description: '응답 메시지',
  })
  message: string;

  @ApiProperty({
    type: ChatRoomSummaryDto,
    description: '채팅방 정보',
  })
  data: ChatRoomSummaryDto;
}

export class ChatRoomListResponseDto {
  @ApiProperty({
    example: '채팅방 목록을 조회했습니다.',
    description: '응답 메시지',
  })
  message: string;

  @ApiProperty({
    type: [ChatRoomSummaryDto],
    description: '채팅방 목록',
  })
  data: ChatRoomSummaryDto[];
}

export class ChatMessageResponseDto {
  @ApiProperty({
    example: '메시지를 전송했습니다.',
    description: '응답 메시지',
  })
  message: string;

  @ApiProperty({
    type: ChatMessageDto,
    description: '메시지 정보',
  })
  data: ChatMessageDto;
}

export class ChatMessageListResponseDto {
  @ApiProperty({
    example: '메시지 목록을 조회했습니다.',
    description: '응답 메시지',
  })
  message: string;

  @ApiProperty({
    type: [ChatMessageDto],
    description: '메시지 목록',
  })
  data: ChatMessageDto[];
}

export class WebRTCTokenResponseDto {
  @ApiProperty({
    example: 'WebRTC 토큰을 발급했습니다.',
    description: '응답 메시지',
  })
  message: string;

  @ApiProperty({
    type: WebRTCTokenDto,
    description: 'WebRTC 토큰 정보',
  })
  data: WebRTCTokenDto;
}
