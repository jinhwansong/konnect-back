import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './user.entity';

@Entity('user_fcm_tokens')
export class UserFcmToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  token: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Users, (user) => user.fcmTokens, { onDelete: 'CASCADE' })
  user: Users;
}
