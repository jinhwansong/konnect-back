import { MentorStatus } from "@/common/enum/status.enum";
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class ApproveOrRejectMentorDto {
  @ApiProperty({ 
    enum: MentorStatus, 
    description: '멘토 승인 상태',
    example: MentorStatus.APPROVED 
  })
  @IsEnum(MentorStatus)
  status: MentorStatus;

  @ApiProperty({ 
    description: '거절 사유 (거절 시 필수)', 
    example: '포트폴리오 기준 미달',
    required: false 
  })
  @ValidateIf(o => o.status === MentorStatus.REJECTED)
  @IsString()
  @IsNotEmpty()
  reason?: string;
}