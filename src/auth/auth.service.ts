import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/users/users.service';
import { JoinDto, LoginDto, SocialLoginDto } from './dto/auth.dto';
import { RedisService } from '@/redis/redis.service';
import { sendEmailDto, verifyCodeDto } from './dto/email.dto';
import { MailService } from '@/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}
  async join(body: JoinDto) {
    const { email, name, nickname, phone, password } = body;
    // 이메일 중복체크
    const exUser = await this.usersService.findByEmail(email);
    if (exUser) {
      throw new ConflictException('이미 사용중인 이메일 입니다.');
    }
    const exNickname = await this.usersService.findByNickname(nickname);
    if (exNickname) {
      throw new ConflictException('이미 사용중인 닉네임입니다.');
    }
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.usersService.createUser({
      email,
      name,
      phone,
      password: hashedPassword,
      nickname,
    });
  }

  async login(body: LoginDto) {
    try {
      const { email, password } = body;
      const user = await this.usersService.findByEmail(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException(
          '이메일 또는 비밀번호가 일치하지 않습니다.',
        );
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        image: user.image,
        phone: user.phone,
        role: user.role,
      };
    } catch (error) {
      throw error instanceof UnauthorizedException
        ? error
        : new UnauthorizedException('로그인 중 오류가 발생했습니다.');
    }
  }

  async logout(req, res) {
    const user = req.user;
    if (!user || !user.id) {
      return res
        .status(400)
        .json({ message: '사용자 정보가 존재하지 않습니다.' });
    }
    return res.status(200).json({ message: '로그아웃 되었습니다.' });
  }

  async socialLogin(body: SocialLoginDto) {
    try {
      const { provider, socialId, email, name, image } = body;
      let user = await this.usersService.findUserBySocialId(provider, socialId);
      if (!user) {
        user = await this.usersService.createSocialUser(
          email,
          name,
          provider,
          socialId,
          image,
        );
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        '소셜 로그인 처리 중 오류가 발생했습니다.',
      );
    }
  }

  async duplicateEmail(email: string) {
    const exUser = await this.usersService.findByEmail(email);
    if (exUser) {
      throw new ConflictException('이미 사용중인 이메일 입니다.');
    }
    return { message: '사용가능한 이메일입니다.' };
  }
  async duplicateNickname(nickname: string) {
    const exUser = await this.usersService.findByNickname(nickname);
    if (exUser) {
      throw new ConflictException('이미 사용중인 닉네임 입니다.');
    }
    return { message: '사용가능한 닉네임입니다.' };
  }
  async sendEmailVerification(body: sendEmailDto) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.mailService.sendCode(body.email, code);
    await this.redisService.saveEmailCode(body.email, code);
    return { message: '인증 코드가 전송되었습니다.' };
  }
  async verifyCode(body: verifyCodeDto) {
    const storedCode = await this.redisService.getEmailCode(body.email);
    if (!storedCode) throw new BadRequestException('인증코드 만료');
    if (storedCode !== body.code)
      throw new BadRequestException('인증코드 불일치');
    await this.redisService.deleteEmailCode(body.email);
    return { message: '이메일 인증 완료' };
  }
}
