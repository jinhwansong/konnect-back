import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateMentorDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Google',
    description: '소속 회사명',
    required: false,
  })
  company: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '10년차 프론트엔드 개발자입니다.',
    description: '멘토 자기소개',
    required: true,
  })
  introduce: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '프론트엔드',
    description: '직책',
    required: false,
  })
  position: string;
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @ApiProperty({
    example: ['it', 'marketing'],
    description: '전문 분야 (다중 선택)',
    required: true,
    type: [String],
  })
  expertise: string[];
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '주니어(1~3년)',
    description: '연차',
    required: true,
  })
  career: string;
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({
    example: 'https://portfolio.example.com',
    description: '포트폴리오 페이지 url',
    required: true,
  })
  portfolio: string;
}
