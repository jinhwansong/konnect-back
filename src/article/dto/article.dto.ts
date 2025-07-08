import { PaginationDto } from "@/common/dto/page.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";

export class ArticleQueryDto extends PaginationDto{
    @ApiPropertyOptional({
    example: 'latest',
    description: '정렬 기준 (latest | likes)',
    default: 'latest',
  })
  @IsOptional()
  @IsIn(['latest', 'likes'])
  sort?: 'latest' | 'likes' = 'latest';
}