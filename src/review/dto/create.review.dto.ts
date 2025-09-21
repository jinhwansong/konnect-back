import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ 
    description: '예약 ID',
    example: 'uuid-string-here' 
  })
  @IsUUID()
  reservationId: string;

  @ApiProperty({ 
    description: '평점 (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ 
    description: '후기 내용',
    example: '정말 좋았습니다.' 
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
