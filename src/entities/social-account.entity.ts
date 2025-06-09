import { SocialLoginProvider } from "@/common/enum/status.enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Users } from "./user.entity";

@Entity({ schema: 'konnect', name: 'social_accounts' })
export class SocialAccount {
  @ApiProperty({
    example: 'b1a8f3e1-3b0f-4e9b-98a2-c4f0e6d3a3b4',
    description: '소셜 계정 UUID',
    required: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @IsEnum(SocialLoginProvider)
  @ApiProperty({
    example: SocialLoginProvider.KAKAO,
    description: 'SNS 제공자 (KAKAO, NAVER, GOOGLE)',
    enum: SocialLoginProvider,
    required: true,
  })
  @Column('enum', {
    enum: SocialLoginProvider,
    nullable: true,
    default: SocialLoginProvider.KAKAO,
  })
  provider: SocialLoginProvider;
  @ApiProperty({
    example: '1234567890',
    description: '소셜 서비스에서 제공한 ID',
    required: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  socialId: string;

  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '소셜 계정 등록일',
    required: false,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-09T12:34:56Z',
    description: '소셜 계정 수정일',
    required: false,
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: '소셜 계정과 연결된 사용자', required: true })
  @ManyToOne(() => Users, (user) => user.socialAccounts, {
    onDelete: 'CASCADE',
  })
  user: Users;
}