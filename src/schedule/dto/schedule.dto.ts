import { DayOfWeek } from '@/common/enum/day.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
  ValidateNested,
} from 'class-validator';

export class CreateMentoringScheduleDto {
  @ApiProperty({ enum: DayOfWeek })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ example: '10:00' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: '시간 형식은 HH:MM' })
  startTime: string;

  @ApiProperty({ example: '12:00' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: '시간 형식은 HH:MM' })
  endTime: string;
}

export class BulkCreateMentoringScheduleDto {
  @ApiProperty({ type: [CreateMentoringScheduleDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateMentoringScheduleDto)
  data: CreateMentoringScheduleDto[];
}

export class UpdateMentoringScheduleDto {
  @ApiPropertyOptional({ enum: DayOfWeek })
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime?: string;

  @ApiProperty({
    description: '정기스케줄 ID',
    example: 'b2a9c1ef-27f4-4c02-ae34-0fcecc30c9f1',
  })
  id?: string;
}

export class BulkUpdateMentoringScheduleDto {
  @ApiProperty({ type: [UpdateMentoringScheduleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMentoringScheduleDto)
  data: UpdateMentoringScheduleDto[];
}

export class ScheduleItemResponseDto {
  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ example: '10:00' })
  startTime: string;

  @ApiProperty({ example: '12:00' })
  endTime: string;

  @ApiProperty({ example: 'c846...uuid' })
  id: string;
}

export class GetScheduleListResponseDto {
  @ApiProperty({ example: '멘토가 등록한 정기 스케줄 목록을 반환합니다.' })
  message: string;

  @ApiProperty({ type: [ScheduleItemResponseDto] })
  data: ScheduleItemResponseDto[];
}
