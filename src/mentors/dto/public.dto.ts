import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateMentorPublicDto {
  @ApiProperty({
    description: '세션 공개 여부',
    example: true,
  })
  @IsBoolean()
  isPublic: boolean;
}