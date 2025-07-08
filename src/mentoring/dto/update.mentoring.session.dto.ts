import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateMentoringSessionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()

  price?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  duration?: number;
}
export class UpdateSessionPublicDto {
  @ApiProperty({ example: true, description: '공개 여부' })
  @IsBoolean()
  isPublic: boolean;
}