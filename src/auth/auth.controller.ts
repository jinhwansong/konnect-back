import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JoinDto, LoginDto, UserDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authServie: AuthService) {}
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
    return this.authServie.join(body);
  }
  @ApiOperation({ summary: '사용자 로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: UserDto,
  })
  @ApiResponse({
    status: 401,
    description: '이메일 또는 비밀번호가 잘못되었습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Post('')
  async login(@Body() body: LoginDto, @Res() res: Response) {
    return this.authServie.login(body, res);
  }
  @ApiOperation({ summary: 'access token 재발급' })
  @ApiResponse({
    status: 200,
    description: 'Access Token이 성공적으로 재발급되었습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '유효하지 않은 Refresh Token입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @Post('refresh')
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['refreshToken'];
    return this.authServie.refresh(refreshToken);
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
    return this.authServie.logout(req, res);
  }
  @ApiResponse({
    status: 200,
    description: '카카오 로그인을 성공했습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버에러',
  })
  @ApiOperation({ summary: '카카오로그인' })
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  kakaoLogin() {
    return;
  }
  @UseGuards(AuthGuard('kakao'))
  @Get('kakao/callback')
  async kakaoCallback( @Res() res: Response) {
    return res.redirect(`${process.env.CLIENT}`);
  }
}
