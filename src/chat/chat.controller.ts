import { JwtAuthGuard } from '@/common/guard/jwt.guard';
import { User } from '@/common/decorators/user.decorator';
import { UndefinedToNullInterceptor } from '@/common/interceptors/undefinedToNull.Interceptor';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ChatRoomListQueryDto,
  GetRoomMessagesQueryDto,
  IssueWebRTCTokenDto,
  SendMessageDto,
} from './dto/chat.dto';
import {
  ChatRoomListResponseDto,
  ChatMessageResponseDto,
  ChatMessageListPaginationDto,
  WebRTCTokenResponseDto,
} from './dto/message.dto';
import { ChatService } from './chat.service';

@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('Chat & Video Chat')
@Controller('chat')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  

  @ApiOperation({ summary: '채팅방 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '채팅방 목록을 조회했습니다.',
    type: ChatRoomListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Get('rooms')
  @HttpCode(HttpStatus.OK)
  async listRooms(
    @User('id') userId: string,
    @Query() query: ChatRoomListQueryDto,
  ) {
    const data = await this.chatService.listRooms(userId, query.keyword);
    return {
      message: '채팅방 목록을 조회했습니다.',
      data,
    };
  }

  @ApiOperation({ summary: '특정 방 메시지 조회 (무한스크롤)' })
  @ApiResponse({
    status: 200,
    description: '메시지 목록을 조회했습니다.',
    type: ChatMessageListPaginationDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiResponse({
    status: 404,
    description: '채팅방을 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Get('rooms/:roomId/messages')
  @HttpCode(HttpStatus.OK)
  async getRoomMessages(
    @User('id') userId: string,
    @Param('roomId') roomId: string,
    @Query() query: GetRoomMessagesQueryDto,
  ) {
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    return this.chatService.getRoomMessages(
      roomId,
      userId,
      query.cursor,
      limit,
    );
  }

  @ApiOperation({ summary: '메시지 전송' })
  @ApiResponse({
    status: 201,
    description: '메시지를 전송했습니다.',
    type: ChatMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '유효성 검증 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiResponse({
    status: 404,
    description: '채팅방을 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Post('rooms/:roomId/messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @User('id') userId: string,
    @Param('roomId') roomId: string,
    @Body() body: SendMessageDto,
  ) {
    return this.chatService.sendMessage(
      roomId,
      userId,
      body.message,
      body.fileUrl,
      body.fileName,
    );
    
  }

  @ApiOperation({ summary: '화상채팅 방 참여 토큰 발급' })
  @ApiResponse({
    status: 200,
    description: 'WebRTC 토큰을 발급했습니다.',
    type: WebRTCTokenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '유효성 검증 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  @ApiResponse({
    status: 404,
    description: '채팅방을 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Post('webrtc/token')
  @HttpCode(HttpStatus.OK)
  async issueWebRTCToken(
    @User('id') userId: string,
    @Body() body: IssueWebRTCTokenDto,
  ) {
    return this.chatService.issueWebRTCToken(body.roomId, userId);
    
  }
}


