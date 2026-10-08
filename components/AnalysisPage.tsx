"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { AnalyzeResponse, ChatMessage, SavedNote } from "@/types";
import OverviewTab from "./tabs/OverviewTab";
import ChaptersTab from "./tabs/ChaptersTab";
import TranscriptTab from "./tabs/TranscriptTab";
import ChatTab from "./tabs/ChatTab";
import StudyTab from "./tabs/StudyTab";
import LibraryModal from "@/components/LibraryModal";
import UserMenu from "@/components/auth/UserMenu";
import { useAuth } from "@/context/AuthContext";
import {
  saveNoteToLibrary,
  deleteNoteFromLibrary,
  isNoteAlreadySaved,
} from "@/lib/savedNotes";
import { formatNotesToMarkdown } from "@/lib/markdown";

type TabId = "overview" | "study" | "chapters" | "transcript" | "chat";

const TABS: { id: TabId; label: string; icon: string; description: string }[] = [
  {
    id: "overview",
    label: "Summary & Key Ideas",
    icon: "⚡",
    description: "Main takeaways at a glance",
  },
  {
    id: "study",
    label: "Quiz & Flashcards",
    icon: "🎯",
    description: "Active recall & test yourself",
  },
  {
    id: "chapters",
    label: "Video Chapters",
    icon: "⏱️",
    description: "Jump to topics by timestamp",
  },
  {
    id: "transcript",
    label: "Read Full Script",
    icon: "📖",
    description: "Search spoken words",
  },
  {
    id: "chat",
    label: "Ask Any Question",
    icon: "💬",
    description: "Friendly answers from the video",
  },
];

interface AnalysisPageProps {
  data: AnalyzeResponse;
  onReset: () => void;
  onSelectSavedNote?: (note: SavedNote) => void;
}

export default function AnalysisPage({
  data,
  onReset,
  onSelectSavedNote,
}: AnalysisPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState("");
  const [thumbError, setThumbError] = useState(false);

  // Library & Save state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  const { videoInfo, transcript, analysis, rawTranscript } = data;

  useEffect(() => {
    setIsSaved(isNoteAlreadySaved(user?.uid, videoInfo.id));
  }, [user?.uid, videoInfo.id]);

  const handleToggleSave = async () => {
    setSaveLoading(true);
    try {
      if (isSaved) {
        await deleteNoteFromLibrary(user?.uid, videoInfo.id);
        setIsSaved(false);
      } else {
        await saveNoteToLibrary(user?.uid, data);
        setIsSaved(true);
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const md = formatNotesToMarkdown(videoInfo, analysis);
      await navigator.clipboard.writeText(md);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2200);
    } catch {
      // Fallback ignored
    }
  };

  const handleExportPDF = async () => {
    setExportLoading(true);
    setExportError("");
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoInfo, analysis, chatHistory }),
      });
      if (!res.ok) {
        const err = await res.json();
        setExportError(err.error || "Unable to download PDF. Please try again.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Notes-${videoInfo.title.slice(0, 40).replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Unable to download PDF. Please try again in a moment.");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06070a] flex flex-col">
      {/* ─── Top Navigation ─── */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-3.5 border-b border-white/5 bg-[#06070a]/95 backdrop-blur-xl">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all text-sm font-medium group"
          id="back-btn"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="hidden sm:inline">Analyze Another Video</span>
          <span className="sm:hidden">New Video</span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-sm shadow-sm shadow-brand-500/20">
            🎬
          </div>
          <span className="text-white font-bold text-base tracking-tight hidden sm:inline">
            VideoMind <span className="text-[#00F59B]">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Save to Library Button */}
          <button
            onClick={handleToggleSave}
            disabled={saveLoading}
            className={`px-3 py-2 rounded-xl text-xs md:text-sm font-medium border transition-all flex items-center gap-1.5 ${
              isSaved
                ? "bg-[#00F59B]/15 text-[#00F59B] border-[#00F59B]/40 hover:bg-[#00F59B]/25 shadow-sm shadow-[#00F59B]/10"
                : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/5"
            }`}
            title={isSaved ? "Saved in your library (click to remove)" : "Save to library"}
          >
            <span>{isSaved ? "⭐" : "☆"}</span>
            <span className="hidden md:inline">{isSaved ? "Saved" : "Save"}</span>
          </button>

          {/* Copy Markdown (Notion / Notes) Button */}
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs md:text-sm font-medium border border-white/5 flex items-center gap-1.5 transition-all"
            title="Copy Markdown formatted notes (ready for Notion or Obsidian)"
          >
            <span>{copiedMarkdown ? "✓" : "📋"}</span>
            <span className="hidden md:inline">
              {copiedMarkdown ? "Copied!" : "Markdown"}
            </span>
          </button>

          {/* Open Saved Library Button */}
          <button
            onClick={() => setIsLibraryOpen(true)}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs md:text-sm font-medium border border-white/5 flex items-center gap-1.5 transition-all"
            title="Browse your saved video library"
          >
            <span>📚</span>
            <span className="hidden lg:inline">Library</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            disabled={exportLoading}
            className="btn-primary text-xs md:text-sm py-2 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 disabled:opacity-60 shadow-md shadow-brand-500/20"
            id="export-pdf-btn"
            title="Download printable study notes as PDF"
          >
            {exportLoading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span className="hidden sm:inline">Creating PDF...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className="hidden sm:inline">PDF Notes</span>
                <span className="sm:hidden">PDF</span>
              </>
            )}
          </button>

          <UserMenu />
        </div>
      </nav>

      {exportError && (
        <div className="mx-4 md:mx-8 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{exportError}</span>
        </div>
      )}

      {/* ─── Video Overview Card ─── */}
      <div className="px-4 md:px-8 py-5 max-w-5xl mx-auto w-full">
        <div className="glass rounded-2xl overflow-hidden border border-white/5">
          <div className="flex flex-col md:flex-row gap-5 p-5">
            {/* Thumbnail */}
            <div className="relative flex-shrink-0 w-full md:w-56 h-36 md:h-32 rounded-xl overflow-hidden bg-surface-300">
              {!thumbError ? (
                <Image
                  src={videoInfo.thumbnailUrl}
                  alt={videoInfo.title}
                  fill
                  className="object-cover"
                  onError={() => setThumbError(true)}
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-surface-400">
                  🎬
                </div>
              )}
              {/* Play overlay button */}
              <a
                href={videoInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                id="video-link"
                title="Watch video on YouTube"
              >
                <div className="w-11 h-11 rounded-full bg-red-600/90 hover:bg-red-600 flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                  <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </a>
            </div>

            {/* Video Details */}
            <div className="flex flex-col justify-center gap-2 min-w-0">
              <h1 className="text-white font-bold text-base md:text-lg leading-snug line-clamp-2">
                {videoInfo.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  {videoInfo.channel}
                </span>

                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Subtitles & Notes Ready
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1">
                <a
                  href={videoInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-brand-400 text-xs hover:text-brand-300 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 0021 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  <span>Watch on YouTube</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Friendly Tab Navigation ─── */}
      <div className="sticky top-[58px] z-30 bg-[#06070a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 md:px-8 max-w-5xl mx-auto">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 ${
                    isActive
                      ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.id === "study" && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#00F59B]/20 text-[#00F59B] font-bold uppercase tracking-wider">
                      New
                    </span>
                  )}
                  {tab.id === "chat" && chatHistory.length > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-brand-500/20 text-brand-300"
                      }`}
                    >
                      {Math.floor(chatHistory.length / 2)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="flex-1 px-4 md:px-8 py-6 max-w-5xl mx-auto w-full">
        {activeTab === "overview" && (
          <OverviewTab analysis={analysis} />
        )}
        {activeTab === "study" && (
          <StudyTab
            transcript={rawTranscript}
            videoTitle={videoInfo.title}
          />
        )}
        {activeTab === "chapters" && (
          <ChaptersTab chapters={analysis.chapters} videoUrl={videoInfo.url} />
        )}
        {activeTab === "transcript" && (
          <TranscriptTab transcript={transcript} />
        )}
        {activeTab === "chat" && (
          <ChatTab
            transcript={rawTranscript}
            videoTitle={videoInfo.title}
            chatHistory={chatHistory}
            onChatUpdate={setChatHistory}
            onSwitchTab={() => setActiveTab("overview")}
          />
        )}
      </div>

      {/* ─── Library Modal ─── */}
      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectNote={(note) => {
          setIsLibraryOpen(false);
          if (onSelectSavedNote) {
            onSelectSavedNote(note);
          }
        }}
      />
    </div>
  );
}
