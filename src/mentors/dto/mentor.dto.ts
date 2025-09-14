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
  @IsEnum(MentoringCategory, { each: true })
  @ApiProperty({
    example: [MentoringCategory.CONSULTING, MentoringCategory.DESIGN],
    description: '전문 분야 (다중 선택)',
    enum: MentoringCategory,
    type: [String],
  })
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

export class MentorProfileResponseDto {
  @ApiProperty({ example: '멘토 정보 입니다.', description: '응답 메시지' })
  message: string;

  @ApiProperty({ example: '5년차 백엔드 개발자', description: '경력' })
  career: string;

  @ApiProperty({ example: '네이버', description: '회사명' })
  company: string;

  @ApiProperty({
    example: '백엔드 개발, 시스템 설계',
    description: '전문 분야',
  })
  expertise: string;

  @ApiProperty({
    example: false,
    description: '회사명 공개 여부 (true = 숨김)',
  })
  isCompanyHidden: boolean;

  @ApiProperty({ example: '시니어 엔지니어', description: '직무/직책' })
  position: string;
}
