export enum ArticleCategory {
  CAREER = 'career', // 진로 설계, 직무 선택, 커리어 전환 이야기
  JOB = 'job', // 취업 준비, 이직 전략, 포트폴리오 작성 등
  STUDY = 'study', // 공부 방법, 학습 노하우, 자격증/시험 후기
  TECH = 'tech', // 실무 기술 공유, 툴 사용 팁, 개발/디자인 등
  LIFESTYLE = 'lifestyle', // 멘토의 일상, 루틴, 생산성 팁 등
  MENTORING = 'mentoring', // 실제 멘토링 사례, 느낀 점, QnA 정리
  NOTICE = 'notice', // 서비스 공지, 시스템 관련 안내 등
  STARTUP = 'startup', // 창업, 사이드 프로젝트, 스타트업 이야기
  PORTFOLIO = 'portfolio', // 	포트폴리오 작성/리뷰 관련 팁
  BOOK = 'book', // 	책 추천, 독서 후기, 학습 자료
  ETC = 'etc',
}

export enum MentoringCategory {
  HR = 'hr', // 인사/총무/노무
  MARKETING = 'marketing', // 마케팅/MD
  PR = 'pr', //홍보/CSR
  SALES = 'sales', //영업/영업관리
  FINANCE = 'finance', // 회계/재무/금융
  PLANNING = 'planning', // 전략/기획
  IT = 'it', // IT개발/데이터
  UX_UI = 'ux_ui', // 서비스 기획/UI, UX
  DESIGN = 'design', // 디자인/예술
  CONSULTING = 'consulting', // 교육/상담/컨설팅
  MANUFACTURING = 'manufacturing', // 생산/품질/제조
  ETC = 'etc', // 기타 사무
}
export enum MentorCareerLevel {
  JUNIOR = 'junior', // 주니어 (1~3년)
  MIDDLE = 'middle', // 미들 (4~8년)
  SENIOR = 'senior', // 시니어 (9년 이상)
  LEAD = 'lead', // Lead 레벨
}
export enum MentorPosition {
  BACKEND = 'backend', // 백엔드 / 서버 개발자
  FRONTEND = 'frontend', // 프론트엔드 개발자
  FULLSTACK = 'fullstack', // 풀스택 개발자
  MOBILE = 'mobile', // 모바일 앱 개발자
  DEVOPS = 'devops', // 데브옵스 / 인프라 엔지니어
  SECURITY = 'security', // 보안 엔지니어
  DATA_ENGINEER = 'data_engineer', // 데이터 엔지니어
  DATA_SCIENTIST = 'data_scientist', // 데이터 분석가 / 사이언티스트
  PM_PO = 'pm_po', // PM / PO
  UX_DESIGNER = 'ux_designer', // UX 디자이너
  UI_DESIGNER = 'ui_designer', // UI 디자이너
  PLANNER = 'planner', // 서비스 기획자
  MARKETING = 'marketing', // 마케터 / 콘텐츠 기획자
  HR = 'hr', // HR / 리쿠루터
  CS = 'cs', // CS / 운영
  FINANCE = 'finance', // 회계 / 재무
  ETC = 'etc', // 기타
}
