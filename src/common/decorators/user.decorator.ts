import { createParamDecorator, ExecutionContext } from '@nestjs/common';

//저장된 사용자 정보에 접근 가능
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
