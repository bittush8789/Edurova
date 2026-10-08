"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { TranscriptSegment } from "@/types";
import { formatTimestamp } from "@/lib/youtube";

interface TranscriptTabProps {
  transcript: TranscriptSegment[];
}

const PAGE_SIZE = 80;

export default function TranscriptTab({ transcript }: TranscriptTabProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  // Filter & search
  const filtered = useMemo(() => {
    if (!search.trim()) return transcript;
    const q = search.toLowerCase();
    return transcript.filter((s) => s.text.toLowerCase().includes(q));
  }, [transcript, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(0, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (transcript.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in text-center">
        <div className="text-4xl">📖</div>
        <p className="text-white font-medium text-base">No written script available</p>
        <p className="text-slate-400 text-sm max-w-sm">
          Subtitles could not be loaded for this video. You can still check the summary tab.
        </p>
      </div>
    );
  }

  const highlight = (text: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-brand-500/40 text-brand-100 rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="animate-fade-in" ref={topRef}>
      {/* ─── Header + Search ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h2 className="text-white font-bold text-lg">Full Video Script</h2>
            <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
              {transcript.length} lines
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Search any spoken word to find the exact moment it was discussed.
          </p>
        </div>

        {/* Search box */}
        <div className="relative w-full sm:w-64">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words in video..."
            id="transcript-search"
            className="pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all w-full"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search results count */}
      {search && (
        <div className="mb-4 text-xs text-brand-300 bg-brand-500/10 border border-brand-500/20 px-3 py-2 rounded-lg">
          {filtered.length === 0
            ? `No lines found matching "${search}".`
            : `Found ${filtered.length} line${filtered.length !== 1 ? "s" : ""} mentioning "${search}"`}
        </div>
      )}

      {/* Script lines */}
      <div className="glass rounded-2xl overflow-hidden border border-white/5">
        <div className="divide-y divide-white/5">
          {visible.map((segment, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3.5 hover:bg-white/5 transition-colors ${
                search && segment.text.toLowerCase().includes(search.toLowerCase())
                  ? "bg-brand-500/10"
                  : ""
              }`}
              id={`segment-${i}`}
            >
              {/* Timestamp */}
              <span className="flex-shrink-0 font-mono text-xs text-brand-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 select-none">
                {formatTimestamp(segment.offset)}
              </span>
              {/* Text */}
              <p className="text-slate-200 text-sm leading-relaxed flex-1">
                {highlight(segment.text)}
              </p>
            </div>
          ))}
        </div>

        {/* Load more */}
        {page < totalPages && (
          <div className="p-4 border-t border-white/5 text-center bg-white/2">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary text-xs sm:text-sm py-2 px-5"
              id="load-more-transcript"
            >
              Show more lines ({filtered.length - visible.length} left)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
