import { ApiProperty } from '@nestjs/swagger';

export class DashboardMetricDto {
  @ApiProperty({ example: 'new-users', description: '메트릭 ID' })
  id: string;

  @ApiProperty({ example: '오늘 가입자', description: '메트릭 라벨' })
  label: string;

  @ApiProperty({ example: 42, description: '값' })
  value: number;

  @ApiProperty({ example: 8, description: '변화량', required: false })
  delta?: number;

  @ApiProperty({ example: 'up', description: '트렌드', enum: ['up', 'down', 'neutral'], required: false })
  trend?: 'up' | 'down' | 'neutral';

  @ApiProperty({ example: '어제 대비', description: '부가 설명', required: false })
  subText?: string;
}

export class MiniTrendPointDto {
  @ApiProperty({ example: '11/12', description: '날짜' })
  date: string;

  @ApiProperty({ example: 42, description: '가입자 수' })
  signup: number;

  @ApiProperty({ example: 34, description: '결제 건수' })
  payment: number;
}

export class DashboardRecentPaymentDto {
  @ApiProperty({ example: 'pay-1', description: '결제 ID' })
  id: string;

  @ApiProperty({ example: '홍길동', description: '사용자 이름' })
  userName: string;

  @ApiProperty({ example: 50000, description: '금액' })
  amount: number;

  @ApiProperty({ example: '성공', description: '상태', enum: ['성공', '환불'] })
  status: '성공' | '환불';

  @ApiProperty({ example: '2025-11-12 09:30', description: '결제 일시' })
  paidAt: string;
}

export class DashboardRecentApplicationDto {
  @ApiProperty({ example: 'app-1', description: '신청 ID' })
  id: string;

  @ApiProperty({ example: '지원자 1', description: '지원자 이름' })
  applicantName: string;

  @ApiProperty({ example: 5, description: '경력 연수' })
  careerYears: number;

  @ApiProperty({ example: '2025-11-12 09:15', description: '제출 일시' })
  submittedAt: string;

  @ApiProperty({ example: 'pending', description: '상태', enum: ['pending', 'approved', 'rejected'] })
  status: 'pending' | 'approved' | 'rejected';
}

export class DashboardDataDto {
  @ApiProperty({ type: [DashboardMetricDto], description: '메트릭 목록' })
  metrics: DashboardMetricDto[];

  @ApiProperty({ type: [DashboardRecentPaymentDto], description: '최근 결제 목록' })
  recentPayments: DashboardRecentPaymentDto[];

  @ApiProperty({ type: [DashboardRecentApplicationDto], description: '최근 멘토 신청 목록' })
  recentApplications: DashboardRecentApplicationDto[];

  @ApiProperty({ type: [MiniTrendPointDto], description: '트렌드 데이터' })
  trends: MiniTrendPointDto[];
}

