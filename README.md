# 🏰 English Explorer Kids

A magical, AI-powered web application designed to help children explore the wonders of the English language.

![Status](https://img.shields.io/badge/Status-Active-success)
![Tech](https://img.shields.io/badge/Tech-React%20%7C%20TypeScript%20%7C%20Gemini%20AI-blue)

## ✨ Features

### Core Learning
- **🪄 Magic Analysis**: Instantly analyzes English sentences via AI.
- **🇨🇳 Translation**: Provides natural, child-friendly Chinese translations.
- **⭐ Cool Phrases**: Identifies idioms, collocations, and phrases.
- **📖 Grammar Check**: Explains grammar rules in simple terms.
- **🎯 Quiz Mode**: AI-generated 5-question quiz based on the analyzed text, with instant scoring and explanations.

### Study Tools
- **🔊 Read Aloud**: Text-to-speech (Web Speech API) for the original text and every phrase — great for listening and repeating.
- **🎤 Voice Input**: Speak in English to fill the input box (Chrome / Edge).
- **📖 History**: All past analyses are saved locally and can be reopened anytime.
- **⭐ Vocabulary Book**: Star any phrase to save it, review saved words with pronunciation support.

### Platform
- **🖨️ Export**: Download analysis as TXT or a beautiful PDF.
- **📱 PWA**: Installable on phone/desktop, works offline for cached pages.
- **🔒 Secure API Key**: Gemini key lives on the server side only, never exposed to the browser.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript |
| Styling | Tailwind CSS (proper PostCSS build) |
| Backend API | Node.js + Express (`server/index.js`) |
| AI Engine | Google Gemini API (`gemini-2.0-flash`) |
| Speech | Web Speech API (TTS + SpeechRecognition) |
| PDF Generation | `html2pdf.js` |
| PWA | manifest.json + Service Worker |
| Build Tool | Vite |

## 🏗️ Architecture

```
Browser (React SPA)
    │
    ├─ /api/analyze ──► Express Server ──► Google Gemini
    │                    (holds API_KEY)
    └─ /api/quiz ─────►
```

The Express server acts as a secure proxy: it reads `GEMINI_API_KEY` from environment variables at runtime and forwards requests to Gemini. In development, Vite proxies `/api` to the server. In production, the same server serves both the static build and the API.

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+)
- A Google Gemini API Key — get it [here](https://aistudio.google.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sangyan123/english-study.git
   cd english-study
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Add your API key:
     ```env
     GEMINI_API_KEY=your_actual_api_key_here
     ```

4. **Run the app**
   ```bash
   npm run dev
   ```
   This starts both:
   - API server → `http://localhost:3002`
   - Vite dev client → `http://localhost:3000` (auto-opens browser)

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API server + Vite dev client together |
| `npm run build` | Type-check (tsc) + production build to `dist/` |
| `npm start` | Serve production build + API on one port |

## 📦 Production

```bash
npm run build
npm start
```

The Express server will serve the `dist/` folder and handle API routes on the same port (default `3002`, configurable via `PORT`).

### Deploying to a Node host (Render / Railway / Fly.io)

1. Set `GEMINI_API_KEY` in the host's environment variables.
2. Build command: `npm run build`
3. Start command: `npm start`

### Deploying frontend-only to Vercel / Netlify

⚠️ **Not recommended** — a static-only deployment still needs the API proxy. Use a serverless function or a Node host as above to keep your API key safe.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
