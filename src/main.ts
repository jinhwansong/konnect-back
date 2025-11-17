import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import dotenv from 'dotenv';
import path, { join } from 'path';
import { AppModule } from './app.module';
import { createUploadFolder } from './common/util/upload.folder';
import { HttpExceptionFilter } from './httpException.filter';
import cookieParser from 'cookie-parser';
import { writeFileSync } from 'fs';
import { SocketIoAdapter } from './realtime/socket-io.adapter';

declare const module: any;
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Socket.IO Adapter 설정 (CORS 및 네임스페이스 포함)
  app.useWebSocketAdapter(new SocketIoAdapter(app));

  app.set('trust proxy', 1);

  // HTTP CORS 설정
  app.enableCors({
    origin: [
      'https://konnect-front-phi.vercel.app',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie', 'Cookie'],
  });
  // 예외처리
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 값은 거름
      forbidNonWhitelisted: true, // 잘못된 값 들어오면 에러
      transform: true, // string -> number 변환 자동
      transformOptions: {
        enableImplicitConversion: true, // DTO에서 타입만 지정해도 변환
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser());

  createUploadFolder('uploads');
  // 이미지 정적 파일
  const uploadsPath = path.join(__dirname, '..', 'uploads');
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });

  // 스웨거 설정
  const config = new DocumentBuilder()
    .setTitle('커넥트 API 문서')
    .setDescription(
      `
📘 **Konnect 프로젝트 API 문서**

이 문서는 REST API 및 실시간(WebSocket) 이벤트 명세를 포함합니다.

---

### 💬 WebSocket (채팅/화상채팅) 연결 정보

**Namespace:** \`/chat\`

**Connection URL:** \`wss://api.konnect.store/chat\` (로컬: \`ws://localhost:3030/chat\`)

**이벤트 목록**

| 이벤트명 | 설명 | 예시 Payload |
|-----------|------|---------------|
| \`join_room\` | 채팅방 입장 | { "roomId": "r1", "userId": "u1", "token": "..." } |
| \`leave_room\` | 채팅방 나가기 | { "roomId": "r1", "userId": "u1" } |
| \`new_message\` | 새 메시지 전송 | { "roomId": "r1", "message": "안녕하세요" } |
| \`user_joined\` | 다른 유저 입장 알림 | { "userId": "u2" } |
| \`user_left\` | 다른 유저 퇴장 알림 | { "userId": "u2" } |
| \`webrtc_signal\` | 화상채팅 시그널 전송 | { "type": "offer", "sdp": "..." } |

---

🔗 **OpenAPI JSON 다운로드:** [/openapi-spec.json](./openapi-spec.json)
  `,
    )
    .setVersion('1.0')
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

  writeFileSync('./openapi-spec.json', JSON.stringify(document, null, 2));

  const port = process.env.PORT || 3001;

  await app.listen(port);

  `🚀 Server running on: http://localhost:${port}`;
  `📚 API Documentation: http://localhost:${port}/api`;
  `💬 Chat WebSocket: ws://localhost:${port}/chat`;
  `📹 WebRTC WebSocket: ws://localhost:${port}/webrtc`;

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
