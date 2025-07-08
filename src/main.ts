import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import dotenv from 'dotenv';
import path from 'path';
import { AppModule } from './app.module';
import { createUploadFolder } from './common/utill/upload.utils';
import { HttpExceptionFilter } from './httpException.fliter';

declare const module: any;
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  app.enableCors({
    origin: ['http://localhost:3000', 'https://konnect-front-wns6.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie', 'Cookie'],
  });
  // 예외처리
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  // 업로드 폴더 생성
  createUploadFolder('uploads/article');
  createUploadFolder('uploads/chat-files');
  // 이미지 정적 파일
  const uploadsPath = path.join(__dirname, '..', 'uploads');
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });
  // 스웨거 설정
  const config = new DocumentBuilder()
    .setTitle('커넥트 api문서')
    .setDescription('커넥트 개발을 위한 api문서')
    .setVersion('1.0')
    // 스웨어에서 로그인 할때
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer Token',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const port = process.env.PORT;
  await app.listen(port);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
