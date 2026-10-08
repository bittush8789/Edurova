"use client";

import type { Chapter } from "@/types";

interface ChaptersTabProps {
  chapters: Chapter[];
  videoUrl: string;
}

export default function ChaptersTab({ chapters, videoUrl }: ChaptersTabProps) {
  const openChapter = (chapter: Chapter) => {
    try {
      const url = new URL(videoUrl);
      url.searchParams.set("t", String(chapter.startSeconds));
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    } catch {
      window.open(videoUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in text-center">
        <div className="text-4xl">⏱️</div>
        <p className="text-white font-medium text-base">No chapters found for this video</p>
        <p className="text-slate-400 text-sm max-w-sm">
          You can still read the full script and ask questions in the other tabs.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⏱️</span>
            <h2 className="text-white font-bold text-lg">Video Chapters</h2>
            <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
              {chapters.length} parts
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Click any section below to start playing YouTube at that exact moment.
          </p>
        </div>
      </div>

      {/* ─── Timeline Cards ─── */}
      <div className="space-y-3">
        {chapters.map((chapter, i) => (
          <div
            key={i}
            className="chapter-card group hover:border-brand-500/40 p-4 rounded-xl glass border border-white/5 transition-all cursor-pointer"
            onClick={() => openChapter(chapter)}
            id={`chapter-${i}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openChapter(chapter)}
          >
            <div className="flex items-start gap-4">
              {/* Timestamp badge */}
              <button
                type="button"
                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-brand-500/15 text-brand-300 text-xs font-semibold border border-brand-500/30 group-hover:bg-brand-500 group-hover:text-white transition-all flex items-center gap-1.5"
                title={`Jump to ${chapter.timestamp} on YouTube`}
              >
                <span>▶</span>
                <span>{chapter.timestamp}</span>
              </button>

              {/* Title & description */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm sm:text-base group-hover:text-brand-300 transition-colors leading-snug">
                  {chapter.title}
                </h3>
                {chapter.description && (
                  <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                    {chapter.description}
                  </p>
                )}
              </div>

              {/* Link icon */}
              <div className="text-slate-500 group-hover:text-brand-400 transition-colors flex-shrink-0 text-xs flex items-center gap-1 pt-1">
                <span className="hidden sm:inline">Play</span>
                <span>↗</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-3 rounded-xl bg-white/5 text-center text-xs text-slate-400 border border-white/5">
        💡 <strong>Pro tip:</strong> Clicking any chapter will open the exact moment in a new YouTube tab.
      </div>
    </div>
  );
}
