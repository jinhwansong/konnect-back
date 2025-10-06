import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatRoomListQueryDto, CreateChatRoomDto, IssueWebRTCTokenDto, SendMessageDto } from './dto/chat.dto';
import { ApiResponseDto, ChatMessageDto, ChatRoomSummaryDto, WebRTCTokenDto } from './dto/message.dto';

@ApiTags('Chat & Video Chat')
@Controller('chat')
export class ChatController {
  // 1) 채팅방 생성
  @Post('rooms')
  @ApiOperation({ summary: '채팅방 생성', description: '신규 채팅방을 생성합니다. (웹소켓 Gateway와 별개로 REST 기반 방 생성)' })
  @ApiBody({
    description: '채팅방 생성 요청 본문',
    schema: {
      example: {
        name: '멘토링 101반',
        description: '주 1회 멘토링 방',
        participants: ['mentor-123', 'mentee-456'],
      },
    },
  })
  @ApiResponse({ status: 200, description: '성공', schema: { example: { message: '방 생성 성공', data: { id: 'room-abc', name: '멘토링 101반', description: '주 1회 멘토링 방', participantCount: 2 } } } })
  @ApiResponse({ status: 400, description: '유효성 검증 실패' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '관련 리소스 없음' })
  createRoom(@Body() body: CreateChatRoomDto): ApiResponseDto<ChatRoomSummaryDto> {
    // 실제 로직은 Service에서 처리. 여기서는 Swagger 예시용 더미 응답을 반환.
    const room: ChatRoomSummaryDto = {
      id: 'room-abc',
      name: body.name,
      description: body.description,
      participantCount: body.participants.length,
    };
    return { message: '방 생성 성공', data: room };
  }

  // 2) 채팅방 목록 조회
  @Get('rooms')
  @ApiOperation({ summary: '채팅방 목록 조회', description: '생성된 채팅방 목록을 페치합니다.' })
  @ApiResponse({ status: 200, description: '성공', schema: { example: { message: '목록 조회 성공', data: [{ id: 'room-abc', name: '멘토링 101반', description: '주 1회 멘토링 방', participantCount: 2 }] } } })
  @ApiResponse({ status: 400, description: '유효성 검증 실패' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '관련 리소스 없음' })
  listRooms(@Query() _query: ChatRoomListQueryDto): ApiResponseDto<ChatRoomSummaryDto[]> {
    const rooms: ChatRoomSummaryDto[] = [
      { id: 'room-abc', name: '멘토링 101반', description: '주 1회 멘토링 방', participantCount: 2 },
    ];
    return { message: '목록 조회 성공', data: rooms };
  }

  // 3) 특정 채팅방 메시지 조회
  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: '특정 방 메시지 조회', description: '특정 채팅방의 메시지 기록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '성공', schema: { example: { message: '메시지 조회 성공', data: [{ id: 'msg-1', roomId: 'room-abc', userId: 'mentor-123', message: '안녕하세요', createdAt: '2025-10-06T10:00:00.000Z' }] } } })
  @ApiResponse({ status: 400, description: '유효성 검증 실패' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '방 또는 메시지 없음' })
  getRoomMessages(@Param('roomId') roomId: string): ApiResponseDto<ChatMessageDto[]> {
    const messages: ChatMessageDto[] = [
      { id: 'msg-1', roomId, userId: 'mentor-123', message: '안녕하세요', createdAt: new Date().toISOString() },
    ];
    return { message: '메시지 조회 성공', data: messages };
  }

  // 4) 메시지 전송
  @Post('rooms/:roomId/messages')
  @ApiOperation({ summary: '메시지 전송', description: '특정 채팅방으로 메시지를 전송합니다. (실제 송수신은 WebSocket으로 처리되며, 서버 저장/이력 접근은 REST로 접근)' })
  @ApiBody({
    description: '메시지 전송 요청 본문',
    schema: {
      example: {
        userId: 'mentee-456',
        message: '자료 공유 부탁드립니다.',
        fileUrl: undefined,
        fileName: undefined,
      },
    },
  })
  @ApiResponse({ status: 200, description: '성공', schema: { example: { message: '메시지 전송 성공', data: { id: 'msg-2', roomId: 'room-abc', userId: 'mentee-456', message: '자료 공유 부탁드립니다.', createdAt: '2025-10-06T10:10:00.000Z' } } } })
  @ApiResponse({ status: 400, description: '유효성 검증 실패' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '방 없음' })
  sendMessage(@Param('roomId') roomId: string, @Body() body: SendMessageDto): ApiResponseDto<ChatMessageDto> {
    const msg: ChatMessageDto = {
      id: 'msg-2',
      roomId,
      userId: body.userId,
      message: body.message,
      createdAt: new Date().toISOString(),
      fileUrl: body.fileUrl,
      fileName: body.fileName,
    };
    return { message: '메시지 전송 성공', data: msg };
  }

  // 5) 화상채팅 방 참여 토큰 발급
  @Post('webrtc/token')
  @ApiOperation({ summary: '화상채팅 방 참여 토큰 발급', description: 'WebRTC 시그널링/참여를 위해 필요한 토큰을 발급합니다.' })
  @ApiBody({
    description: '토큰 발급 요청 본문',
    schema: {
      example: {
        roomId: 'room-abc',
        userId: 'mentor-123',
      },
    },
  })
  @ApiResponse({ status: 200, description: '성공', schema: { example: { message: '토큰 발급 성공', data: { roomId: 'room-abc', userId: 'mentor-123', token: 'eyJhbGciOi...', expiresIn: 3600 } } } })
  @ApiResponse({ status: 400, description: '유효성 검증 실패' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '방 없음' })
  issueWebRTCToken(@Body() body: IssueWebRTCTokenDto): ApiResponseDto<WebRTCTokenDto> {
    const token: WebRTCTokenDto = {
      roomId: body.roomId,
      userId: body.userId,
      token: 'eyJhbGciOi...mock',
      expiresIn: 3600,
    };
    return { message: '토큰 발급 성공', data: token };
  }
}


