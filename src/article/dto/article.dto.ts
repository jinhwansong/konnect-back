import { PaginationDto } from '@/common/dto/page.dto';
import { ArticleCategory } from '@/common/enum/category.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class ArticleQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'latest',
    description: '정렬 기준 (latest | likes)',
    default: 'latest',
  })
  @IsOptional()
  @IsIn(['latest', 'likes'])
  sort?: 'latest' | 'likes' = 'latest';
  @ApiPropertyOptional()
  category?: string;
}

export class CreateArticleDto {
  @ApiProperty({ example: '제목입니다.', description: '아티클 제목' })
  title: string;

  @ApiProperty({ example: '내용입니다.', description: '아티클 내용' })
  content: string;

  @ApiProperty({
    example: ArticleCategory.BOOK,
    description: '아티클 카테고리',
    enum: ArticleCategory,
  })
  category: ArticleCategory;
}

export class ArticleListItemDto {
  @ApiProperty({ example: 'uuid-1234' })
  id: string;

  @ApiProperty({ example: '제목입니다.', description: '아티클 제목' })
  title: string;

  @ApiProperty({ example: '/uploads/article/thumbnail.jpg', nullable: true })
  thumbnailUrl: string;

  @ApiProperty({ example: 53 })
  views: number;

  @ApiProperty({ example: 12 })
  likeCount: number;

  @ApiProperty()
  createdAt: Date;
}

export class ArticleDetailDto {
  @ApiProperty({ example: '아티클 제목입니다.' })
  title: string;

  @ApiProperty({ example: '<p>아티클 내용입니다.</p><img src="...">' })
  content: string;

  @ApiProperty({ example: '2025-07-08T15:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: 123, description: '조회수' })
  views: number;

  @ApiProperty({ example: 7, description: '좋아요 수' })
  likeCount: number;

  @ApiProperty({ example: '라이언', description: '작성자 닉네임' })
  authorNickname: string;

  @ApiProperty({
    example: 'https://cdn.konnect.com/profile.jpg',
    description: '작성자 프로필 이미지 URL',
  })
  authorImage: string;

  @ApiProperty({ example: 'uuid-author-id', description: '작성자 ID' })
  authorId: string;
}
