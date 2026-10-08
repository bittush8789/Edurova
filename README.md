# Edurova

> **Turn Any YouTube Video Into AI-Powered Knowledge.**

An AI-powered YouTube learning assistant built with Next.js, Groq, and Tailwind CSS.

---

## Features

- 🎬 **YouTube URL Input** — Paste any YouTube link and analyze it in seconds
- ⚡ **AI Summary** — Short overview + detailed breakdown of the full video
- ✅ **Key Takeaways** — Bullet-point highlights of the most important points
- 🧠 **Important Concepts** — Key terms and ideas extracted from the video
- 📚 **Auto Chapters** — AI-generated chapters with timestamps (click to open on YouTube)
- 💬 **Chat With Video** — Ask anything; answers are grounded in the transcript
- 📝 **Transcript Viewer** — Full transcript with search/highlight
- 📄 **PDF Export** — Download clean, formatted study notes

---

## Tech Stack

| Layer     | Technology                       |
|-----------|----------------------------------|
| Framework | Next.js 16 (App Router)          |
| Language  | TypeScript                       |
| Styling   | Tailwind CSS v4                  |
| AI        | Groq API (llama-3.3-70b)         |
| Transcript| youtube-transcript               |
| PDF       | PDFKit                           |

---

## Quick Start

### 1. Get a Groq API Key
Sign up at [console.groq.com](https://console.groq.com) — it's free.

### 2. Add your API key
Edit `.env.local`:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Install & run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
app/
  layout.tsx            Root layout
  page.tsx              Entry point (toggles Home ↔ Analysis)
  globals.css           Global styles + Tailwind v4 theme
  api/
    analyze/route.ts    Video info + transcript + AI analysis
    chat/route.ts       Streaming chat with transcript context
    export-pdf/route.ts PDF generation endpoint

components/
  HomePage.tsx          Landing page with URL input
  AnalysisPage.tsx      Video analysis with tab navigation
  tabs/
    OverviewTab.tsx     Summary, takeaways, concepts
    ChaptersTab.tsx     Chapter timeline
    TranscriptTab.tsx   Searchable transcript
    ChatTab.tsx         Chat interface with streaming

lib/
  youtube.ts            YouTube utilities (URL parsing, transcript, oEmbed)
  groq.ts               Groq AI client (analysis + chat)
  pdf.ts                PDFKit PDF generator

types/
  index.ts              Shared TypeScript types
```

---

## Environment Variables

| Variable       | Required | Description                    |
|----------------|----------|--------------------------------|
| `GROQ_API_KEY` | ✅ Yes   | Your Groq API key              |

---

## Notes

- Transcripts must be available on the YouTube video (auto-generated or manual captions)
- Chat answers are grounded in the transcript — if info isn't in the video, the AI says so
- The PDF includes video info, all summaries, chapters, and optionally your Q&A history
