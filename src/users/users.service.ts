import { SocialLoginProvider, UserRole } from '@/common/enum/status.enum';
import { SocialAccount, Users } from '@/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(SocialAccount)
    private readonly socialRepository: Repository<SocialAccount>,
  ) {}
  // 회원가입
  async createUser(body: Partial<Users>) {
    const user = this.userRepository.create(body);
    this.userRepository.save(user);
    return { message: '회원가입이 완료되었습니다.' };
  }
  // 이메일 중복확인
  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
  // 이메일 중복확인
  async findByNickname(nickname: string) {
    return this.userRepository.findOne({ where: { nickname } });
  }
  // 프로필 조회
  async profile(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    return {
      message: '사용자 정보 입니다.',
      email: user.email,
      name: user.name,
      nickname: user.nickname,
      phone: user.phone,
      image: user.image,
      role: user.role,
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
  ) {
    const newUser = this.userRepository.create({
      email,
      name,
      nickname: name,
      role: UserRole.MENTEE,
      password: null,
      image: null,
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
}
