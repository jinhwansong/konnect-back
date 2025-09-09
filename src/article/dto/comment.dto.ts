import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: '좋은 글 감사합니다!' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class PatchCommentDto {
  @ApiProperty({ example: '좋은 글 감사합니다!' })
  @IsString()
  content: string;
}

class AuthorDto {
  @ApiProperty({ example: '홍길동', description: '닉네임' })
  nickname: string;

  @ApiProperty({
    example: '/uploads/profile.jpg',
    description: '프로필 이미지',
    required: false,
  })
  profile?: string;
}

class ReplyDto {
  @ApiProperty({ example: 'uuid', description: '대댓글 ID' })
  id: string;

  @ApiProperty({ example: '저도 동의합니다!', description: '대댓글 내용' })
  content: string;

  @ApiProperty({ example: '2025-09-10T12:30:00.000Z', description: '작성일' })
  createdAt: Date;

  @ApiProperty({ type: AuthorDto })
  author: AuthorDto;
}
export class CommentItemDto {
  @ApiProperty({ example: 'uuid', description: '댓글 ID' })
  id: string;

  @ApiProperty({ example: '좋은 글 감사합니다!', description: '댓글 내용' })
  content: string;

  @ApiProperty({ example: '2025-09-10T12:00:00.000Z', description: '작성일' })
  createdAt: Date;

  @ApiProperty({ type: AuthorDto })
  author: AuthorDto;

  @ApiProperty({ type: [ReplyDto], description: '대댓글 목록' })
  children: ReplyDto[];
}
