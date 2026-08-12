# AiDiary — AI 감정 일기 (MoodJournal)

**한국어** · [日本語](README.ja.md) · [English](README.en.md)

> AI가 당신의 일기를 요약하고, 감정 상태를 이모지로 표현해드립니다.

일기를 쓰면 OpenAI가 **한 줄 위트 있는 제목**을 자동으로 지어주고, 글에 담긴 **감정을 이모지로 변환**하며,
**다정한 친구의 한마디** 피드백까지 남겨주는 감정 일기 웹/모바일 앱입니다. 누적된 일기의 감정을
분석해 비율·추이를 차트로 보여줘, 내 마음의 흐름을 한눈에 돌아볼 수 있게 합니다.

🔗 **라이브 데모: [ai-diary-eight-drab.vercel.app](https://ai-diary-eight-drab.vercel.app)**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white)

---

## ✨ 주요 기능

- **AI 제목 요약** — 일기 내용을 GPT-4o-mini가 10자 내외의 유머러스한 한 줄 제목으로 요약 (직접 입력도 선택 가능)
- **감정 → 이모지 변환** — 글의 감정을 분석해 1~2개의 이모지로 표현
- **AI 피드백** — 다정한 친구가 건네는 한 문단(200자 이내)의 따뜻한 코멘트 생성 (`POST /api/diary/:id/ai-feedback`)
- **감정 분석 & 통계** — GPT-3.5-turbo로 일기의 감정 비율(JSON)을 산출하고, 누적 데이터를 평균·추이로 집계
- **감정 차트** — Chart.js 기반 감정 비율/추이 시각화 (`EmotionChart`, `StatsChart`)
- **Google OAuth 로그인** — Google 계정 로그인 + JWT 토큰 인증, 보호 라우트(`ProtectedRoute`)
- **일기 공유** — 공개/비공개/링크 공유(`shareToken`) 설정, 공유 링크 열람(`GET /api/share/:token`), 댓글 기능
- **반응형 UI** — 데스크톱/모바일 레이아웃 분기(`HomeDesktop` / `HomeMobile`, `useResponsive`)
- **다크 모드** — 라이트/다크/시스템 테마 지원 (시스템 선호도 자동 감지)
- **PWA** — `vite-plugin-pwa` + Service Worker + manifest로 설치형 앱 지원(`PWAInstallPrompt`)
- **모바일 앱 패키징** — Capacitor로 Android 앱 빌드 (`appId: com.moodjournal.app`)

## 🛠 기술 스택

**Client** (`mood-journal-app/client`)
- React 19 · Vite 6 · TypeScript
- Tailwind CSS 3 · React Router 7
- TanStack Query 5 (서버 상태) · ky (HTTP)
- Chart.js · react-chartjs-2 · chartjs-plugin-datalabels
- `@react-oauth/google` · ts-pattern
- vite-plugin-pwa · workbox-window · Capacitor

**Server** (`mood-journal-app/server`)
- Node.js · Express 4 · TypeScript
- MongoDB · Mongoose 8
- OpenAI SDK (`gpt-4o-mini`, `gpt-3.5-turbo`)
- JWT(`jsonwebtoken`) · `google-auth-library` (Google OAuth)
- Swagger (`swagger-jsdoc`, `swagger-ui-express`) — `/api-docs`

## 🏗 동작 방식 / 아키텍처

`client`(Vite SPA)와 `server`(Express API)로 구성된 모노레포이며, 두 앱 모두 Vercel에 배포됩니다.

```
[사용자] → React SPA(client)
             │  ky (VITE_API_URL)
             ▼
        Express API(server)  ──▶  MongoDB (Mongoose)
             │
             └──▶ OpenAI  (제목 요약 · 이모지 변환 · AI 피드백 · 감정 분석)
```

일기 저장 흐름: `POST /api/diary` → (`useAITitle`이면) `summarizeTitle`로 제목 생성 →
`convertEmotionToEmoji`로 감정 이모지 생성 → MongoDB에 저장. 인증은 Google OAuth로 토큰을 받고,
서버가 JWT로 세션을 관리합니다.

### 주요 API 라우트

| Method | Path | 설명 |
|---|---|---|
| `POST` | `/api/auth/google` | Google OAuth 로그인 |
| `GET` | `/api/auth/verify` | 토큰 검증 |
| `POST` | `/api/auth/logout` | 로그아웃 |
| `POST` `GET` `PUT` `DELETE` | `/api/diary` `…/:id` | 일기 CRUD |
| `GET` `POST` | `/api/diary/:id/comments` | 댓글 조회/작성 |
| `POST` | `/api/diary/:id/ai-feedback` | AI 피드백 생성 |
| `GET` | `/api/emotions/analysis` · `/api/emotions/stats` | 감정 분석/통계 |
| `GET` | `/api/share/:token` | 공유 링크 일기 열람 |
| `GET` | `/api/health` | 헬스체크 |
| — | `/api-docs` | Swagger UI |

## 🚀 시작하기

### 사전 요구사항
- Node.js (18+ 권장)
- MongoDB 인스턴스 (로컬 또는 Atlas)
- OpenAI API 키, Google OAuth 클라이언트

### 환경 변수

**Server** (`mood-journal-app/server/.env`)

| 변수 | 필수 | 설명 |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB 연결 문자열 |
| `OPENAI_API_KEY` | ✅ | OpenAI API 키 (제목/이모지/피드백/감정 분석) |
| `JWT_SECRET` | ✅ | JWT 서명 시크릿 |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth 클라이언트 시크릿 |
| `ALLOWED_ORIGINS` | 선택 | 허용 Origin 추가(콤마 구분) |
| `PORT` | 선택 | 서버 포트 (기본 `5000`) |

**Client** (`mood-journal-app/client/.env`)

| 변수 | 설명 |
|---|---|
| `VITE_API_URL` | 백엔드 API 베이스 URL |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |

### 설치 및 실행

```bash
# 1) 서버
cd mood-journal-app/server
npm install
npm run dev            # nodemon (개발), 기본 포트 5000
# npm run build && npm start   # 프로덕션 빌드/실행

# 2) 클라이언트 (새 터미널)
cd mood-journal-app/client
npm install
npm run dev            # vite --host, 기본 포트 5173
npm run build          # tsc -b && vite build
```

### 모바일(Android) 빌드

루트의 `capacitor.config.ts`(webDir: `client/dist`)를 사용합니다.

```bash
cd mood-journal-app
npm install
# client 빌드 후
npx cap add android
npx cap sync
```

## 📁 구조

```
mood-journal-app/
├─ client/                 # React + Vite SPA
│  └─ src/
│     ├─ pages/            # Home / Write / List / Detail / Stats / Login …
│     ├─ components/       # DiaryEditor, EmotionChart, StatsChart, LoginModal …
│     ├─ contexts/         # AuthContext
│     ├─ hooks/            # useResponsive
│     └─ utils/            # api, storage, emotionData …
├─ server/                 # Express API
│  ├─ src/
│  │  ├─ server.ts         # 앱 엔트리 · CORS · 라우트 마운트
│  │  ├─ authRoutes.ts     # Google OAuth · JWT
│  │  └─ routes/           # diary / comment / emotion / aiFeedback / share
│  ├─ models/              # DiaryEntry, Comment, EmotionAnalysis, User (Mongoose)
│  └─ utils/               # summaryUtils(OpenAI), emotionAnalysis, oauthUtils …
└─ capacitor.config.ts     # Capacitor (Android) 설정
```

---

> AI 요약·감정 분석은 OpenAI API를 통해 수행되며, 유효한 `OPENAI_API_KEY`가 필요합니다.

---

## 👤 기여도 & 개발 환경

| 항목 | 내용 |
|---|---|
| **기여 비율** | **100%** (단독 개발) |
| **커밋** | 95 / 95 (본인 / 전체 사람 커밋) |
| **참여 인원** | 1명 |

<sub>집계 기준(2026-08-12 스냅샷): origin의 **모든 브랜치**에서 도달 가능한 커밋(머지 커밋·빈 커밋 제외), 커밋 author 이메일 기준이며 동일인의 여러 이메일은 하나로 합산, 봇·자동화 커밋은 제외했습니다.</sub>
