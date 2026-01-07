# Konnect Backend (NestJS)

## 1️⃣ 프로젝트 소개
멘토링 예약 → 실시간 세션(채팅/화상) → 결제/정산까지 한 번에 처리하는 백엔드. REST API와 WebSocket으로 예약·세션 상태를 실시간 동기화해 이탈과 충돌을 줄였습니다.  
키워드: 실시간, 예약/세션, 결제/정산, WebSocket

## 2️⃣ 프로젝트 개요
- 배경: 기존 멘토링 서비스는 예약·실시간·결제가 분리되어 맥락이 끊기고 충돌/노쇼가 빈번했습니다.  
- 해결하려던 문제: 이중 예약, 지연된 상태 전파, 결제 실패 후 흐름 단절.  
- 백엔드 역할: 프론트(Next.js)에 단일 진입점(API)과 실시간 채널(Socket)을 제공해 예약 확정, 세션 입장, 결제 결과를 즉시 반영합니다.

## 3️⃣ 기술 스택
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socket.io&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=flat-square&logo=mysql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-RS256-000000?style=flat-square)
- NestJS + TypeScript: REST와 Socket 게이트웨이를 같은 모듈 시스템에서 관리하기 용이해서 선택.  
- Socket.IO: 예약/세션/알림을 폴링 없이 즉시 반영하기 위해 사용.  
- MySQL(TypeORM) + MongoDB(Mongoose): 예약/결제의 정합성과 채팅 히스토리/로그 저장 특성을 분리.  
- Redis: 예약 슬롯 캐시와 세션 상태 동기화에 활용.  
- JWT(RS256): REST/Socket 공통 인증, 프론트는 헤더로만 사용해 노출 최소화.

## 4️⃣ 시스템 구조 요약
- REST API: 예약/세션/결제/알림/멘토 정보 관리.  
- WebSocket: `/chat`, `/webrtc` 네임스페이스로 실시간 채팅·시그널링 제공.  
- 도메인 분리: 예약/세션/결제/알림을 모듈별로 분리해 변경 영향 범위를 최소화.  
- 실시간 필요성: 예약 승인, 세션 입장, 결제 결과를 지연 없이 공유해 이중 예약·노쇼·중단을 줄이기 위함.

## 5️⃣ 핵심 기능
- 인증: RS256 JWT를 REST 가드와 소켓 핸드셰이크에서 동일 검증, NextAuth 액세스 토큰은 요청 헤더/소켓 파라미터로만 사용해 XSS 노출을 낮춤.  
- 실시간: 커스텀 SocketIoAdapter로 네임스페이스/CORS/트랜스포트(웹소켓 우선)를 일관 관리, 예약 시간/룸 검증 후 입장 허용.  
- 예약: 가용 슬롯 조회·승인/거절 시 Redis 캐시 무효화 + Socket 이벤트로 즉시 반영, 이중 예약 감소.  
- 결제/정산: Toss 에스크로; 결제 성공 시 예약 확정, 세션 종료 후 정산. 웹훅으로 상태를 싱크.  
- 알림: FCM/이메일/Socket 인앱 알림으로 예약 확정, 세션 시작, 리뷰 요청, 결제 실패를 자동 전달.

## 담당 범위
- 개인 프로젝트로 백엔드 전담: API 설계/구현, DB·캐시 스키마, 실시간 게이트웨이, 결제/알림 연동, 배포/모니터링 구성.

## 설계 의도
- 예약→세션→결제 전 과정을 한 흐름으로 묶고, REST+WebSocket으로 상태를 즉시 동기화해 이중 예약·노쇼·결제 단절을 줄인다.

## 6️⃣ 트러블슈팅 & 고민
- WebSocket 업그레이드 누락: 프록시가 Upgrade/Connection 헤더를 전달하지 않아 실시간 끊김 → 프록시 설정 보완 후 안정화.  
- CORS/도메인 불일치: 실 프론트 도메인 미등록으로 Socket 연결 실패 → CORS 화이트리스트와 Socket.IO CORS 옵션에 실 도메인 추가.  
- JWT 검증 강화: 토큰 `sub` 불일치로 채팅 입장 거부 사례 → 게이트웨이에서 JWT 검증 후 예약 시간·룸ID 검증을 추가해 오용 차단.  
- 캐시 불일치: 예약 승인/취소 시 Redis 무효화 누락 → 승인 이벤트에서 캐시 삭제 + Socket invalidate로 슬롯 상태 맞춤.  
- 결제 실패 흐름: 실패/취소 콜백 처리 누락으로 슬롯 락 지속 → 상태 `PAYMENT_FAILED` 롤백, 슬롯 재오픈, 알림 발송/재시도 안내로 복구.

## 보안·안정성 고려
- RS256 JWT로 REST/Socket 공통 검증, 토큰은 헤더/소켓 파라미터로만 사용해 노출 최소화.
- CORS 화이트리스트와 Socket CORS를 실 도메인 기준으로 관리, 프록시에서 TLS 종료와 WebSocket 업그레이드 헤더 전달을 명시.
- 예약·결제 캐시 무효화와 웹훅 기반 상태 동기화로 정합성 유지.
- 입력 검증(ValidationPipe)과 가드/인터셉터로 비정상 요청 차단.

## 7️⃣ 프로젝트 구조
```
backend/
├─ src/
│  ├─ auth/            # JWT 가드, 인증 로직
│  ├─ reservation/     # 예약/슬롯 관리
│  ├─ session/         # 멘토링 세션 흐름
│  ├─ payment/         # 결제/정산(Toss) 처리
│  ├─ realtime/        # chat/webrtc 게이트웨이
│  ├─ notification/    # 인앱/푸시 알림
│  ├─ mail/ / fcm/     # 이메일, FCM 채널
│  ├─ common/          # 가드, 인터셉터, 유틸
│  ├─ entities/        # TypeORM 엔티티
│  └─ schema/          # Mongoose 스키마
```

## 개선 예정
- 트래픽 증가 대응: Socket 네임스페이스/Redis 캐시 스케일아웃 정비, DB 읽기 부하 분산 방안 검토.
- WebRTC 화면 공유: 시그널링/권한 흐름 확장 계획 (미구현 상태).
- 결제 재시도 UX: 실패 케이스별 재시도/복구 경로를 프론트·백 동시 보완 예정.