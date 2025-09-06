import { JwtAuthGuard } from '@/common/guard/jwt.guard';
import { User } from '@/common/decorators/user.decorator';
import { PaginationDto } from '@/common/dto/page.dto';
import { UndefinedToNullInterceptor } from '@/common/interceptors/undefinedToNull.Interceptor';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { CreateReviewDto } from './dto/create.review.dto';
import {
  ReviewMyListItemDto,
  ReviewReceivedListItemDto,
} from './dto/get.review.dto';
import { UpdateReviewDto } from './dto/update.review.dto';
import { ReviewService } from './review.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('Review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiOperation({ summary: '멘토링 후기 작성' })
  @ApiResponse({
    status: 201,
    description: '후기를 작성하셨습니다.',
  })
  @ApiResponse({
    status: 400,
    description:
      '잘못된 요청. 유효하지 않은 예약 ID이거나 예약 상태가 완료되지 않음.',
  })
  @ApiResponse({
    status: 404,
    description: '예약 또는 유저를 찾을 수 없음.',
  })
  @ApiResponse({
    status: 409,
    description: '이미 후기를 작성한 예약입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '후기 작성 중 서버 오류가 발생했습니다.',
  })
  @Post('')
  create(@Body() body: CreateReviewDto, @User('id') userId: string) {
    return this.reviewService.createReview(body, userId);
  }

  @ApiOperation({ summary: '후기 수정' })
  @ApiResponse({ status: 200, description: '후기 수정 성공' })
  @ApiResponse({ status: 403, description: '작성자 본인만 수정 가능' })
  @ApiResponse({ status: 404, description: '리뷰를 찾을 수 없음' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateReviewDto,
    @User('id') userId: string,
  ) {
    return this.reviewService.updateReview(id, body, userId);
  }

  @ApiOperation({ summary: '후기 삭제' })
  @ApiResponse({ status: 200, description: '후기 삭제 성공' })
  @ApiResponse({ status: 403, description: '작성자 본인만 삭제 가능' })
  @ApiResponse({ status: 404, description: '리뷰를 찾을 수 없음' })
  @Delete(':id')
  Delete(@Param('id') id: string, @User('id') userId: string) {
    return this.reviewService.deleteReview(id, userId);
  }

  @ApiOperation({ summary: '내가 쓴 후기 조회' })
  @ApiResponse({
    status: 200,
    type: ReviewMyListItemDto,
    description: '내가 쓴 후기 조회',
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
  @Get('/my')
  getMyReviews(@User('id') userId: string, @Query() query: PaginationDto) {
    return this.reviewService.getMyReviews(userId, query);
  }

  @ApiOperation({ summary: '내가 받은 후기 조회 (멘토)' })
  @ApiResponse({
    status: 200,
    type: ReviewReceivedListItemDto,
    description: '내가 받은 후기 조회 (멘토)',
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
  @Get('/received')
  getMentorReceivedReviews(
    @User('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.reviewService.getMentorReceivedReviews(userId, query);
  }
}
