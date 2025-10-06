import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateChatRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  // 채팅방의 표시 이름
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  // 채팅방 설명
  description?: string;

  @IsArray()
  @IsString({ each: true })
  // 참여자 사용자 ID 목록 (멘토/멘티 포함)
  participants!: string[];
}

export class ChatRoomListQueryDto {
  @IsOptional()
  @IsString()
  // 검색 키워드 (방 이름 기준)
  keyword?: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  // 보낸 사람 사용자 ID
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  // 메시지 본문
  message!: string;

  @IsOptional()
  @IsString()
  // 파일 URL (있는 경우)
  fileUrl?: string;

  @IsOptional()
  @IsString()
  // 파일 이름 (있는 경우)
  fileName?: string;
}

export class IssueWebRTCTokenDto {
  @IsString()
  @IsNotEmpty()
  // 참여할 채팅/화상 방 ID
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  // 토큰을 발급받으려는 사용자 ID
  userId!: string;
}
