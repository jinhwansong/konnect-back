import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';
import { Users } from '../src/entities/user.entity';
import { Mentors } from '../src/entities/mentor.entity';
import { MentoringSession } from '../src/entities/mentoring-session.entity';
import { MentoringReservation } from '../src/entities/mentoring-reservation.entity';
import { Article } from '../src/entities/article.entity';
import { Comment } from '../src/entities/comment.entity';
import { UserRole, MentorStatus } from '../src/common/enum/status.enum';
import { MentorCareerLevel, MentoringCategory, MentorPosition } from '../src/common/enum/category.enum';

// Jest 타임아웃 설정
jest.setTimeout(30000);

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository: Repository<Users>;
  let mentorRepository: Repository<Mentors>;
  let sessionRepository: Repository<MentoringSession>;
  let reservationRepository: Repository<MentoringReservation>;
  let articleRepository: Repository<Article>;
  let commentRepository: Repository<Comment>;

  let adminToken: string;
  let mentorToken: string;
  let menteeToken: string;
  let adminId: string;
  let mentorId: string;
  let menteeId: string;
  let testTimestamp: number;

  beforeAll(async () => {
    // 테스트 환경 변수 설정
    process.env.NODE_ENV = 'test';
    process.env.DB_DATABASE = 'konnect_test';
    process.env.JWT_SECRET = 'test-jwt-secret-for-e2e-testing-only';
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    userRepository = moduleFixture.get<Repository<Users>>(
      getRepositoryToken(Users),
    );
    mentorRepository = moduleFixture.get<Repository<Mentors>>(
      getRepositoryToken(Mentors),
    );
    sessionRepository = moduleFixture.get<Repository<MentoringSession>>(
      getRepositoryToken(MentoringSession),
    );
    reservationRepository = moduleFixture.get<Repository<MentoringReservation>>(
      getRepositoryToken(MentoringReservation),
    );
    articleRepository = moduleFixture.get<Repository<Article>>(
      getRepositoryToken(Article),
    );
    commentRepository = moduleFixture.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );

    await createSeedData();
  });

  afterAll(async () => {
    // 안전한 정리
    try {
      if (dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
      }
    } catch (error) {
      console.warn('DataSource cleanup warning:', error.message);
    }
    
    try {
      if (app) {
        await app.close();
      }
    } catch (error) {
      console.warn('App cleanup warning:', error.message);
    }
  });

  async function createSeedData() {
    const bcrypt = require('bcrypt');
    // DTO 비밀번호 정책에 맞는 강한 비밀번호 사용
    const hashedPassword = bcrypt.hashSync('Password123!', 10);
    testTimestamp = Date.now();

    // Admin 계정 생성
    const admin = userRepository.create({
      email: `admin${testTimestamp}@test.com`,
      password: hashedPassword,
      nickname: `관리자${testTimestamp}`,
      name: `관리자${testTimestamp}`,
      phone: `01000000001`,
      role: UserRole.ADMIN,
    });
    const savedAdmin = await userRepository.save(admin);
    adminId = savedAdmin.id;

    // Mentor 계정 생성
    const mentorUser = userRepository.create({
      email: `mentor${testTimestamp}@test.com`,
      password: hashedPassword,
      nickname: `멘토${testTimestamp}`,
      name: `멘토${testTimestamp}`,
      phone: `01000000002`,
      role: UserRole.MENTOR,
    });
    const savedMentorUser = await userRepository.save(mentorUser);
    mentorId = savedMentorUser.id;
    
    // Mentor 프로필 생성
    const mentorProfile = mentorRepository.create({
      company: '테스트 회사',
      introduce: '멘토 소개글',
      position: MentorPosition.BACKEND,
      expertise: [MentoringCategory.IT],
      career: MentorCareerLevel.SENIOR,
      portfolio: '포트폴리오 URL',
      status: MentorStatus.PENDING,
      isCompanyHidden: false,
    });
    mentorProfile.user = savedMentorUser;
    await mentorRepository.save(mentorProfile);

    // Mentee 계정 생성
    const menteeUser = userRepository.create({
      email: `mentee${testTimestamp}@test.com`,
      password: hashedPassword,
      nickname: `멘티${testTimestamp}`,
      name: `멘티${testTimestamp}`,
      phone: `01000000003`,
      role: UserRole.MENTEE,
    });
    const savedMenteeUser = await userRepository.save(menteeUser);
    menteeId = savedMenteeUser.id;
  }

  describe('Auth Flow', () => {
    it('회원가입', async () => {
      const userData = {
        email: 'newuser@test.com',
        // DTO 비밀번호 정책에 맞게 수정: 8자 이상, 영문자, 숫자, 특수문자 포함
        password: 'Password123!',
        nickname: '새사용자',
        name: '새사용자',
        phone: '01000000004',
      };

      const res = await request(app.getHttpServer())
        .post('/auth/join')
        .send(userData)
        .expect(201);

      expect(res.body).toHaveProperty('message');
    });

    it('로그인 후 토큰 반환', async () => {
      const loginData = { 
        email: `mentor${testTimestamp}@test.com`, 
        password: 'Password123!' // DTO 비밀번호 정책에 맞게 수정
      };
      
      // 실제 로그인 API 호출
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200); // @HttpCode(200)으로 설정되어 있음

      expect(res.body).toHaveProperty('accessToken');
      mentorToken = res.body.accessToken;
    });

    it('토큰 검증', async () => {
      // JWT 토큰 검증 엔드포인트가 없으므로 사용자 정보 조회로 대체
      const res = await request(app.getHttpServer())
        .get('/mentor')
        .set('Authorization', `Bearer ${mentorToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id');
    });
  });

  describe('Mentor Flow', () => {
    it('멘토 신청', async () => {
      const data = {
        company: '새 회사',
        introduce: '멘토 소개',
        position: MentorPosition.FRONTEND,
        expertise: [MentoringCategory.IT],
        career: MentorCareerLevel.MIDDLE,
        portfolio: '포트폴리오',
      };

      const res = await request(app.getHttpServer())
        .post('/mentor/apply')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(data)
        .expect(201);

      const mentor = await mentorRepository.findOne({
        where: { user: { id: mentorId } },
      });
      expect(mentor.status).toBe(MentorStatus.PENDING);
    });

    it('관리자가 멘토 승인', async () => {
      // 관리자 로그인
      const adminLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ 
          email: `admin${testTimestamp}@test.com`, 
          password: 'Password123!' // DTO 비밀번호 정책에 맞게 수정
        })
        .expect(200);
      adminToken = adminLogin.body.accessToken;

      const mentor = await mentorRepository.findOne({
        where: { user: { id: mentorId } },
      });
      
      // 관리자 승인 API 호출 (POST로 수정)
      const res = await request(app.getHttpServer())
        .post(`/admin/mentors/${mentor.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: MentorStatus.APPROVED })
        .expect(200);

      const updatedMentor = await mentorRepository.findOne({
        where: { id: mentor.id },
        relations: ['user'],
      });
      expect(updatedMentor.status).toBe(MentorStatus.APPROVED);
      expect(updatedMentor.user.role).toBe(UserRole.MENTOR);
    });

    it('멘토링 스케줄 생성', async () => {
      const data = {
        data: [{ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '18:00' }],
      };
      const res = await request(app.getHttpServer())
        .post('/schedule')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(data)
        .expect(201);

      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Reservation & Payment Flow', () => {
    beforeAll(async () => {
      // 멘티 로그인
      const menteeLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ 
          email: `mentee${testTimestamp}@test.com`, 
          password: 'Password123!' // DTO 비밀번호 정책에 맞게 수정
        })
        .expect(200);
      menteeToken = menteeLogin.body.accessToken;

      const mentor = await mentorRepository.findOne({
        where: { user: { id: mentorId } },
      });
      const session = sessionRepository.create({
        title: '테스트 세션',
        description: '설명',
        price: 50000,
        mentor,
      });
      await sessionRepository.save(session);
    });

    it('예약 생성', async () => {
      const session = await sessionRepository.findOne({
        where: { title: '테스트 세션' },
      });
      const data = {
        sessionId: session.id,
        date: '2024-12-31',
        startTime: '14:00',
        endTime: '15:00',
        question: '질문',
      };

      const res = await request(app.getHttpServer())
        .post('/reservation')
        .set('Authorization', `Bearer ${menteeToken}`)
        .send(data)
        .expect(201);

      const reservation = await reservationRepository.findOne({
        where: { id: res.body.id },
        relations: ['session'],
      });
      expect(reservation.session.title).toBe('테스트 세션');
    });

    it('결제 확정', async () => {
      const reservation = await reservationRepository.findOne({
        where: { session: { title: '테스트 세션' } },
      });
      const data = {
        orderId: 'order-123',
        paymentKey: 'pk-test',
        amount: 50000,
      };

      const res = await request(app.getHttpServer())
        .post('/payment/confirm')
        .set('Authorization', `Bearer ${menteeToken}`)
        .send(data)
        .expect(200);

      expect(res.body).toHaveProperty('message');
    });

    it('예약 상세 조회', async () => {
      const reservation = await reservationRepository.findOne({
        where: { session: { title: '테스트 세션' } },
      });
      const res = await request(app.getHttpServer())
        .get(`/reservation/${reservation.id}`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body.session.title).toBe('테스트 세션');
    });
  });

  describe('Article & Comment Flow', () => {
    let articleId: string;
    let commentId: string;

    it('아티클 생성', async () => {
      const data = {
        title: '테스트 아티클',
        content: '내용',
        category: 'TECH',
      };
      const res = await request(app.getHttpServer())
        .post('/article')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send(data)
        .expect(201);

      articleId = res.body.id;
      const article = await articleRepository.findOne({
        where: { id: articleId },
      });
      expect(article.title).toBe('테스트 아티클');
    });

    it('좋아요 토글', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/article/${articleId}/like`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(200);

      expect(typeof res.body.liked).toBe('boolean');
    });

    it('댓글 작성', async () => {
      const data = { content: '댓글' };
      const res = await request(app.getHttpServer())
        .post(`/article/${articleId}/comment`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .send(data)
        .expect(201);

      commentId = res.body.id;
      const comment = await commentRepository.findOne({
        where: { id: commentId },
        relations: ['article'],
      });
      expect(comment.content).toBe('댓글');
    });

    it('댓글 삭제', async () => {
      await request(app.getHttpServer())
        .delete(`/article/comment/${commentId}`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .expect(200);

      const comment = await commentRepository.findOne({
        where: { id: commentId },
      });
      expect(comment).toBeNull();
    });
  });

  describe('Error Cases', () => {
    it('401 Unauthorized', async () => {
      await request(app.getHttpServer()).get('/mentor').expect(401);
    });

    it('403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post('/schedule')
        .set('Authorization', `Bearer ${menteeToken}`)
        .send({ data: [] })
        .expect(403);
    });

    it('400 Bad Request', async () => {
      // DTO 비밀번호 정책에 맞지 않는 약한 비밀번호로 테스트
      const invalid = { 
        email: 'invalid', 
        password: '123', // 너무 짧고 특수문자 없음
        nickname: 'test',
        name: 'test',
        phone: '01012345678'
      };
      await request(app.getHttpServer())
        .post('/auth/join')
        .send(invalid)
        .expect(400);
    });
  });
});