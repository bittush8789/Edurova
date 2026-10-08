# Edurova (VideoMind AI) 🧠⚡

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Groq](https://img.shields.io/badge/Groq_Cloud-Ultra_Fast_AI-F55036?style=for-the-badge&logo=groq)

**Transform any YouTube video into structured, AI-powered study guides, interactive quizzes, flashcards, and chat knowledge in seconds.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Environment Variables](#-environment-variables) • [API Reference](#-api-reference) • [Project Structure](#-project-structure)

</div>

---

## 📖 Overview

**Edurova** solves the problem of passive video watching. Students, engineers, and lifelong learners spend hours on lengthy video lectures without retaining key details. Edurova extracts transcripts from any YouTube video and leverages high-speed LLMs via Groq Cloud to deliver:
- Instant synthesized executive summaries & key concepts
- Interactive timestamped chapters
- Transcript-grounded contextual chat
- Self-assessment flashcards and dynamic MCQ quizzes
- Formatted, publication-grade PDF study guides
- Instant access without login or authentication (local browser storage for saved study library)

---

## ✨ Features

| Feature | Description |
| :--- | :--- |
| 🎬 **Universal YouTube Parsing** | Supports standard URLs, `youtu.be` short links, and YouTube Shorts. |
| ⚡ **AI Synthesis & Insights** | Generates high-level overviews, key takeaways, and technical glossaries in seconds. |
| ⏱️ **Timestamped Chapters** | AI-segmented breakdown with direct YouTube timestamp jump links. |
| 💬 **Transcript-Grounded Chat** | Ask detailed follow-up questions; answers are strictly grounded in video transcripts with citations. |
| 🗂️ **Study Suite (Flashcards & Quizzes)**| Practice active recall with interactive flashcards and AI-generated multi-choice quizzes. |
| 📝 **Personal Note-Taking & Library** | Save custom notes and access your historical learning library across sessions (stored locally). |
| 📄 **PDF Study Guide Export** | Generates clean, downloadable PDF documentation using PDFKit. |
| 🚀 **Zero Login Required** | Instant access for everyone without needing sign up or login accounts. |

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS
- **AI Engine**: [Groq Cloud SDK](https://console.groq.com) (Default: `openai/gpt-oss-120b` or `llama-3.3-70b-versatile`)
- **Captions & Extraction**: `youtube-transcript` + YouTube oEmbed API
- **Document Engine**: [PDFKit](https://pdfkit.org/)
- **Storage**: Local browser storage for study library notes

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.18.0 or later (v20+ recommended)
- **npm** or **pnpm** / **yarn**
- A free **[Groq Cloud API Key](https://console.groq.com)**

### 1. Clone the Repository
```bash
git clone https://github.com/bittush8789/Edurova.git
cd Edurova
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env.local
```

Populate the required credentials in `.env.local`:
```env
# Groq AI
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

### 4. Run Development Server
```bash
npm run dev
```

Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## ⚙️ Environment Variables

| Variable | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `GROQ_API_KEY` | Server | **Yes** | API key from Groq Console. |
| `GROQ_MODEL` | Server | No | Target model (Defaults to `openai/gpt-oss-120b`). |

---

## 📡 API Reference

### 1. Video Analysis
- **Route**: `POST /api/analyze`
- **Body**:
  ```json
  {
    "url": "https://www.youtube.com/watch?v=VIDEO_ID"
  }
  ```

### 2. Contextual Chat
- **Route**: `POST /api/chat`
- **Body**:
  ```json
  {
    "message": "Explain the concept introduced at 03:45",
    "history": [],
    "transcript": "Full video transcript...",
    "videoTitle": "Video Title"
  }
  ```

### 3. Quiz & Flashcards Generator
- **Route**: `POST /api/generate-quiz`
- **Body**:
  ```json
  {
    "transcript": "Full video transcript...",
    "videoTitle": "Video Title"
  }
  ```

### 4. PDF Study Guide Export
- **Route**: `POST /api/export-pdf`
- **Body**:
  ```json
  {
    "videoInfo": { ... },
    "analysis": { ... }
  }
  ```

---

## 📂 Project Structure

```text
edurova/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts       # Video transcript parsing & AI synthesis
│   │   ├── chat/route.ts          # Video-grounded chat endpoint
│   │   ├── export-pdf/route.ts    # PDFKit PDF builder service
│   │   └── generate-quiz/route.ts # Dynamic quiz generation
│   ├── app/page.tsx               # Main application workspace
│   ├── dashboard/page.tsx         # User saved library & activity dashboard
│   ├── globals.css                # Tailwind CSS v4 design tokens & themes
│   └── layout.tsx                 # Root layout
├── components/
│   ├── AnalysisPage.tsx           # Video player, study tabs & action header
│   ├── HomePage.tsx               # Hero landing page & quick URL input
│   ├── LibraryModal.tsx           # Saved notes & session manager
│   └── tabs/
│       ├── ChaptersTab.tsx        # Interactive chapter timeline
│       ├── ChatTab.tsx            # Video conversational assistant
│       ├── OverviewTab.tsx        # Summary, key takeaways & concepts
│       ├── StudyTab.tsx           # Flashcard carousel, quiz engine & notes
│       └── TranscriptTab.tsx      # Filterable & searchable full transcript
├── lib/
│   ├── groq.ts                    # Groq SDK completions & structured prompts
│   ├── markdown.ts                # Lightweight markdown formatter
│   ├── pdf.ts                     # PDFKit document generator layout
│   ├── savedNotes.ts              # LocalStorage & library synchronization
│   └── youtube.ts                 # URL parser, oEmbed & caption extractor
└── types/
    └── index.ts                   # Core TypeScript interfaces & types
```

---

## 💻 Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **Dev** | `npm run dev` | Starts local Next.js dev server with Turbopack on port `3000`. |
| **Build** | `npm run build` | Compiles and optimizes production Next.js bundle. |
| **Start** | `npm run start` | Runs the compiled production application. |
| **Lint** | `npm run lint` | Runs ESLint 9 checks across all source code. |

---

## 💡 Troubleshooting & FAQs

<details>
<summary><b>Why am I getting "Transcript not found or captions disabled"?</b></summary>
The YouTube video must have closed captions enabled (either creator-uploaded captions or auto-generated English captions). Private videos or videos with captions explicitly disabled cannot be transcribed.
</details>

<details>
<summary><b>How do I switch the Groq model?</b></summary>
Set the <code>GROQ_MODEL</code> environment variable in your <code>.env.local</code>. For example:
<pre>GROQ_MODEL=llama-3.3-70b-versatile</pre>
</details>

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
