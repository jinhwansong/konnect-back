import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsOptional()
  @IsString()
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
}

export class LeaveRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;
}


