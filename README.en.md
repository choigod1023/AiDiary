# AiDiary — AI Mood Journal (MoodJournal)

[한국어](README.md) · [日本語](README.ja.md) · **English**

> AI summarizes your diary and expresses your emotional state as emoji.

Write an entry and OpenAI gives it a **witty one-line title**, **turns the feelings in the text into emoji**, and leaves
**a kind word from a caring friend** as feedback. This mood-journal web/mobile app analyzes the emotions across your
accumulated entries and charts the proportions and trends, so you can look back on how your mind has been moving.

🔗 **Live demo: [ai-diary-eight-drab.vercel.app](https://ai-diary-eight-drab.vercel.app)**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white)

---

## ✨ Features

- **AI title summarization** — GPT-4o-mini condenses the entry into a humorous one-line title of roughly ten characters (you can also type your own)
- **Emotion → emoji** — analyzes the feeling in the text and expresses it as one or two emoji
- **AI feedback** — generates a warm, single-paragraph comment (under 200 characters) in the voice of a caring friend (`POST /api/diary/:id/ai-feedback`)
- **Emotion analysis & statistics** — GPT-3.5-turbo computes the emotion proportions (JSON) of an entry, and accumulated data is aggregated into averages and trends
- **Emotion charts** — Chart.js visualizations of proportions and trends (`EmotionChart`, `StatsChart`)
- **Google OAuth sign-in** — Google account login with JWT authentication and protected routes (`ProtectedRoute`)
- **Sharing** — public/private/link sharing (`shareToken`), viewing via a share link (`GET /api/share/:token`), and comments
- **Responsive UI** — separate desktop and mobile layouts (`HomeDesktop` / `HomeMobile`, `useResponsive`)
- **Dark mode** — light/dark/system themes (system preference detected automatically)
- **PWA** — installable via `vite-plugin-pwa` + service worker + manifest (`PWAInstallPrompt`)
- **Mobile packaging** — Android builds through Capacitor (`appId: com.moodjournal.app`)

## 🛠 Tech stack

**Client** (`mood-journal-app/client`)
- React 19 · Vite 6 · TypeScript
- Tailwind CSS 3 · React Router 7
- TanStack Query 5 (server state) · ky (HTTP)
- Chart.js · react-chartjs-2 · chartjs-plugin-datalabels
- `@react-oauth/google` · ts-pattern
- vite-plugin-pwa · workbox-window · Capacitor

**Server** (`mood-journal-app/server`)
- Node.js · Express 4 · TypeScript
- MongoDB · Mongoose 8
- OpenAI SDK (`gpt-4o-mini`, `gpt-3.5-turbo`)
- JWT (`jsonwebtoken`) · `google-auth-library` (Google OAuth)
- Swagger (`swagger-jsdoc`, `swagger-ui-express`) — `/api-docs`

## 🏗 How it works / architecture

A monorepo of `client` (Vite SPA) and `server` (Express API); both deploy to Vercel.

```
[user] → React SPA (client)
            │  ky (VITE_API_URL)
            ▼
       Express API (server)  ──▶  MongoDB (Mongoose)
            │
            └──▶ OpenAI  (title summarization, emoji conversion, AI feedback, emotion analysis)
```

Saving an entry: `POST /api/diary` → (if `useAITitle`) generate a title with `summarizeTitle` →
generate emotion emoji with `convertEmotionToEmoji` → store in MongoDB. Authentication obtains a token
via Google OAuth, and the server manages the session with JWT.

### Main API routes

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/google` | Google OAuth sign-in |
| `GET` | `/api/auth/verify` | Verify token |
| `POST` | `/api/auth/logout` | Sign out |
| `POST` `GET` `PUT` `DELETE` | `/api/diary` `…/:id` | Diary CRUD |
| `GET` `POST` | `/api/diary/:id/comments` | List/create comments |
| `POST` | `/api/diary/:id/ai-feedback` | Generate AI feedback |
| `GET` | `/api/emotions/analysis` · `/api/emotions/stats` | Emotion analysis / statistics |
| `GET` | `/api/share/:token` | View a shared entry |
| `GET` | `/api/health` | Health check |
| — | `/api-docs` | Swagger UI |

## 🚀 Getting started

### Prerequisites
- Node.js (18+ recommended)
- A MongoDB instance (local or Atlas)
- An OpenAI API key and a Google OAuth client

### Environment variables

**Server** (`mood-journal-app/server/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `OPENAI_API_KEY` | ✅ | OpenAI API key (titles/emoji/feedback/emotion analysis) |
| `JWT_SECRET` | ✅ | JWT signing secret |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth client secret |
| `ALLOWED_ORIGINS` | optional | Additional allowed origins (comma separated) |
| `PORT` | optional | Server port (default `5000`) |

**Client** (`mood-journal-app/client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

### Install and run

```bash
# 1) server
cd mood-journal-app/server
npm install
npm run dev            # nodemon (development), default port 5000
# npm run build && npm start   # production build/run

# 2) client (new terminal)
cd mood-journal-app/client
npm install
npm run dev            # vite --host, default port 5173
npm run build          # tsc -b && vite build
```

### Mobile (Android) build

Uses `capacitor.config.ts` at the root (webDir: `client/dist`).

```bash
cd mood-journal-app
npm install
# after building the client
npx cap add android
npx cap sync
```

## 📁 Structure

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
│  │  ├─ server.ts         # app entry, CORS, route mounting
│  │  ├─ authRoutes.ts     # Google OAuth, JWT
│  │  └─ routes/           # diary / comment / emotion / aiFeedback / share
│  ├─ models/              # DiaryEntry, Comment, EmotionAnalysis, User (Mongoose)
│  └─ utils/               # summaryUtils (OpenAI), emotionAnalysis, oauthUtils …
└─ capacitor.config.ts     # Capacitor (Android) configuration
```

---

> AI summarization and emotion analysis run through the OpenAI API and require a valid `OPENAI_API_KEY`.

---

## 👤 Contribution & development environment

| Item | Detail |
|---|---|
| **Contribution share** | **100%** (solo development) |
| **Commits** | 93 / 93 (mine / all human commits) |
| **Contributors** | 1 |

<sub>Contribution share is counted by commit author email; bot and automation commits are excluded.</sub>
