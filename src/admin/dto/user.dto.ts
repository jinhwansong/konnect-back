import { UserRole } from "@/common/enum/status.enum";
import { ApiProperty } from "@nestjs/swagger";

export class UserListDto {
  @ApiProperty({ example: 'b1a8f3e1-3b0f-4e9b-98a2-c4f0e6d3a3b4', description: '사용자 UUID' })
  id: string;
  @ApiProperty({ example: 'user@example.com', description: '이메일' })
  email: string;

  @ApiProperty({ example: 'john_doe', description: '닉네임' })
  nickname: string;

  @ApiProperty({ example: '홍길동', description: '이름' })
  name: string;

  
  @ApiProperty({
    example: UserRole.MENTEE,
    description: '사용자 등급 (MENTOR, MENTEE, ADMIN)',
    enum: UserRole,
  })
  role: UserRole;

  

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: '가입일' })
  createdAt: Date;
}

export class UserDetailDto extends UserListDto {
  @ApiProperty({ example: 'https://example.com/profile.jpg', description: '프로필 이미지 URL', required: false })
  image: string;
  @ApiProperty({
    example: '01012345678',
    description: '휴대폰번호 (형식: 01012345678)',
    required: false,
  })
  phone: string;
}