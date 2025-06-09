export enum Status {
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
}

// 멘토링 현황
export enum MemtoringStatus {
  // 대기
  PENDING = 'pending',
  // 승인전
  COMFIRMED = 'confirmed',
  // 취소
  CANCELLED = 'cancelled',
  // 완료
  COMPLETED = 'completed',
  // 승인후
  PROGRESS = 'progress',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}