import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

// Frontend WebRTCUser interface와 일치
export interface WebRTCUser {
  id: string;
  name: string;
  image?: string;
  isMentor: boolean;
  stream?: MediaStream;
}

// Frontend WebRTCSignalPayload interface와 일치
export interface WebRTCSignalPayload {
  roomId: string;
  targetUserId: string;
  signal: unknown; // simple-peer SignalData
  type: 'offer' | 'answer' | 'ice_candidate';
}

// Frontend User interface와 일치
export interface User {
  id: string;
  name: string;
  image?: string;
  isMentor?: boolean;
}

// DTO 클래스들
export class WebRTCSignalDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  targetUserId!: string;

  // simple-peer SignalData는 unknown으로 처리
  signal!: unknown;

  @IsIn(['offer', 'answer', 'ice_candidate'])
  type!: 'offer' | 'answer' | 'ice_candidate';
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

  @IsOptional()
  @IsBoolean()
  isMentor?: boolean;
}

export class LeaveRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}

export class StreamReadyDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}

export class ScreenShareDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}

// 응답용 DTO들
export class WebRTCSignalResponseDto implements WebRTCSignalPayload {
  roomId!: string;
  userId!: string;
  targetUserId!: string;
  signal!: unknown;
  type!: 'offer' | 'answer' | 'ice_candidate';
}

export class UserJoinedResponseDto {
  userId!: string;
  userName!: string;
  userImage?: string;
  isMentor?: boolean;
  socketId!: string;
}

export class UserLeftResponseDto {
  userId!: string;
  userName!: string;
  socketId!: string;
}

export class StreamReadyResponseDto {
  userId!: string;
  userName!: string;
  socketId!: string;
}

export class ScreenShareStartedResponseDto {
  userId!: string;
  userName!: string;
}

export class ScreenShareStoppedResponseDto {
  userId!: string;
  userName!: string;
}

export class UsersListResponseDto {
  users!: Array<{
    id: string;
    name: string;
    image?: string;
    isMentor?: boolean;
    isStreamReady: boolean;
  }>;
}

export class RoomStatsResponseDto {
  roomId!: string;
  memberCount!: number;
  users!: Array<{
    id: string;
    name: string;
    isMentor?: boolean;
    isStreamReady: boolean;
  }>;
}
