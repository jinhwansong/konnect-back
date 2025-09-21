import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class RefundPaymentDto {
  @ApiProperty({ description: 'Toss에서 받은 고유 결제 키', example: 'pay_abcdefg1234567' })
  @IsString()
  @IsNotEmpty()
  paymentKey: string;
}

export class ConfirmPaymentDto extends RefundPaymentDto {
  @ApiProperty({ description: '주문 ID', example: 'ord_20250708123456' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: '결제 금액', example: 50000 })
  @IsNumber()
  @Min(1)
  price: number;
}
