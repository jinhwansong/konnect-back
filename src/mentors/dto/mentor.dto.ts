import {
  MentorCareerLevel,
  MentoringCategory,
  MentorPosition,
} from '@/common/enum/category.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
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
    example: MentorPosition.BACKEND,
    description: '직책',
    enum: MentorPosition,
  })
  @IsEnum(MentorPosition)
  position: string;
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @ApiProperty({
    example: [MentoringCategory.CONSULTING, MentoringCategory.DESIGN],
    description: '전문 분야 (다중 선택)',
    enum: MentoringCategory,
    type: [String],
  })
  @IsEnum(MentoringCategory)
  expertise: string[];
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: MentorCareerLevel.JUNIOR,
    description: '연차',
    enum: MentorCareerLevel,
  })
  @IsEnum(MentorCareerLevel)
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
