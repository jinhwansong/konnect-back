import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  // simple-peer SignalData is broad; keep as unknown
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


