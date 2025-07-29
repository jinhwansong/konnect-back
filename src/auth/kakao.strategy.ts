import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { AuthService } from './auth.service';
import { SocialLoginProvider } from '@/common/enum/status.enum';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: `${process.env.CLIENT}/auth/kakao/callback`,
    });
  }
  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { id, username, _json } = profile;
    console.log(_json);
    const kakao = await this.authService.socialLogin(
      SocialLoginProvider.KAKAO,
      id,
      _json.kakao_account?.email,
      username || _json.properties?.nickname,
    );
    return kakao;
  }
}
