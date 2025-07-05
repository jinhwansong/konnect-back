import { MentorStatus } from "@/common/enum/status.enum";
import { IsEnum, IsString, ValidateIf } from "class-validator";

export class ApproveOrRejectMentorDto {
  @IsEnum(MentorStatus)
  status: MentorStatus;

  @ValidateIf(o => o.status === MentorStatus.REJECTED)
  @IsString()
  reason?: string;
}