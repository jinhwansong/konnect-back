import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from './user.entity';
import { SocialLoginProvider } from '@/common/enum/status.enum';

@Entity({ schema: 'konnect', name: 'social_accounts' })
export class SocialAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('enum', {
    enum: SocialLoginProvider,
    nullable: false,
    default: SocialLoginProvider.KAKAO,
  })
  @Unique(['provider', 'socialId'])
  provider: SocialLoginProvider;
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  socialId: string;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: '소셜 계정과 연결된 사용자', required: true })
  @ManyToOne(() => Users, (user) => user.socialAccounts, {
    onDelete: 'CASCADE',
  })
  user: Users;
}
