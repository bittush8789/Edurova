"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "@/components/auth/UserMenu";

const WORKFLOW_STEPS = [
  {
    number: "01",
    title: "Paste",
    desc: "Paste any YouTube video URL into VideoMind AI.",
    icon: "🔗",
  },
  {
    number: "02",
    title: "Analyze",
    desc: "VideoMind AI reads and processes the video transcript in seconds.",
    icon: "⚡",
  },
  {
    number: "03",
    title: "Understand",
    desc: "Get summaries, auto-generated chapters, flashcards, and ask questions interactively.",
    icon: "🧠",
  },
  {
    number: "04",
    title: "Export",
    desc: "Download your AI-generated notes and insights as a clean PDF or Markdown.",
    icon: "📥",
  },
];

const FEATURES_LIST = [
  {
    id: "summary",
    title: "AI Summary",
    desc: "Understand long videos quickly with AI-generated summaries.",
    badge: "Instant Insights",
    icon: (
      <svg className="w-5 h-5 text-[#00F59B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    id: "chat",
    title: "Video Q&A",
    desc: "Ask questions and chat with the content of the video.",
    badge: "Interactive",
    icon: (
      <svg className="w-5 h-5 text-[#00F59B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    id: "quiz",
    title: "Quiz & Flashcards",
    desc: "Active recall flashcards and interactive quizzes with step-by-step explanations.",
    badge: "Active Learning",
    icon: (
      <svg className="w-5 h-5 text-[#00F59B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
  },
  {
    id: "chapters",
    title: "Smart Chapters",
    desc: "Automatically identify important sections of the video.",
    badge: "Time-Stamped",
    icon: (
      <svg className="w-5 h-5 text-[#00F59B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "transcript",
    title: "Transcript",
    desc: "Read and search the video's transcript.",
    badge: "Searchable",
    icon: (
      <svg className="w-5 h-5 text-[#00F59B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: "export",
    title: "PDF Export",
    desc: "Export your generated notes and insights as a clean PDF or Markdown.",
    badge: "Print & Share",
    icon: (
      <svg className="w-5 h-5 text-[#00F59B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
];

const USE_CASES = [
  {
    role: "Students",
    title: "Structured Study Notes",
    desc: "Turn educational videos into structured study notes and flashcards.",
    tag: "Lectures & Courses",
    icon: "🎓",
  },
  {
    role: "Developers",
    title: "Fast Technical Understanding",
    desc: "Understand long technical tutorials faster with code concepts and Q&A.",
    tag: "Coding & Docs",
    icon: "💻",
  },
  {
    role: "Researchers",
    title: "Deep Information Extraction",
    desc: "Extract important facts, arguments, and takeaways from lengthy videos.",
    tag: "Key Data & Claims",
    icon: "🔬",
  },
  {
    role: "Professionals",
    title: "High-Efficiency Learning",
    desc: "Save time when consuming educational, conference, and business content.",
    tag: "Talks & Podcasts",
    icon: "💼",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activePreviewTab, setActivePreviewTab] = useState<"summary" | "chapters" | "chat" | "pdf">("summary");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleStartApp = () => {
    if (user) {
      router.push("/app");
    } else {
      router.push("/login?redirect=/app");
    }
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-slate-100 flex flex-col selection:bg-[#00F59B] selection:text-black">
      {/* ─── 1. Navbar ─── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#06070a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center text-[#00F59B] green-glow-subtle group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </div>
            <span className="text-white font-extrabold text-xl tracking-tight">
              VideoMind <span className="text-[#00F59B]">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#use-cases" className="hover:text-white transition-colors">
              Use Cases
            </a>
          </nav>

          {/* Desktop Auth & CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <UserMenu />
                <button
                  onClick={handleStartApp}
                  className="btn-primary text-xs sm:text-sm py-2 px-4.5"
                >
                  Open VideoMind AI
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login?redirect=/app"
                  className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
                >
                  Log In
                </Link>
                <button
                  onClick={handleStartApp}
                  className="btn-primary text-xs sm:text-sm py-2 px-4.5"
                >
                  Try VideoMind AI
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user && <UserMenu />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-white p-2"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/5 bg-[#0a0c10] px-6 py-4 flex flex-col gap-4 text-sm animate-fade-in">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-[#00F59B]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-[#00F59B]"
            >
              How It Works
            </a>
            <a
              href="#use-cases"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-[#00F59B]"
            >
              Use Cases
            </a>

            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleStartApp();
                }}
                className="btn-primary w-full text-center py-2.5 text-xs font-bold"
              >
                Open VideoMind AI
              </button>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                <Link
                  href="/login?redirect=/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-medium text-slate-300 bg-white/5 rounded-xl border border-white/10"
                >
                  Log In
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleStartApp();
                  }}
                  className="btn-primary w-full text-center py-2.5 text-xs font-bold"
                >
                  Try VideoMind AI
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ─── 2. Hero Section ─── */}
      <section className="relative hero-bg subtle-grid pt-16 md:pt-24 pb-20 px-4 md:px-8 overflow-hidden">
        {/* Glow ambient background lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#00F59B]/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Green Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#00F59B]/30 bg-[#00F59B]/5 text-[#00F59B] text-xs font-semibold mb-8 animate-fade-in">
            <span className="pulse-dot" />
            <span>AI-Powered YouTube Learning Assistant</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-4xl mb-6">
            Turn Any YouTube Video Into{" "}
            <span className="bg-gradient-to-r from-white via-slate-100 to-[#00F59B] bg-clip-text text-transparent">
              AI-Powered Knowledge
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed font-normal">
            Understand long tutorials, lectures, and podcasts in minutes with AI summaries, smart chapters, interactive Q&A, and downloadable notes.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto mb-10">
            <button
              onClick={handleStartApp}
              className="btn-primary w-full sm:w-auto text-sm sm:text-base py-4 px-8 font-bold flex items-center justify-center gap-2.5 shadow-xl shadow-[#00F59B]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{user ? "Open VideoMind AI" : "Try VideoMind AI"}</span>
              <span className="text-lg">⚡</span>
            </button>
            <button
              onClick={handleStartApp}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Analyze Your First Video</span>
              <span>→</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="text-[#00F59B]">✓</span> Free to get started
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#00F59B]">✓</span> Works with any captioned video
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#00F59B]">✓</span> Instant PDF & Markdown export
            </span>
          </div>
        </div>
      </section>

      {/* ─── 3. Product Preview Section ─── */}
      <section className="px-4 md:px-8 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 mb-3">
            <span>✨</span> Product Interface Preview
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            The Entire Video Workspace in One View
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl mx-auto">
            From raw YouTube video to structured summaries, chapters, interactive Q&A, and PDF notes.
          </p>
        </div>

        {/* Dashboard Mockup Container */}
        <div className="saas-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
          {/* Mock Window Top Bar */}
          <div className="bg-[#0b0e14] px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-3 text-xs text-slate-500 font-mono hidden sm:inline">
                https://videomind.ai/analysis?v=UF8uR6Z6KLc
              </span>
            </div>

            {/* Quick Export mockup button */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-[#00F59B]/10 border border-[#00F59B]/20 text-[#00F59B] text-xs font-medium flex items-center gap-1.5">
                <span>📄</span> Export PDF Ready
              </span>
            </div>
          </div>

          {/* Mock Video Info Banner */}
          <div className="p-6 border-b border-white/5 bg-[#090b10] flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-12 rounded-lg bg-surface-400 border border-white/10 flex items-center justify-center text-xl flex-shrink-0 text-red-500">
                ▶
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-snug line-clamp-1">
                  Neural Networks & Deep Learning Explained for Beginners
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>3Blue1Brown</span>
                  <span>•</span>
                  <span>19:13</span>
                  <span>•</span>
                  <span className="text-[#00F59B]">Subtitles Verified</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartApp}
              className="btn-primary text-xs py-2 px-4 whitespace-nowrap self-stretch md:self-auto"
            >
              Try With Your Video →
            </button>
          </div>

          {/* Mock Interactive Tabs */}
          <div className="border-b border-white/5 bg-[#090b10] px-6 flex gap-2 overflow-x-auto scrollbar-hide">
            {(
              [
                { id: "summary", label: "Summary", icon: "⚡" },
                { id: "chapters", label: "Chapters", icon: "⏱️" },
                { id: "chat", label: "Video Q&A", icon: "💬" },
                { id: "pdf", label: "PDF Notes", icon: "📄" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePreviewTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-medium transition-all ${
                  activePreviewTab === tab.id
                    ? "border-[#00F59B] text-[#00F59B]"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Mock Tab Body */}
          <div className="p-6 md:p-8 bg-[#06070a]/60 min-h-[300px]">
            {activePreviewTab === "summary" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[#00F59B] font-bold mb-2">
                    Executive Summary
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    This video introduces artificial neural networks from first principles. It explains how multi-layer perceptrons compute activations through linear weights and biases, followed by non-linear sigmoid activation functions to recognize handwritten digits.
                  </p>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
                    Key Takeaways
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {[
                      "Neurons hold a number between 0 and 1 called an activation value.",
                      "Weights determine the importance of connections between layers.",
                      "Biases act as thresholds controlling when a neuron lights up.",
                      "Matrix operations allow computing entire layers in parallel.",
                    ].map((takeaway, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white/3 border border-white/5 text-slate-300 flex items-start gap-2.5"
                      >
                        <span className="text-[#00F59B] font-bold">0{i + 1}</span>
                        <span>{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === "chapters" && (
              <div className="space-y-3 animate-fade-in">
                {[
                  { time: "00:00", title: "Introduction & Motivation", desc: "Why computer vision is hard." },
                  { time: "03:12", title: "Structure of a Single Neuron", desc: "Understanding activations and layers." },
                  { time: "07:45", title: "Weights & Connections", desc: "Recognizing component strokes of numbers." },
                  { time: "13:20", title: "Biases & Activation Functions", desc: "Setting activation thresholds." },
                ].map((ch, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between text-xs hover:border-[#00F59B]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-[#00F59B]/10 text-[#00F59B] font-mono font-bold">
                        {ch.time}
                      </span>
                      <div>
                        <div className="text-white font-medium">{ch.title}</div>
                        <div className="text-slate-400 text-[11px]">{ch.desc}</div>
                      </div>
                    </div>
                    <span className="text-slate-500 hover:text-white transition-colors">▶ Jump</span>
                  </div>
                ))}
              </div>
            )}

            {activePreviewTab === "chat" && (
              <div className="space-y-3 animate-fade-in text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 max-w-md ml-auto text-slate-200">
                  What is the role of a bias in neural networks according to this video?
                </div>
                <div className="p-3.5 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/20 max-w-lg text-slate-200 space-y-1.5 green-glow-subtle">
                  <div className="text-[#00F59B] font-bold flex items-center gap-1.5">
                    <span>🎬</span> VideoMind AI Answer
                  </div>
                  <p className="leading-relaxed">
                    According to the video at [13:20], a bias is an extra number added to the weighted sum before applying the activation function. It acts as a threshold telling the neuron how high the weighted sum needs to be before it meaningfully activates.
                  </p>
                </div>
              </div>
            )}

            {activePreviewTab === "pdf" && (
              <div className="text-center py-8 space-y-3 animate-fade-in">
                <div className="text-4xl">📄</div>
                <h4 className="text-white font-bold text-sm">Downloadable Comprehensive Study Notes</h4>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  Export complete summaries, key takeaways, chapter lists, and chat history formatted into a printable PDF document.
                </p>
                <button
                  onClick={handleStartApp}
                  className="btn-primary text-xs py-2 px-4 mt-2"
                >
                  Generate for Any Video →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 4. Features Section ─── */}
      <section id="features" className="px-4 md:px-8 py-20 max-w-6xl mx-auto w-full border-t border-white/5">
        <div className="text-center mb-14">
          <div className="text-[#00F59B] text-xs font-bold tracking-widest uppercase mb-2">
            Core Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered For Frictionless Video Learning
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
            Everything you need to digest hours of video in a fraction of the time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES_LIST.map((feat) => (
            <div
              key={feat.id}
              className="saas-card p-6 flex flex-col justify-between gap-4 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/20 flex items-center justify-center">
                    {feat.icon}
                  </div>
                  <span className="text-[11px] font-mono text-[#00F59B] bg-[#00F59B]/10 px-2 py-0.5 rounded-full border border-[#00F59B]/20">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-white font-bold text-base mb-2 group-hover:text-[#00F59B] transition-colors">
                  {feat.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. How It Works Section ─── */}
      <section id="how-it-works" className="px-4 md:px-8 py-20 max-w-6xl mx-auto w-full border-t border-white/5">
        <div className="text-center mb-14">
          <div className="text-[#00F59B] text-xs font-bold tracking-widest uppercase mb-2">
            Step-by-Step Flow
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How VideoMind AI Works
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            Four simple steps from YouTube link to mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WORKFLOW_STEPS.map((step) => (
            <div
              key={step.number}
              className="saas-card p-6 flex flex-col justify-between gap-4 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{step.icon}</span>
                <span className="font-mono text-2xl font-black text-white/10 group-hover:text-[#00F59B]/40 transition-colors">
                  {step.number}
                </span>
              </div>
              <div>
                <h3 className="text-white font-bold text-base mb-1">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 6. Use Cases Section ─── */}
      <section id="use-cases" className="px-4 md:px-8 py-20 max-w-6xl mx-auto w-full border-t border-white/5">
        <div className="text-center mb-14">
          <div className="text-[#00F59B] text-xs font-bold tracking-widest uppercase mb-2">
            Target Audience
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built For People Who Value Time
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            Discover how VideoMind AI streamlines learning across diverse workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {USE_CASES.map((uc) => (
            <div
              key={uc.role}
              className="saas-card p-6 flex flex-col justify-between gap-4 group"
            >
              <div>
                <div className="text-3xl mb-3">{uc.icon}</div>
                <div className="text-xs uppercase font-mono font-semibold text-[#00F59B] mb-1">
                  {uc.role}
                </div>
                <h3 className="text-white font-bold text-base mb-2 group-hover:text-[#00F59B] transition-colors">
                  {uc.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {uc.desc}
                </p>
              </div>

              <span className="text-[11px] text-slate-500 bg-white/5 px-2.5 py-1 rounded w-fit">
                {uc.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 7. Final CTA Section ─── */}
      <section className="px-4 md:px-8 py-24 max-w-5xl mx-auto w-full text-center relative">
        <div className="absolute inset-0 bg-radial from-[#00F59B]/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="saas-card p-10 md:p-16 rounded-3xl border border-[#00F59B]/25 relative z-10 green-glow-subtle">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4 max-w-2xl mx-auto">
            Your next video shouldn&apos;t take hours to understand.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-8 font-normal">
            Paste a YouTube link and let VideoMind AI turn it into clear, useful knowledge.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartApp}
              className="btn-primary text-sm sm:text-base py-4 px-8 font-bold"
            >
              {user ? "Open VideoMind AI" : "Try VideoMind AI"}
            </button>
            <button
              onClick={handleStartApp}
              className="px-7 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold border border-white/10 hover:border-white/20 transition-all"
            >
              Analyze Your First Video
            </button>
          </div>
        </div>
      </section>

      {/* ─── 8. Minimal Footer ─── */}
      <footer className="border-t border-white/5 py-12 px-6 bg-[#040507]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-white font-bold text-lg">
              VideoMind <span className="text-[#00F59B]">AI</span>
            </span>
            <span className="text-xs text-slate-500 mt-1">
              Turn Any YouTube Video Into AI-Powered Knowledge.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#use-cases" className="hover:text-white transition-colors">
              Use Cases
            </a>
          </div>

          <div className="text-xs text-slate-600">
            © 2026 VideoMind AI
          </div>
        </div>
      </footer>
    </div>
  );
}
