import { PaginationDto } from '@/common/dto/page.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

class MentorInfo {
  @ApiProperty({ description: '멘토 닉네임', example: '라이언' })
  nickname: string;

  @ApiProperty({ description: '멘토 프로필 이미지 URL', example: 'https://...' })
  image: string;

  @ApiProperty({ description: '멘토 직책', example: '프론트엔드 개발자' })
  position: string;

  @ApiProperty({ description: '경력', example: '3년' })
  career: string;

  @ApiProperty({ description: '회사명 (비공개 시 null)', example: '비공개 또는 삼성전자' })
  company: string | null;
}

class ReviewPreview {
  @ApiProperty({ description: '리뷰 내용', example: '정말 친절하셨어요!' })
  content: string;

  @ApiProperty({ description: '평점', example: 5 })
  rating: number;

  @ApiProperty({ description: '작성일', example: '2025-07-07T14:12:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '작성자 닉네임', example: '홍길동' })
  nickname: string;
}

export class SessionListItemDto {
  @ApiProperty({ description: '세션 ID', example: 'uuid값' })
  id: string;

  @ApiProperty({ description: '세션 제목', example: '리액트 마스터 클래스' })
  title: string;

  @ApiProperty({ description: '세션 설명', example: '입문자를 위한 리액트 기초 강의입니다.' })
  description: string;

  @ApiProperty({ description: '가격 (원)', example: 30000 })
  price: number;

  @ApiProperty({ description: '멘토링 시간 (분)', example: 60 })
  duration: number;

  @ApiProperty({ description: '카테고리 (선택)', example: '프론트엔드', required: false })
  category?: string;

  @ApiProperty({ description: '평점 평균 (선택)', example: 4.8, required: false })
  averageRating?: number;

  @ApiProperty({ type: MentorInfo })
  mentor: MentorInfo;

  @ApiProperty({ type: [ReviewPreview], description: '리뷰 미리보기 3개 (최신순)' })
  previewReviews: ReviewPreview[];
}

export class SessionQueryDto extends PaginationDto{
  @ApiPropertyOptional({
    example: 'latest',
    description: '정렬 기준: latest | mentor | rating',
  })
  @IsOptional()
  @IsIn(['latest', 'mentor', 'rating'])
  sort?: 'latest' | 'mentor' | 'rating';
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '데이터사이언스',
    description: '멘토링분야',
    required: true,
  })
  category?: string;
}