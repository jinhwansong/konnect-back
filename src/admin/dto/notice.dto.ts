import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoticeDto {
  @ApiProperty({ example: '공지사항 제목', description: '제목' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: '공지사항 내용', description: '내용' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ example: true, description: '발행 여부', default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateNoticeDto {
  @ApiProperty({ example: '공지사항 제목', description: '제목', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: '공지사항 내용', description: '내용', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ example: true, description: '발행 여부', required: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class NoticeDto {
  @ApiProperty({ example: 'uuid', description: '공지사항 ID' })
  id: string;

  @ApiProperty({ example: '공지사항 제목', description: '제목' })
  title: string;

  @ApiProperty({ example: '공지사항 내용', description: '내용' })
  content: string;

  @ApiProperty({ example: true, description: '발행 여부' })
  published: boolean;

  @ApiProperty({ example: '2025-11-12T00:00:00.000Z', description: '생성일' })
  createdAt: Date;

  @ApiProperty({ example: '2025-11-12T00:00:00.000Z', description: '수정일' })
  updatedAt: Date;
}

