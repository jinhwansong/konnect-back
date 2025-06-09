import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  private client: RedisClientType;
  // 레디스를 전역으로 관리 및 각각의 서비스에서 관리 하기 위해 사용된다.
  constructor() {
    this.client = createClient({
      url: `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });
    this.client.on('error', (err) => {
      console.error(`❌ Redis 연결 오류: ${err}`);
    });
    this.client.connect();
  }

  // RefreshToken 1일 저장
  async saveRefreshToken(userId: string, refreshToken: string) {
    await this.client.set(`refresh:${userId}`, refreshToken, {
      EX: 60 * 60 * 24,
    });
  }

  // RefreshToken 조회
  async getRefreshToken(userId: string) {
    return await this.client.get(`refresh:${userId}`);
  }

  // RefreshToken 삭제
  async deleteRefreshToken(userId: string) {
    return await this.client.del(`refresh:${userId}`);
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
}
