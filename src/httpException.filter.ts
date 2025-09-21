import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = exception.getResponse();
    const message =
      typeof errorResponse === 'string'
        ? errorResponse
        : ((errorResponse as any)?.message ??
          '알 수 없는 오류가 발생했습니다.');

    // 로깅 추가 (운영 환경에서 Sentry로 연동하기 좋음)
    this.logger.error(
      `❌ HTTP Exception: ${status} - ${JSON.stringify(message)}`,
    );

    // class-validator 에러 (배열 형태)
    if (Array.isArray(message)) {
      return response.status(status).json({
        success: false,
        code: status,
        data: message,
      });
    }

    // 일반 에러
    return response.status(status).json({
      success: false,
      code: status,
      data: message,
    });
  }
}
