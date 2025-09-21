import {
  MentorCareerLevel,
  MentoringCategory,
  MentorPosition,
} from '@/common/enum/category.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Google',
    description: '소속 회사명',
    required: false,
  })
  company: string;
}
export class UpdatePositionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: MentorPosition.BACKEND,
    description: '직책',
    enum: MentorPosition,
  })
  @IsEnum(MentorPosition)
  position: string;
}
export class UpdateExpertiseDto {
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
  expertise: MentoringCategory[];
}
export class UpdateCareerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: MentorCareerLevel.JUNIOR,
    description: '연차',
    enum: MentorCareerLevel,
  })
  @IsEnum(MentorCareerLevel)
  career: string;
}
export class UpdateCompanyHiddenDto {
  @ApiProperty({ example: true, description: '회사명 공개 여부' })
  @IsBoolean()
  isCompanyHidden?: boolean;
}
