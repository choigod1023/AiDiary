# AiDiary — AI 感情日記 (MoodJournal)

[한국어](README.md) · **日本語** · [English](README.en.md)

> AI があなたの日記を要約し、感情の状態を絵文字で表現します。

日記を書くと OpenAI が **ウィットの効いた一行タイトル** を自動でつけ、文章に込められた **感情を絵文字に変換** し、
**優しい友人からの一言** フィードバックまで残してくれる感情日記の Web／モバイルアプリです。蓄積された日記の感情を
分析して比率・推移をチャートで表示し、自分の心の流れを一目で振り返れるようにします。

🔗 **ライブデモ: [ai-diary-eight-drab.vercel.app](https://ai-diary-eight-drab.vercel.app)**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white)

---

## ✨ 主な機能

- **AI タイトル要約** — 日記の内容を GPT-4o-mini が 10 文字前後のユーモラスな一行タイトルに要約（手入力も選択可能）
- **感情 → 絵文字への変換** — 文章の感情を分析し、1〜2 個の絵文字で表現
- **AI フィードバック** — 優しい友人が語りかけるような一段落（200 字以内）の温かいコメントを生成（`POST /api/diary/:id/ai-feedback`）
- **感情分析 & 統計** — GPT-3.5-turbo で日記の感情比率（JSON）を算出し、蓄積データを平均・推移として集計
- **感情チャート** — Chart.js による感情比率／推移の可視化（`EmotionChart`, `StatsChart`）
- **Google OAuth ログイン** — Google アカウントログイン + JWT トークン認証、保護ルート（`ProtectedRoute`）
- **日記の共有** — 公開／非公開／リンク共有（`shareToken`）の設定、共有リンクからの閲覧（`GET /api/share/:token`）、コメント機能
- **レスポンシブ UI** — デスクトップ／モバイルでレイアウトを分岐（`HomeDesktop` / `HomeMobile`, `useResponsive`）
- **ダークモード** — ライト／ダーク／システムテーマに対応（システム設定を自動検出）
- **PWA** — `vite-plugin-pwa` + Service Worker + manifest でインストール可能なアプリに対応（`PWAInstallPrompt`）
- **モバイルアプリのパッケージング** — Capacitor による Android アプリのビルド（`appId: com.moodjournal.app`）

## 🛠 技術スタック

**Client**（`mood-journal-app/client`）
- React 19 · Vite 6 · TypeScript
- Tailwind CSS 3 · React Router 7
- TanStack Query 5（サーバー状態）· ky（HTTP）
- Chart.js · react-chartjs-2 · chartjs-plugin-datalabels
- `@react-oauth/google` · ts-pattern
- vite-plugin-pwa · workbox-window · Capacitor

**Server**（`mood-journal-app/server`）
- Node.js · Express 4 · TypeScript
- MongoDB · Mongoose 8
- OpenAI SDK（`gpt-4o-mini`, `gpt-3.5-turbo`）
- JWT（`jsonwebtoken`）· `google-auth-library`（Google OAuth）
- Swagger（`swagger-jsdoc`, `swagger-ui-express`）— `/api-docs`

## 🏗 動作の仕組み / アーキテクチャ

`client`（Vite SPA）と `server`（Express API）で構成されたモノレポで、いずれも Vercel にデプロイされます。

```
[ユーザー] → React SPA(client)
             │  ky (VITE_API_URL)
             ▼
        Express API(server)  ──▶  MongoDB (Mongoose)
             │
             └──▶ OpenAI  (タイトル要約・絵文字変換・AI フィードバック・感情分析)
```

日記の保存フロー: `POST /api/diary` →（`useAITitle` の場合）`summarizeTitle` でタイトル生成 →
`convertEmotionToEmoji` で感情絵文字を生成 → MongoDB に保存。認証は Google OAuth でトークンを受け取り、
サーバーが JWT でセッションを管理します。

### 主な API ルート

| Method | Path | 説明 |
|---|---|---|
| `POST` | `/api/auth/google` | Google OAuth ログイン |
| `GET` | `/api/auth/verify` | トークン検証 |
| `POST` | `/api/auth/logout` | ログアウト |
| `POST` `GET` `PUT` `DELETE` | `/api/diary` `…/:id` | 日記の CRUD |
| `GET` `POST` | `/api/diary/:id/comments` | コメントの取得／作成 |
| `POST` | `/api/diary/:id/ai-feedback` | AI フィードバックの生成 |
| `GET` | `/api/emotions/analysis` · `/api/emotions/stats` | 感情の分析／統計 |
| `GET` | `/api/share/:token` | 共有リンクからの日記閲覧 |
| `GET` | `/api/health` | ヘルスチェック |
| — | `/api-docs` | Swagger UI |

## 🚀 はじめかた

### 前提条件
- Node.js（18+ 推奨）
- MongoDB インスタンス（ローカルまたは Atlas）
- OpenAI API キー、Google OAuth クライアント

### 環境変数

**Server**（`mood-journal-app/server/.env`）

| 変数 | 必須 | 説明 |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB 接続文字列 |
| `OPENAI_API_KEY` | ✅ | OpenAI API キー（タイトル/絵文字/フィードバック/感情分析） |
| `JWT_SECRET` | ✅ | JWT 署名用シークレット |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth クライアント ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth クライアントシークレット |
| `ALLOWED_ORIGINS` | 任意 | 許可 Origin の追加（カンマ区切り） |
| `PORT` | 任意 | サーバーポート（デフォルト `5000`） |

**Client**（`mood-journal-app/client/.env`）

| 変数 | 説明 |
|---|---|
| `VITE_API_URL` | バックエンド API のベース URL |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth クライアント ID |

### インストールと実行

```bash
# 1) サーバー
cd mood-journal-app/server
npm install
npm run dev            # nodemon（開発）、デフォルトポート 5000
# npm run build && npm start   # 本番ビルド／実行

# 2) クライアント（別ターミナル）
cd mood-journal-app/client
npm install
npm run dev            # vite --host、デフォルトポート 5173
npm run build          # tsc -b && vite build
```

### モバイル（Android）ビルド

ルートの `capacitor.config.ts`（webDir: `client/dist`）を使用します。

```bash
cd mood-journal-app
npm install
# client のビルド後
npx cap add android
npx cap sync
```

## 📁 構成

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
│  │  ├─ server.ts         # アプリのエントリ・CORS・ルートのマウント
│  │  ├─ authRoutes.ts     # Google OAuth・JWT
│  │  └─ routes/           # diary / comment / emotion / aiFeedback / share
│  ├─ models/              # DiaryEntry, Comment, EmotionAnalysis, User (Mongoose)
│  └─ utils/               # summaryUtils(OpenAI), emotionAnalysis, oauthUtils …
└─ capacitor.config.ts     # Capacitor (Android) の設定
```

---

> AI による要約・感情分析は OpenAI API を通じて行われ、有効な `OPENAI_API_KEY` が必要です。

---

## 👤 コントリビューションと開発環境

| 項目 | 内容 |
|---|---|
| **貢献比率** | **100%**（単独開発） |
| **コミット** | 93 / 93（本人 / 全人力コミット） |
| **参加人数** | 1 名 |

<sub>貢献比率はコミットの author メールアドレス基準で集計し、ボット・自動化コミットは除外しています。</sub>
