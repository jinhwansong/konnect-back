import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        id: string;
        email: string;
        name: string;
        nickname: string;
        phone: string;
        role: string;
        image?: string | null;
      };
    }
  }
}
