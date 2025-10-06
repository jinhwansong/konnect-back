import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

// Frontend ChatMessage interface와 일치
export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  isMentor: boolean;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'file';
  fileUrl?: string;
  fileName?: string;
}

// Frontend RoomUser interface와 일치
export interface RoomUser {
  id: string;
  name: string;
  image?: string;
  isMentor: boolean;
  isConnected: boolean;
}

// Frontend User interface와 일치
export interface User {
  id: string;
  name: string;
  image?: string;
  isMentor?: boolean;
}

// DTO 클래스들
export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  userName!: string;

  @IsOptional()
  @IsString()
  userImage?: string;

  @IsBoolean()
  isMentor!: boolean;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsOptional()
  @IsIn(['text', 'system', 'file'])
  type?: 'text' | 'system' | 'file';

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  userName!: string;

  @IsOptional()
  @IsString()
  userImage?: string;

  @IsBoolean()
  isMentor!: boolean;
}

export class LeaveRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}

// 응답용 DTO들
export class ChatMessageResponseDto implements ChatMessage {
  id!: string;
  userId!: string;
  userName!: string;
  userImage?: string;
  isMentor!: boolean;
  message!: string;
  timestamp!: Date;
  type!: 'text' | 'system' | 'file';
  fileUrl?: string;
  fileName?: string;
  roomId!: string;
}

export class UserJoinedResponseDto {
  userId!: string;
  userName!: string;
  userImage?: string;
  isMentor!: boolean;
  socketId!: string;
}

export class UserLeftResponseDto {
  userId!: string;
  userName!: string;
  socketId!: string;
}

export class UsersListResponseDto {
  users!: RoomUser[];
}

export class MessagesHistoryResponseDto {
  messages!: ChatMessage[];
}
