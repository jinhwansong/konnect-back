import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');

    if (!token) throw new UnauthorizedException('JWT 토큰이 없습니다.');

    try {
      const publicKey = process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, '\n');
      const decoded = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
      }) as jwt.JwtPayload & {
        sub: string;
        email: string;
        name: string;
        nickname: string;
        phone: string;
        role: string;
        image?: string;
      };
      req.user = {
        ...decoded,
        id: decoded.sub,
      };
      return true;
    } catch (e) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }
}
