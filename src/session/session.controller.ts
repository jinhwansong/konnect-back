import { PaginationDto } from '@/common/dto/page.dto';
import { ReviewListItemDto } from '@/review/dto/get.review.dto';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
    constructor(private readonly sessionService:SessionService){}
    @ApiOperation({ summary: '세션별 후기 조회' })
    @ApiResponse({
        status: 200,
        type: ReviewListItemDto,
        description: '세션에 등록된 후기 목록',
        isArray:true
    })
    @ApiResponse({ status: 404, description: '해당 세션을 찾을 수 없습니다.' })
    @ApiResponse({ status: 500, description: '서버 오류' })
    @ApiQuery({ name: 'page', required: false, example: 1, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, example: 10, description: '페이지당 개수 (기본값: 10)' })
    @Get(':id/reviews')
    getReviews(@Param('id') sessionId: string,@Query() query: PaginationDto) {
    return this.sessionService.getMentorReviews(sessionId,query);
    }
}
