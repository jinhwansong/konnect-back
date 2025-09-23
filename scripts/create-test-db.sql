-- 테스트 데이터베이스 생성 스크립트
-- MySQL에서 실행하세요

-- 기존 테스트 DB 삭제 (주의: 모든 데이터가 삭제됩니다)
DROP DATABASE IF EXISTS konnect_test;

-- 새로운 테스트 DB 생성
CREATE DATABASE konnect_test 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_general_ci;

-- 권한 설정 (필요시)
-- GRANT ALL PRIVILEGES ON konnect_test.* TO 'your_username'@'localhost';
-- FLUSH PRIVILEGES;

-- 사용할 데이터베이스 선택
USE konnect_test;

-- 완료 메시지
SELECT '테스트 데이터베이스 konnect_test가 성공적으로 생성되었습니다!' as message;


