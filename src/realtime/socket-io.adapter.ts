import { INestApplication, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class SocketIoAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIoAdapter.name);

  constructor(private app: INestApplication) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const cors = {
      origin: [
        'https://surge-lobby-printing-conjunction.trycloudflare.com',
        'http://localhost:3000',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie', 'Cookie'],
    };

    const serverOptions: ServerOptions = {
      cors,
      transports: ['websocket', 'polling'],
      ...options,
    };

    const server = super.createIOServer(port, serverOptions);
    
    // Create namespaces for chat and webrtc
    const chatNamespace = server.of('/chat');
    const webrtcNamespace = server.of('/webrtc');

    // Configure chat namespace
    chatNamespace.on('connection', (socket) => {
      this.logger.log(`🔌 Chat client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        this.logger.log(`🔌 Chat client disconnected: ${socket.id}`);
      });
    });

    // Configure webrtc namespace
    webrtcNamespace.on('connection', (socket) => {
      this.logger.log(`🔌 WebRTC client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        this.logger.log(`🔌 WebRTC client disconnected: ${socket.id}`);
      });
    });

    this.logger.log(
      '🚀 Socket.IO server created with namespaces: /chat, /webrtc',
    );
    return server;
  }
}
