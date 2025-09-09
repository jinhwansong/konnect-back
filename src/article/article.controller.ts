import { JwtAuthGuard } from '@/common/guard/jwt.guard';
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
  ParseArrayPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
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
import {
  CommentItemDto,
  CreateCommentDto,
  PatchCommentDto,
} from './dto/comment.dto';
import { PaginationDto } from '@/common/dto/page.dto';

@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('Article')
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({ summary: '아티클 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'sort',
    required: false,
    example: 'latest',
    description: '정렬 기준: latest | likes',
  })
  @ApiQuery({
    name: 'category',
    required: false,
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
  async getArticles(@Query() body: ArticleQueryDto) {
    return this.articleService.getArticles(body);
  }

  @ApiOperation({ summary: '아티클 작성' })
  @Roles(UserRole.MENTOR)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    createMultiUploadInterceptor(
      [{ name: 'thumbnail', maxCount: 1 }],
      'uploads/article',
    ),
  )
  @ApiResponse({
    status: 200,
    description: '아티클 작성 성공',
    type: CreateArticleDto,
  })
  @ApiResponse({
    status: 404,
    description: '멘토를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '아티클 생성 중 오류가 발생했습니다.',
  })
  @Post('')
  async createArticle(
    @Body() body: CreateArticleDto,
    @User('id') userId: string,
    @UploadedFiles() files?: { thumbnail?: Express.Multer.File[] },
  ) {
    const thumbnail = files?.thumbnail?.[0];
    return this.articleService.createArticle(body, userId, thumbnail);
  }

  @ApiOperation({ summary: '좋아요 여부확인' })
  @UseGuards(JwtAuthGuard)
  @Get('liked')
  async getLikedArticles(
    @Query('ids', new ParseArrayPipe({ items: String })) ids: string[],
    @User('id') userId: string,
  ) {
    return this.articleService.getLikedArticles(ids, userId);
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
    @User('id') userId?: string,
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
  async deleteArticle(@Param('id') id: string, @User('id') userId: string) {
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
    @User('id') userId: string,
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
  @Patch(':id/like')
  async toggleArticleLike(
    @Param('id') articleId: string,
    @User('id') userId: string,
  ) {
    return this.articleService.likedArticle(articleId, userId);
  }

  @ApiOperation({ summary: '이미지 업로드 (아티클)' })
  @UseInterceptors(
    createMultiUploadInterceptor(
      [{ name: 'images', maxCount: 10 }],
      'uploads/article',
    ),
  )
  @ApiConsumes('multipart/form-data')
  @Post('upload-image')
  async uploadArticleEditorImages(
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    return this.articleService.uploadEditorImages(files);
  }

  /** 댓글 부분 */

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '댓글/대댓글 작성' })
  @ApiResponse({ status: 201, description: '댓글/대댓글이 작성되었습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 404, description: '아티클을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Post(':articleId/comment')
  async createComment(
    @Param('articleId') articleId: string,
    @User('id') userId: string,
    @Body() body: CreateCommentDto,
  ) {
    return this.articleService.createComment(articleId, userId, body);
  }

  @ApiOperation({ summary: '댓글 목록 조회 (대댓글 포함)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: '댓글 목록 조회 성공',
    type: CommentItemDto,
  })
  @ApiResponse({ status: 404, description: '아티클을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Get(':articleId/comment')
  async getComment(
    @Param('articleId') articleId: string,
    @Query() dto: PaginationDto,
  ) {
    return this.articleService.getComment(articleId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '댓글 수정' })
  @ApiResponse({ status: 200, description: '댓글이 수정되었습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 403, description: '수정 권한 없음' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Patch('comment/:id')
  async updateComment(
    @Param('id') id: string,
    @User('id') userId: string,
    @Body() body: PatchCommentDto,
  ) {
    return this.articleService.updateComment(id, userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiResponse({ status: 200, description: '댓글이 삭제되었습니다.' })
  @ApiResponse({ status: 403, description: '삭제 권한 없음' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Delete('comment/:id')
  async deleteComment(@Param('id') id: string, @User('id') userId: string) {
    return this.articleService.deleteComment(id, userId);
  }
}
