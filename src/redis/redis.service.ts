import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  // 레디스를 전역으로 관리 및 각각의 서비스에서 관리 하기 위해 사용된다.
  async onModuleInit() {
    // 비밀번호 유무에 따라 URL 구성
    this.client = createClient({
      url: `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis 연결 오류:', err);
    });

    await this.client.connect();
    console.log('✅ Redis 연결 성공');
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  // 인증코드 저장
  async saveEmailCode(email: string, code: string) {
    await this.client.set(`verify:${email}`, code, { EX: 60 * 3 });
  }

  // 인증코드 검증
  async getEmailCode(email: string): Promise<string | null> {
    const res = await this.client.get(`verify:${email}`);
    return res as string | null;
  }

  // 인증코드 삭제 (성공 시)
  async deleteEmailCode(email: string) {
    return await this.client.del(`verify:${email}`);
  }

  // 채팅 저장 1시간
  async saveChatMessage(roomId: string, message: string) {
    const redisKey = `chat:${roomId}`;
    await this.client.lPush(redisKey, message); // redis 리스트
    await this.client.lTrim(redisKey, 0, 99); // 100 개 유지
    this.client.expire(redisKey, 60 * 60); // 1시간 설정
  }
  // 채팅 조회 최근 100개
  async getChatMessage(roomId: string) {
    const redisKey = `chat:${roomId}`;
    const messages = await this.client.lRange(redisKey, 0, 99);
    return messages;
  }
  // 채팅 삭제
  async deleteChatMessage(roomId: string) {
    return await this.client.del(`chat:${roomId}`);
  }

  // 조회수용 유저 정보 저장 24시간 후 자동 삭제...
  async saveCount(key: string, value: string) {
    await this.client.set(key, value, { EX: 60 * 60 * 24 });
  }
  // 키가 있누?
  async existsCount(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }
}
