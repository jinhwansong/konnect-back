import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@/common/dto/page.dto';

export class AdminQueryDto extends PaginationDto {
  @ApiProperty({ description: '검색어', required: false })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ description: '정렬 (field:direction)', required: false, example: 'createdAt:desc' })
  @IsOptional()
  @IsString()
  sort?: string;
}

