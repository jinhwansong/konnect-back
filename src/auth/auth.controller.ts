import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JoinDto, LoginDto, SocialLoginDto, UserDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guard/jwt.guard';
import { duplicateEmailDto, duplicateNicknameDto } from './dto/duplicate.dto';
import { sendEmailDto, verifyCodeDto } from './dto/email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({
    status: 201,
    description: '회원가입이 완료되었습니다.',
    type: UserDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (이메일 중복 등)',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Post('join')
  async join(@Body() body: JoinDto) {
    return this.authService.join(body);
  }
  @ApiOperation({ summary: '사용자 로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: UserDto,
  })
  @ApiResponse({
    status: 401,
    description: '이메일 또는 비밀번호가 일치하지 않습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Post('')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
  @ApiOperation({ summary: '소셜 로그인 등록' })
  @ApiResponse({
    status: 200,
    description: '소셜 사용자 등록 또는 조회 성공',
    type: UserDto,
  })
  @Post('social')
  async socialRegister(@Body() body: SocialLoginDto) {
    return this.authService.socialLogin(body);
  }

  @ApiOperation({ summary: '이메일 중복 검사' })
  @ApiResponse({
    status: 200,
    description: '사용 가능한 이메일입니다.',
    type: duplicateEmailDto,
  })
  @ApiResponse({ status: 409, description: '이미 사용 중인 이메일입니다.' })
  @Post('duplicateEmail')
  async duplicateEmail(@Body() body: duplicateEmailDto) {
    return this.authService.duplicateEmail(body.email);
  }
  @ApiOperation({ summary: '닉네임 중복 검사' })
  @ApiResponse({
    status: 200,
    description: '사용 가능한 닉네임입니다.',
    type: duplicateNicknameDto,
  })
  @ApiResponse({ status: 409, description: '이미 사용 중인 닉네임입니다.' })
  @Post('duplicateNickname')
  async duplicateNickname(@Body() body: duplicateNicknameDto) {
    return this.authService.duplicateNickname(body.nickname);
  }
  @ApiOperation({ summary: '이메일 인증보내기' })
  @ApiResponse({
    status: 200,
    description: '인증 코드가 이메일로 전송되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '이미 인증 코드가 발송되어 있음 or 이메일 오류',
  })
  @Post('email/verify/send')
  sendCode(@Body() body: sendEmailDto) {
    return this.authService.sendEmailVerification(body);
  }
  @ApiOperation({ summary: '이메일 인증확인' })
  @ApiResponse({
    status: 200,
    description: '이메일 인증 완료',
  })
  @ApiResponse({
    status: 400,
    description: '인증 코드가 없거나, 일치하지 않거나, 만료됨',
  })
  @Post('email/verify/confirm')
  confirmCode(@Body() body: verifyCodeDto) {
    return this.authService.verifyCode(body);
  }
  @ApiOperation({ summary: '사용자 로그아웃' })
  @ApiResponse({
    status: 200,
    description: '로그아웃 되었습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    return this.authService.logout(req, res);
  }
}
