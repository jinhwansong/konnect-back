import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/users/users.service';
import { JoinDto, LoginDto } from './dto/auth.dto';
import { RedisService } from '@/redis/redis.service';
import { SocialLoginProvider, UserRole } from '@/common/enum/status.enum';
import { sendEmailDto, verifyCodeDto } from './dto/email.dto';
import { MailService } from '@/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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
  async login(body: LoginDto, res) {
    const { email, password } = body;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }
    const { accessToken, refreshToken } = this.createToken(
      user.id,
      user.email,
      user.role,
    );
    await this.saveRefreshToken(user.id, refreshToken);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: '로그인 되었습니다.',
      accessToken,
      email,
      name: user.name,
      nickname: user.nickname,
      image: user.image,
      phone: user.phone,
      role: user.role,
    });
  }
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh Token이 없습니다.');
    }
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_SECRET,
      });
      const savedToken = await this.redisService.getRefreshToken(payload.id);
      if (savedToken !== refreshToken) {
        throw new UnauthorizedException('Refresh Token이 유효하지 않습니다.');
      }
      // 새로운 토큰 생성
      const accessToken = this.jwtService.sign(
        { id: payload.id, email: payload.email, role: payload.role },
        { secret: process.env.COOKIE_SECRET, expiresIn: '15m' },
      );
      return { message: '새로운 access Token이 발급되었습니다.', accessToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh Token이 유효하지 않습니다.');
    }
  }
  async logout(req, res) {
    const user = req.user;
    if (!user || !user.id) {
      return res
        .status(400)
        .json({ message: '사용자 정보가 존재하지 않습니다.' });
    }
    await this.redisService.deleteRefreshToken(user.id);
    res.clearCookie('refreshToken');
    return res.status(200).json({ message: '로그아웃 되었습니다.' });
  }
  async socialLogin(
    provider: SocialLoginProvider,
    socialId: string,
    email: string,
    name: string,
  ) {
    let user = await this.usersService.findUserBySocialId(provider, socialId);
    if (!user) {
      user = await this.usersService.createSocialUser(
        email,
        name,
        provider,
        socialId,
      );
    }
    const { accessToken, refreshToken } = this.createToken(
      user.id,
      user.email,
      user.role,
    );
    await this.saveRefreshToken(user.id, refreshToken);
    return {
      accessToken,
      refreshToken,
      user,
    };
  }
  createToken(userId: string, email: string, role: UserRole) {
    // Access Token
    const accessToken = this.jwtService.sign(
      { id: userId, email, role },
      { secret: process.env.COOKIE_SECRET, expiresIn: '15m' },
    );
    // refreshToken
    const refreshToken = this.jwtService.sign(
      { id: userId, email, role },
      { secret: process.env.REFRESH_SECRET, expiresIn: '1d' },
    );
    return { accessToken, refreshToken };
  }
  async saveRefreshToken(userId: string, refreshToken: string) {
    return await this.redisService.saveRefreshToken(userId, refreshToken);
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
