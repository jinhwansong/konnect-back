import http from 'k6/http';
import { check, sleep } from 'k6';

// API base URL
const API_URL = __ENV.API_URL || 'http://localhost:3030';

// Helper 함수
export function postJson(url, body, token) {
  return http.post(url, JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }), // ✅ Bearer 붙이기
    },
  });
}

export default function () {
  const password = 'password123!';

  // 1. 회원가입 (멘토 계정)
  const email = `mentor${Math.floor(Math.random() * 100000)}@test.com`;
  const phone = `010${__VU}${__ITER}`.padEnd(11, '0');

  const joinRes = postJson(`${API_URL}/auth/join`, {
    email,
    password,
    nickname: `LoadMentor_${Math.random().toString(36).substring(2, 6)}`,
    name: 'LoadMentor',
    phone,
  });
  check(joinRes, { 'mentor join success': (res) => res.status === 201 });

  // 2. 로그인 (멘토)
  const loginRes = postJson(`${API_URL}/auth/login`, { email, password });
  check(loginRes, { 'mentor login success': (res) => res.status === 201 });
  const mentorToken = loginRes.json('accessToken');

  // 3. 멘토 신청
  const mentorApplyRes = postJson(
    `${API_URL}/mentor/apply`,
    {
      company: 'Google',
      introduce: '10년차 프론트엔드 개발자입니다.',
      position: 'backend', // enum 소문자
      expertise: ['consulting', 'design'], // enum 소문자 배열
      career: 'junior', // enum 소문자
      portfolio: 'https://portfolio.example.com',
    },
    mentorToken,
  );
  check(mentorApplyRes, {
    'mentor apply success': (res) => res.status === 201,
  });
  const mentorId = mentorApplyRes.json('id');

  // 4. 관리자 로그인
  const adminLoginRes = postJson(`${API_URL}/auth/login`, {
    email: 'admin@test.com',
    password: 'admin123!',
  });
  check(adminLoginRes, { 'admin login success': (res) => res.status === 201 });
  const adminToken = adminLoginRes.json('accessToken');

  // 5. 관리자 → 멘토 승인
  if (mentorId) {
    const approveRes = postJson(
      `${API_URL}/admin/mentors/${mentorId}/approve`,
      { status: 'approved' },
      adminToken,
    );
    check(approveRes, {
      'mentor approve success': (res) => res.status === 200,
    });
  }

  // 6. 멘토 스케줄 등록
  const today = new Date().toISOString().split('T')[0];
  const scheduleRes = postJson(
    `${API_URL}/schedule`,
    {
      data: [
        {
          dayOfWeek: 'MONDAY',
          date: today,
          startTime: '10:00',
          endTime: '11:00',
        },
        {
          dayOfWeek: 'MONDAY',
          date: today,
          startTime: '14:00',
          endTime: '15:00',
        },
      ],
    },
    mentorToken,
  );
  check(scheduleRes, {
    'schedule create success': (res) => res.status === 201,
  });
  const sessionId = scheduleRes.json('data[0].id'); // 첫 세션 id 추출

  // 7. 회원가입 (멘티)
  const menteeEmail = `mentee${Math.floor(Math.random() * 100000)}@test.com`;
  const menteeJoinRes = postJson(`${API_URL}/auth/join`, {
    email: menteeEmail,
    password,
    nickname: `LoadMentee_${Math.random().toString(36).substring(2, 6)}`,
    name: 'LoadMentee',
    phone: `010${Math.floor(10000000 + Math.random() * 90000000)}`,
  });
  check(menteeJoinRes, { 'mentee join success': (res) => res.status === 201 });

  // 8. 로그인 (멘티)
  const menteeLoginRes = postJson(`${API_URL}/auth/login`, {
    email: menteeEmail,
    password,
  });
  check(menteeLoginRes, {
    'mentee login success': (res) => res.status === 201,
  });
  const menteeToken = menteeLoginRes.json('accessToken');

  // 9. 멘티 예약
  const reservationRes = postJson(
    `${API_URL}/reservation`,
    {
      sessionId,
      date: today,
      startTime: '10:00',
      endTime: '11:00',
      question: '멘토링을 받고 싶습니다.',
    },
    menteeToken,
  );

  check(reservationRes, { 'reservation success': (res) => res.status === 201 });
  const reservationId = reservationRes.json('id');

  // 10. 결제 확정
  const paymentRes = postJson(
    `${API_URL}/payment/confirm`,
    {
      reservationId,
      orderId: `ORDER-${Math.random().toString(36).substring(2, 8)}`,
      paymentKey: `PAY-${Math.random().toString(36).substring(2, 8)}`,
      price: 10000,
    },
    menteeToken,
  );
  check(paymentRes, { 'payment confirm success': (res) => res.status === 201 });

  // 11. 아티클 작성 (멘토)
  const articleRes = postJson(
    `${API_URL}/article`,
    {
      title: '테스트 아티클',
      content: '부하테스트용 아티클입니다.',
      category: 'tech', // enum 값 확인 필요
    },
    mentorToken,
  );
  check(articleRes, { 'article create success': (res) => res.status === 201 });

  sleep(1);
}
