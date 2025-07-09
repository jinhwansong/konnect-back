import { JwtAuthGuard } from '@/auth/jwt.guard';
import { ARTICLE_UPLOAD_FIELDS } from '@/common/constants/upload.fields';
import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
import { UserRole } from '@/common/enum/status.enum';
import { createMultiUploadInterceptor } from '@/common/interceptors/multer.interceptor';
import { UndefinedToNullInterceptor } from '@/common/interceptors/undefinedToNull.Interceptor';
import { createMulterOptions } from '@/common/util/multer.options';
import { ToggleLikeResponseDto } from '@/review/dto/like.response.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ArticleService } from './article.service';
import {
  ArticleDetailDto,
  ArticleListItemDto,
  ArticleQueryDto,
  CreateArticleDto,
} from './dto/article.dto';

@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('Article')
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({ summary: '아티클 목록 조회' })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: '페이지 번호',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: '페이지당 개수',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    example: 'latest',
    description: '정렬 기준: latest | likes',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    example: 'IT',
    description: '카테고리 이름 (선택)',
  })
  @ApiResponse({
    status: 200,
    description: '아티클 목록 조회 성공',
    type: ArticleListItemDto,
    isArray: true,
  })
  @ApiResponse({ status: 500, description: '서버 오류 또는 목록 조회 실패' })
  @Get('')
  async getArticles(@Query() dto: ArticleQueryDto) {
    return this.articleService.getArticles(dto);
  }

  @ApiOperation({ summary: '아티클 작성' })
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.MENTOR)
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    createMultiUploadInterceptor(ARTICLE_UPLOAD_FIELDS, 'uploads/article'),
  )
  @ApiResponse({
    status: 200,
    description: '아티클 작성 성공',
    type: CreateArticleDto,
  })
  @Post('')
  async createArticle(
    @Body() body: CreateArticleDto,
    @User() userId: string,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ) {
    return this.articleService.createArticle(body, userId, thumbnail);
  }

  @ApiOperation({ summary: '아티클 상세 조회 (조회수 증가)' })
  @ApiResponse({
    status: 200,
    description: '아티클 상세 조회 성공',
    type: ArticleDetailDto,
  })
  @Get(':id')
  async getArticleDetail(
    @Param('id') id: string,
    @Req() req: Request,
    @User() userId?: string,
    @Ip() ip?: string,
  ) {
    const clientIp = ip || req.socket.remoteAddress || 'unknown';
    return this.articleService.getArticleDetail(id, userId, clientIp);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.MENTOR)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @ApiOperation({ summary: '아티클 삭제 (작성자 전용)' })
  async deleteArticle(@Param('id') id: string, @User() userId?: string) {
    return this.articleService.deleteArticle(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.MENTOR)
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('thumbnail', createMulterOptions('uploads/article')),
  )
  @ApiBody({ type: CreateArticleDto })
  @ApiOperation({ summary: '아티클 수정' })
  async updateArticle(
    @Param('id') id: string,
    @Body() body: CreateArticleDto,
    @User() userId: string,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ) {
    return this.articleService.updateArticle(
      id,
      body,
      userId,
      thumbnail || null,
    );
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '좋아요 토글' })
  @ApiResponse({
    status: 200,
    type: ToggleLikeResponseDto,
    description: '좋아요 상태 토글 완료',
  })
  @ApiResponse({ status: 404, description: '아티클이 존재하지 않음' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  @Post(':id/like')
  toggleArticleLike(@Param('id') articleId: string, @User() userId: string) {
    return this.articleService.likedArticle(articleId, userId);
  }
}
