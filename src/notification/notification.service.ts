import { NotificationType } from '@/common/enum/status.enum';
import { UserFcmToken, Users } from '@/entities';
import { Notification } from '@/entities/notification.entity';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(UserFcmToken)
    private readonly fcmTokenRepository: Repository<UserFcmToken>,
    @Inject('FIREBASE_ADMIN') private readonly firebase: admin.app.App,
  ) {}

  async save(
    manager: EntityManager,
    userId: string,
    type: NotificationType,
    message: string,
    link?: string,
  ) {
    const repo = manager
      ? manager.getRepository(Notification)
      : this.notificationRepository;
    const notification = repo.create({
      user: { id: userId },
      type,
      message,
      link,
    });

    return await repo.save(notification);
  }
  async sendFcm(userId: string, notification: Notification): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['fcmTokens'],
    });

    if (!user?.fcmTokens?.length) {
      this.logger.warn(`User ${userId} has no FCM tokens`);
      return;
    }

    for (const fcm of user.fcmTokens) {
      try {
        await this.firebase.messaging().send({
          token: fcm.token,
          notification: {
            title: 'Konnect 알림',
            body: notification.message,
          },
          data: {
            type: notification.type,
            link: notification.link || '',
            notificationId: notification.id,
          },
        });
        this.logger.log(`✅ FCM sent to ${userId} (tokenId=${fcm.id})`);
      } catch (err) {
        this.logger.error(
          `❌ Failed to send FCM to ${userId} (tokenId=${fcm.id}): ${err.message}`,
        );
        if (
          err.code === 'messaging/invalid-argument' ||
          err.code === 'messaging/registration-token-not-registered'
        ) {
          await this.userRepository.manager.delete(UserFcmToken, fcm.id);
        }
      }
    }
  }
  async findByUser(userId: string) {
    try {
      this.logger.log(`Fetching notifications for user ${userId}`);

      const notifications = await this.notificationRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
      });

      this.logger.log(
        `Found ${notifications.length} notifications for user ${userId}`,
      );
      return notifications;
    } catch (error) {
      this.logger.error(
        `Failed to fetch notifications for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        '알림 조회 중 오류가 발생했습니다.',
      );
    }
  }

  async markAsRead(id: string, userId: string) {
    try {
      this.logger.log(`Marking notification ${id} as read for user ${userId}`);

      const result = await this.notificationRepository.update(
        { id, user: { id: userId } },
        { isRead: true },
      );

      if (result.affected === 0) {
        this.logger.warn(`Notification ${id} not found for user ${userId}`);
        throw new NotFoundException('알림을 찾을 수 없습니다.');
      }

      await this.notificationRepository.findOneBy({ id });

      this.logger.log(`Notification ${id} marked as read by user ${userId}`);
      return { message: '해당 알림을 읽었습니다.' };
    } catch (error) {
      this.logger.error(
        `Failed to mark notification ${id} as read for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException(
            '알림 읽음 처리 중 오류가 발생했습니다.',
          );
    }
  }

  async delete(id: string, userId: string) {
    try {
      this.logger.log(`Deleting notification ${id} for user ${userId}`);

      const result = await this.notificationRepository.delete({
        id,
        user: { id: userId },
      });

      if (result.affected === 0) {
        this.logger.warn(`Notification ${id} not found for user ${userId}`);
        throw new NotFoundException('알림을 찾을 수 없습니다.');
      }

      this.logger.log(`Notification ${id} deleted by user ${userId}`);
      return { message: '해당 알림을 삭제했습니다.' };
    } catch (error) {
      this.logger.error(
        `Failed to delete notification ${id} for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('알림 삭제 중 오류가 발생했습니다.');
    }
  }

  async markAllAsRead(userId: string) {
    try {
      this.logger.log(`Marking all notifications as read for user ${userId}`);

      const result = await this.notificationRepository.update(
        { userId, isRead: false },
        { isRead: true },
      );

      this.logger.log(
        `Marked ${result.affected} notifications as read for user ${userId}`,
      );
      return { message: '모든 알림을 읽었습니다.' };
    } catch (error) {
      this.logger.error(
        `Failed to mark all notifications as read for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        '모든 알림 읽음 처리 중 오류가 발생했습니다.',
      );
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      this.logger.log(`Getting unread notification count for user ${userId}`);

      const count = await this.notificationRepository.count({
        where: { user: { id: userId }, isRead: false },
      });

      this.logger.log(`User ${userId} has ${count} unread notifications`);
      return count;
    } catch (error) {
      this.logger.error(
        `Failed to get unread count for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        '읽지 않은 알림 개수 조회 중 오류가 발생했습니다.',
      );
    }
  }

  async updateFcmToken(userId: string, token: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }
    
    // 같은 사용자가 이미 같은 토큰을 등록했으면 중복 방지
    const existingForUser = await this.fcmTokenRepository.findOne({
      where: { token, user: { id: userId } },
    });
    if (existingForUser) {
      this.logger.log(`FCM token already registered for user ${userId}`);
      return { message: '이미 등록된 토큰입니다.' };
    }

    // 중요: 같은 토큰이 다른 사용자와 연결되어 있으면 먼저 삭제
    // (브라우저당 하나의 토큰만 존재하므로, 이전 사용자의 매핑을 제거해야 함)
    const existingForOtherUser = await this.fcmTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });
    
    if (existingForOtherUser && existingForOtherUser.user.id !== userId) {
      this.logger.log(
        `FCM token ${token} was registered for user ${existingForOtherUser.user.id}, removing and re-registering for user ${userId}`,
      );
      await this.fcmTokenRepository.delete({ token });
    }

    const entity = this.fcmTokenRepository.create({ token, user });
    await this.fcmTokenRepository.save(entity);
    this.logger.log(`FCM token registered for user ${userId}`);
    return { message: 'FCM 토큰이 등록되었습니다.' };
  }
  // 브라우저에서 넘어오는 값은 DB의 id가 아닌 "실제 FCM 토큰 문자열"이므로
  // 해당 토큰 문자열과 userId 기준으로 삭제하도록 수정
  async removeToken(userId: string, token: string) {
    try {
      this.logger.log(`Removing FCM token (token=${token}) for user ${userId}`);

      const result = await this.fcmTokenRepository.delete({
        token,
        user: { id: userId },
      });

      if (result.affected === 0) {
        this.logger.warn(
          `FCM token not found for user ${userId} (token=${token})`,
        );
        throw new NotFoundException('FCM 토큰을 찾을 수 없습니다.');
      }

      this.logger.log(`FCM token ${token} deleted for user ${userId}`);
      return { message: 'FCM 토큰이 삭제되었습니다.' };
    } catch (error) {
      this.logger.error(
        `Failed to delete FCM token ${token} for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'FCM 토큰 삭제 중 오류가 발생했습니다.',
      );
    }
  }

  async deleteAll(userId: string) {
    try {
      this.logger.log(`Deleting all notifications for user ${userId}`);

      const result = await this.notificationRepository.delete({
        userId,
      });

      this.logger.log(
        `Deleted ${result.affected} notifications for user ${userId}`,
      );
      return { message: '모든 알림을 삭제했습니다.' };
    } catch (error) {
      this.logger.error(
        `Failed to delete all notifications for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        '모든 알림 삭제 중 오류가 발생했습니다.',
      );
    }
  }
}
