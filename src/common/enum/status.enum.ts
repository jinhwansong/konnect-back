export enum MentorStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
// 회원등급
export enum UserRole {
  MENTEE = 'mentee',
  MENTOR = 'mentor',
  ADMIN = 'admin',
}
// 소셜로그인
export enum SocialLoginProvider {
  GOOGLE = 'google',
  KAKAO = 'kakao',
  NAVER = 'naver',
}
// 좋아요 대상타입
export enum LikeType {
  REVIEW = 'review',
  ARTICLE = 'article',
  SESSION = 'session',
}

// 멘토링 현황
export enum MentoringStatus {
  PENDING = 'pending',
  EXPIRED = 'expired',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  PROGRESS = 'progress',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum ChatRoomStatus {
  WAITING = 'waiting',
  PROGRESS = 'progress',
  CLOSED = 'closed',
}

export enum ChatMessageType {
  TEXT = 'text',
  SYSTEM = 'system',
}
