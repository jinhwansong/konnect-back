// 응답 공통 래퍼
export class ApiResponseDto<T> {
  // 응답 메시지
  message!: string;
  // 응답 데이터
  data!: T;
}

export class ChatRoomSummaryDto {
  id!: string;
  name!: string;
  description?: string;
  participantCount!: number;
}

export class ChatMessageDto {
  id!: string;
  roomId!: string;
  userId!: string;
  message!: string;
  createdAt!: string; // ISO 문자열
  fileUrl?: string;
  fileName?: string;
}

export class WebRTCTokenDto {
  roomId!: string;
  userId!: string;
  token!: string;
  expiresIn!: number; // seconds
}
