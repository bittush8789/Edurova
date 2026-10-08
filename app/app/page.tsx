"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "@/components/auth/UserMenu";
import AnalysisPage from "@/components/AnalysisPage";
import LibraryModal from "@/components/LibraryModal";
import type { AnalyzeResponse, SavedNote } from "@/types";
import { getSavedNotesFromLibrary } from "@/lib/savedNotes";

const LOADING_STEPS = [
  "Fetching video captions...",
  "Reading transcript...",
  "Generating AI analysis & chapters...",
  "Structuring study notes...",
];

export default function AppPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [analysisData, setAnalysisData] = useState<AnalyzeResponse | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState("");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [recentNotes, setRecentNotes] = useState<SavedNote[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Direct Route Protection ───
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/app");
    }
  }, [authLoading, user, router]);

  // Load recent library items for quick access
  useEffect(() => {
    if (user) {
      getSavedNotesFromLibrary(user.uid)
        .then((notes) => setRecentNotes(notes.slice(0, 3)))
        .catch(() => {});
    }
  }, [user]);

  // Loading screen while verifying auth session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#06070a] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center text-[#00F59B] text-xl green-glow-subtle animate-pulse">
          🎬
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <svg className="w-4 h-4 animate-spin text-[#00F59B]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span>Loading VideoMind AI...</span>
        </div>
      </div>
    );
  }

  // Not authenticated — redirection will occur
  if (!user) {
    return null;
  }

  // ─── If video is analyzed, show Analysis Page ───
  if (analysisData) {
    return (
      <AnalysisPage
        data={analysisData}
        onReset={() => setAnalysisData(null)}
        onSelectSavedNote={(note) => {
          setAnalysisData({
            videoInfo: note.videoInfo,
            transcript: note.transcript,
            analysis: note.analysis,
            rawTranscript: note.rawTranscript,
          });
        }}
      />
    );
  }

  const handleAnalyze = async (e?: React.FormEvent, customUrl?: string) => {
    if (e) e.preventDefault();
    const targetUrl = (customUrl ?? url).trim();

    if (!targetUrl) {
      setError("Please paste a YouTube video URL to begin.");
      return;
    }

    setLoading(true);
    setError("");

    let stepIndex = 0;
    setLoadingStep(LOADING_STEPS[0]);
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % LOADING_STEPS.length;
      setLoadingStep(LOADING_STEPS[stepIndex]);
    }, 2200);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Unable to analyze this video. Please ensure the video has English captions or subtitles and try again."
        );
        return;
      }

      setAnalysisData(data as AnalyzeResponse);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setError("");
        inputRef.current?.focus();
      }
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleSelectSaved = (note: SavedNote) => {
    setIsLibraryOpen(false);
    setAnalysisData({
      videoInfo: note.videoInfo,
      transcript: note.transcript,
      analysis: note.analysis,
      rawTranscript: note.rawTranscript,
    });
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-slate-100 flex flex-col selection:bg-[#00F59B] selection:text-black">
      {/* ─── Top Service Navigation ─── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#06070a]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 h-16 sm:h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center text-[#00F59B] text-sm green-glow-subtle group-hover:scale-105 transition-transform shrink-0">
                🎬
              </div>
              <span className="text-white font-extrabold text-base sm:text-lg tracking-tight">
                VideoMind <span className="text-[#00F59B]">AI</span>
              </span>
            </Link>

            <Link
              href="/"
              className="hidden md:inline-flex text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              ← Landing Page
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsLibraryOpen(true)}
              className="text-xs font-medium text-slate-300 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center gap-1.5"
              title="Open your saved video notes"
            >
              <span>📚</span>
              <span className="hidden sm:inline">Saved Library</span>
              <span className="sm:hidden">Library</span>
            </button>

            <UserMenu />
          </div>
        </div>
      </header>

      {/* ─── Main Service Dashboard ─── */}
      <main className="flex-1 flex flex-col items-center justify-center px-3 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 hero-bg subtle-grid relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[280px] bg-[#00F59B]/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-3xl w-full mx-auto relative z-10 flex flex-col items-center text-center">
          {/* Workspace Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 mb-4 sm:mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#00F59B] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-semibold text-slate-300 tracking-wide uppercase">
              VideoMind AI Workspace
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3 sm:mb-4">
            Analyze YouTube Video
          </h1>
          <p className="text-slate-400 text-xs sm:text-base max-w-xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2">
            Paste any YouTube link to instantly generate easy-to-read summaries, chapters, active-recall flashcards, and interactive Q&A.
          </p>

          {/* ─── URL Input Card ─── */}
          <div className="w-full saas-card p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/10 bg-[#090b10]/95 shadow-2xl relative mb-6 sm:mb-8">
            <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <div className="relative flex-1">
                <div className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00F59B]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Paste YouTube link (https://youtube.com/watch?v=...)"
                  className="w-full h-12 sm:h-14 pl-10 sm:pl-12 pr-20 sm:pr-24 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#00F59B]/50 transition-colors"
                  disabled={loading}
                  autoFocus
                />

                <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {url ? (
                    <button
                      type="button"
                      onClick={() => setUrl("")}
                      className="p-1 sm:p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 text-xs transition-colors"
                      title="Clear"
                    >
                      ✕
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePaste}
                      className="px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs text-slate-400 hover:text-[#00F59B] bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors"
                      title="Paste from clipboard"
                    >
                      Paste
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="btn-primary h-12 sm:h-14 px-5 sm:px-8 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-40 shadow-xl shadow-[#00F59B]/20 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-black" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Video</span>
                    <span className="text-base">⚡</span>
                  </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-left flex items-start gap-2.5 animate-fadeIn">
                <span className="text-sm">⚠️</span>
                <span className="flex-1 leading-relaxed">{error}</span>
              </div>
            )}

            {/* Loading Steps Indicator */}
            {loading && (
              <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3 animate-fadeIn">
                <svg className="w-4 h-4 animate-spin text-[#00F59B] shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span className="text-xs text-slate-300 font-medium">
                  {loadingStep || "Processing video..."}
                </span>
              </div>
            )}
          </div>

          {/* ─── Recent Saved Notes Quick-Access ─── */}
          {recentNotes.length > 0 && (
            <div className="w-full text-left space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Recently Saved Notes
                </span>
                <button
                  onClick={() => setIsLibraryOpen(true)}
                  className="text-xs text-[#00F59B] hover:underline"
                >
                  View All ({recentNotes.length}) →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recentNotes.map((note) => (
                  <div
                    key={note.videoId}
                    onClick={() => handleSelectSaved(note)}
                    className="p-3 rounded-2xl bg-surface-200/50 hover:bg-surface-300/80 border border-white/5 hover:border-[#00F59B]/30 cursor-pointer transition-all flex flex-col gap-2 group"
                  >
                    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-surface-300">
                      <Image
                        src={note.videoInfo.thumbnailUrl}
                        alt={note.videoInfo.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                    <h4 className="text-white text-xs font-semibold line-clamp-1 group-hover:text-[#00F59B] transition-colors">
                      {note.videoInfo.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 truncate">
                      {note.videoInfo.channel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── Library Modal ─── */}
      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectNote={handleSelectSaved}
      />
    </div>
  );
}
