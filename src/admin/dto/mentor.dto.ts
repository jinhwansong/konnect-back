import { MentorStatus } from "@/common/enum/status.enum";
import { ApiProperty } from "@nestjs/swagger";

export class MentorListDto {
  @ApiProperty({
    example: 'b1a8f3e1-3b0f-4e9b-98a2-c4f0e6d3a3b4',
    description: '사용자 UUID',
    required: true,
  })
  id: string;

  @ApiProperty({
    example: 'React, Next.js',
    description: '전문 분야',
    required: true,
  })
  expertise: string;

  @ApiProperty({
    example: 'user@example.com',
    description: '이메일 (로그인용)',
    required: true,
  })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: '사용자 이름',
    required: true,
  })
  name: string;
  @ApiProperty({
    example: MentorStatus.PENDING,
    description: '승인 여부',
    enum: MentorStatus,
    required: true,
  })
  status: MentorStatus;
  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '멘토 등록일',
    required: false,
  })
  createdAt: Date;
}
export class MentorDetailDto extends MentorListDto {
  @ApiProperty({
    example: 'Google',
    description: '소속 회사명',
    required: false,
  })
  company: string;
  @ApiProperty({
    example: '10년차 프론트엔드 개발자입니다.',
    description: '멘토 자기소개',
    required: true,
  })
  introduce: string;
  @ApiProperty({
    example: '프론트엔드',
    description: '직책',
    required: false,
  })
  position: string;
  @ApiProperty({
    example: '주니어(1~3년)',
    description: '연차',
    required: true,
  })
  career: string;
  @ApiProperty({
    example: 'https://portfolio.example.com',
    description: '포트폴리오 페이지 url',
    required: true,
  })
  portfolio: string;
  @ApiProperty({ example: 'https://example.com/profile.jpg', description: '프로필 이미지 URL', required: false })
  image: string;
  @ApiProperty({
    example: '01012345678',
    description: '휴대폰번호 (형식: 01012345678)',
    required: false,
  })
  phone: string;
}