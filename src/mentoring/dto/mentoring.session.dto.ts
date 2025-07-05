import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateMentoringSessionDto {
  @ApiProperty({ example: 'React 기초 강의' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'React 기본 개념과 실습 중심의 수업입니다.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 50000, description: '가격 (₩)' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 60, description: '수업 시간 (분 단위)' })
  @IsNumber()
  @Min(1)
  duration: number;
}

export class MentoringSessionResponseDto {

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  createdAt: Date;

}