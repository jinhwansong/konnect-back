import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import {
  MentoringReservation,
  Mentors,
  Payment,
  SocialAccount,
  Users,
} from '@/entities';
import {
  MentoringStatus,
  PaymentStatus,
  SocialLoginProvider,
  UserRole,
} from '@/common/enum/status.enum';
import {
  UpdateNicknameDto,
  UpdatePasswordDto,
  UpdatePhoneDto,
} from './dto/update.user.dto';
import { PaymentService } from '@/payment/payment.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(SocialAccount)
    private readonly socialRepository: Repository<SocialAccount>,
    private readonly paymentService: PaymentService,
    private readonly dataSource: DataSource,
  ) {}

  // 회원가입
  async createUser(body: Partial<Users>) {
    const user = this.userRepository.create(body);
    this.userRepository.save(user);
    return { message: '회원가입이 완료되었습니다.' };
  }

  // 이메일 중복확인
  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
      relations: ['socialAccounts'],
    });
  }

  // 닉네임 중복확인
  async findByNickname(nickname: string) {
    return this.userRepository.findOne({ where: { nickname } });
  }

  // 프로필 조회
  async profile(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['socialAccounts'],
    });
    return {
      message: '사용자 정보 입니다.',
      email: user.email,
      name: user.name,
      nickname: user.nickname,
      phone: user.phone,
      image: user.image ? `${process.env.SERVER_HOST}${user.image}` : null,
      role: user.role,
      socials:
        user.socialAccounts?.map((s) => ({ provider: s.provider })) ?? [],
    };
  }

  // sns사용자 조회
  async findUserBySocialId(provider: SocialLoginProvider, socialId: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.socialAccounts', 'socialAccount')
      .where('socialAccount.provider = :provider', { provider })
      .andWhere('socialAccount.socialId = :socialId', { socialId })
      .getOne();
  }

  // sns 사용자 생성
  async createSocialUser(
    email: string,
    name: string,
    provider: SocialLoginProvider,
    socialId: string,
    image?: string,
  ) {
    const nickname = `user${uuidv4().slice(0, 8)}`;
    const newUser = this.userRepository.create({
      email,
      name,
      nickname,
      role: UserRole.MENTEE,
      password: null,
      image: image ?? null,
    });
    const savedUser = await this.userRepository.save(newUser);

    // 소셜 계정 생성
    const social = this.socialRepository.create({
      provider,
      socialId,
      user: savedUser,
    });
    await this.socialRepository.save(social);

    return savedUser;
  }

  // 닉네임 변경
  async updateNickname(id: string, body: UpdateNicknameDto) {
    try {
      const user = await this.userRepository.findOneBy({
        id,
      });
      if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
      user.nickname = body.nickname;
      await this.userRepository.save(user);

      return { nickname: user.nickname };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        '닉네임 변경 중 오류가 발생했습니다.',
      );
    }
  }

  // 휴대폰 번호 변경
  async updatePhone(id: string, body: UpdatePhoneDto) {
    try {
      const user = await this.userRepository.findOneBy({
        id,
      });
      if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
      user.phone = body.phone;
      await this.userRepository.save(user);

      return { phone: user.phone };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        '휴대폰 번호 변경 중 오류가 발생했습니다.',
      );
    }
  }

  // 프로필 이미지 변경
  async updateProfileImage(id: string, file: Express.Multer.File) {
    try {
      if (!file) throw new BadRequestException('파일이 업로드되지 않았습니다.');

      const imageUrl = `uploads/profile/${file.filename}`;
      const user = await this.userRepository.findOneBy({
        id,
      });
      if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
      user.image = imageUrl;
      await this.userRepository.save(user);

      return { image: `${process.env.SERVER_HOST}/${user.image} ` };
    } catch (error) {
      throw new InternalServerErrorException(
        `프로필 이미지 변경 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  // 패스워드 변경
  async updatePassword(id: string, body: UpdatePasswordDto) {
    try {
      const user = await this.userRepository.findOneBy({
        id,
      });
      if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
      const isValid = await bcrypt.compare(body.currentPassword, user.password);
      if (!isValid) {
        throw new BadRequestException('현재 비밀번호가 일치하지 않습니다.');
      }
      user.password = await bcrypt.hash(body.newPassword, 10);
      await this.userRepository.save(user);

      return { message: '비밀번호가 변경되었습니다.' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        '비밀번호 변경 중 오류가 발생했습니다.',
      );
    }
  }

  // 회원탈퇴
  async deleteAccount(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 트랜잭션 안에서 모아둘 환불 대상
    const refundTargets: Payment[] = [];
    try {
      const user = await queryRunner.manager.findOne(Users, {
        where: { id },
        relations: ['mentorProfile'],
      });
      if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

      // 멘티 예약취소
      const reservations = await queryRunner.manager.find(
        MentoringReservation,
        {
          where: { mentee: { id }, status: MentoringStatus.CONFIRMED },
          relations: ['session', 'payments', 'session.mentor'],
        },
      );
      for (const reservation of reservations) {
        reservation.status = MentoringStatus.CANCELLED;
        reservation.rejectReason = '회원 탈퇴';
        await queryRunner.manager.save(reservation);
        if (reservation.payments) {
          reservation.payments.status = PaymentStatus.REFUNDED;
          await queryRunner.manager.save(reservation.payments);
          refundTargets.push(reservation.payments);
        }
      }

      // 멘토 예약취소
      if (user.mentorProfile) {
        const mentorReservations = await queryRunner.manager.find(
          MentoringReservation,
          {
            where: {
              session: { mentor: { id } },
              status: MentoringStatus.CONFIRMED,
            },
            relations: ['session', 'mentee', 'payments'],
          },
        );
        for (const reservation of mentorReservations) {
          reservation.status = MentoringStatus.CANCELLED;
          reservation.rejectReason = '멘토 탈퇴';
          await queryRunner.manager.save(reservation);
          if (reservation.payments) {
            reservation.payments.status = PaymentStatus.REFUNDED;
            await queryRunner.manager.save(reservation.payments);
            refundTargets.push(reservation.payments);
          }
        }
      }
      await queryRunner.manager.delete(SocialAccount, { user: { id } });

      // 유저 삭제...
      user.deletedAt = new Date();
      user.email = `deleted_${user.id}`;
      user.phone = null;
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      // 트랜잭션 이후 외부 처리
      for (const payment of refundTargets) {
        // 환불
        await this.paymentService.cancelAndRefund(
          queryRunner.manager,
          payment,
          '회원 탈퇴',
        );
      }
      return { message: '계정이 탈퇴 처리되었습니다.' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('error:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        '계정 삭제 중 오류가 발생했습니다.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
