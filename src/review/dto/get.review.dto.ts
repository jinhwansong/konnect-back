import { ApiProperty } from '@nestjs/swagger';

export class ReviewListItemDto {
  @ApiProperty({ example: 'review-uuid' })
  id: string;

  @ApiProperty({ example: '정말 좋았습니다!' })
  content: string;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: '2025-07-07T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: 3, description: '좋아요 수' })
  likeCount: number;
}
export class ReviewMyListItemDto extends ReviewListItemDto{

  @ApiProperty({ example: '리액트강의' })
  sessionTitle: string;
}