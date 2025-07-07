import { PaymentStatus } from "@/common/enum/status.enum";
import { ApiProperty } from "@nestjs/swagger";

export class MentorIComeResponseDto {
  @ApiProperty({ example: 'payment-uuid', description: '결제 ID' })
  id: string;

  @ApiProperty({ example: 30000, description: '결제 금액' })
  price: number;

  @ApiProperty({ example: '2025-07-08T12:34:56.000Z', description: '결제 일시' })
  createdAt: Date;

  @ApiProperty({ example: '홍길동', description: '멘티 이름' })
  menteeName: string;

  @ApiProperty({ example: '나를 위한 JavaScript 특강', description: '멘토링 제목' })
  programTitle: string;
}

export class MenteePaymentHistoryDto {
  @ApiProperty({ example: 'payment-uuid', description: '결제 ID' })
  id: string;

  @ApiProperty({ example: 30000, description: '결제 금액' })
  price: number;

  @ApiProperty({ example: 'ord_202407081234', description: '주문 ID' })
  orderId: string;

  @ApiProperty({ example: PaymentStatus.SUCCESS, enum: PaymentStatus, description: '결제 상태' })
  status: PaymentStatus;

  @ApiProperty({ example: 'https://toss.im/receipt/123456', description: '영수증 URL' })
  receiptUrl: string;

  @ApiProperty({ example: '2025-07-08T12:34:56.000Z', description: '결제 일시' })
  createdAt: Date;

  @ApiProperty({ example: '김멘토', description: '멘토 이름' })
  mentorName: string;

  @ApiProperty({ example: '포트폴리오 피드백 세션', description: '멘토링 제목' })
  programTitle: string;
}