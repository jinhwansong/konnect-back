import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";

export class CreateReviewDto {
  @IsString()
  reservationId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreateReviewResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: '정말 좋았습니다.' })
  content: string;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: '2025-07-07T10:00:00Z' })
  createdAt: Date;
}