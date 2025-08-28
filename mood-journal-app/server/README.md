# Mood Journal App - Server

AI 기반 감정 일기 애플리케이션의 백엔드 서버입니다.

## 설치 및 실행

```bash
npm install
npm run dev
```

## 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# MongoDB 연결 문자열
MONGODB_URI=mongodb://localhost:27017/mood-journal

# JWT 시크릿 키 (프로덕션에서는 강력한 랜덤 문자열 사용)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Google OAuth 설정
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 네이버 OAuth 설정
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

# OpenAI API 키
OPENAI_API_KEY=your-openai-api-key

# 서버 포트
PORT=5000

# 환경 (development/production)
NODE_ENV=development
```

## OAuth 설정

### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Google+ API 활성화
3. OAuth 2.0 클라이언트 ID 생성
4. 승인된 리디렉션 URI 설정

### 네이버 OAuth

1. [네이버 개발자 센터](https://developers.naver.com/)에서 애플리케이션 등록
2. OAuth 2.0 설정
3. 콜백 URL 설정

## API 문서

서버 실행 후 `/api-docs` 엔드포인트에서 Swagger API 문서를 확인할 수 있습니다.

## 주요 기능

- Google/네이버 OAuth 인증
- JWT 기반 인증
- 일기 CRUD API
- AI 기반 감정 분석
- 감정 통계 API
- AI 피드백 생성

## 기술 스택

- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose)
- JWT 인증
- Swagger API 문서
- OpenAI API 연동
