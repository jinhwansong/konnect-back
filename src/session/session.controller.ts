import { PaginationDto } from '@/common/dto/page.dto';
import { ReviewListItemDto } from '@/review/dto/get.review.dto';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SessionListItemDto, SessionQueryDto } from './dto/session.dto';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}
  @ApiOperation({ summary: '세션별 후기 조회' })
  @ApiResponse({
    status: 200,
    type: ReviewListItemDto,
    description: '세션에 등록된 후기 목록',
    isArray: true,
  })
  @ApiResponse({ status: 404, description: '해당 세션을 찾을 수 없습니다.' })
  @ApiResponse({ status: 500, description: '서버 오류' })
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
  @Get(':id/reviews')
  getReviews(@Param('id') sessionId: string, @Query() query: PaginationDto) {
    return this.sessionService.getMentorReviews(sessionId, query);
  }

  @ApiOperation({ summary: '멘토가 등록한 세션 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'sort',
    required: false,
    example: 'latest',
    description: 'latest | mentor | rating',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: '카테고리 이름 (선택)',
  })
  @ApiResponse({
    status: 200,
    description: '등록된 세션 목록',
    isArray: true,
    type: SessionListItemDto,
  })
  @ApiResponse({
    status: 500,
    description: '등록된 세션 목록을 찾을 수 없습니다.',
  })
  @Get('')
  async getSession(@Query() dto: SessionQueryDto) {
    return this.sessionService.getSession(dto);
  }

  @ApiOperation({ summary: '멘토가 등록한 세션 상세 조회' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: '세션을 찾을 수 없습니다.' })
  @Get(':id')
  async getSessionDetail(@Param('id') sessionId: string) {
    return this.sessionService.getSessionDetail(sessionId);
  }
}
