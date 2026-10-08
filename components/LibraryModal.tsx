"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  getSavedNotesFromLibrary,
  deleteNoteFromLibrary,
} from "@/lib/savedNotes";
import type { SavedNote } from "@/types";

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (note: SavedNote) => void;
}

export default function LibraryModal({
  isOpen,
  onClose,
  onSelectNote,
}: LibraryModalProps) {
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    getSavedNotesFromLibrary(undefined)
      .then((loaded) => {
        if (isMounted) {
          setNotes(loaded);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredNotes = notes.filter((n) => {
    const q = search.toLowerCase();
    return (
      n.videoInfo.title.toLowerCase().includes(q) ||
      n.videoInfo.channel.toLowerCase().includes(q) ||
      (n.analysis.shortSummary && n.analysis.shortSummary.toLowerCase().includes(q))
    );
  });

  const handleDelete = async (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this video from your library?")) return;

    setDeletingId(videoId);
    try {
      await deleteNoteFromLibrary(undefined, videoId);
      setNotes((prev) => prev.filter((n) => n.videoId !== videoId));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Saved";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-3xl max-h-[90dvh] sm:max-h-[85vh] bg-[#0c0d12] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Modal Header ─── */}
        <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between gap-3 sm:gap-4 bg-surface-100/50">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F59B]/20 to-emerald-500/10 border border-[#00F59B]/30 flex items-center justify-center text-lg shadow-sm">
              📚
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>My Saved Library</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/20">
                  {notes.length} {notes.length === 1 ? "video" : "videos"}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Saved notes stored locally in your browser
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* ─── Search Bar ─── */}
        {notes.length > 0 && (
          <div className="px-5 md:px-6 pt-4 pb-2 border-b border-white/5">
            <div className="relative">
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, channel, or topics..."
                className="w-full bg-surface-200/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00F59B]/50 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── Modal Content / List ─── */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-3.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <svg className="w-6 h-6 animate-spin text-[#00F59B]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span className="text-xs">Loading your saved notes...</span>
            </div>
          ) : notes.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-2xl mb-4">
                📖
              </div>
              <h3 className="text-white font-bold text-base mb-1">
                Your Library is Empty
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Whenever you analyze a video, click <strong className="text-white">"Save to Library"</strong> at the top to keep your summaries, flashcards, and notes saved here.
              </p>
              <button
                onClick={onClose}
                className="btn-primary py-2 px-5 text-xs font-semibold"
              >
                Explore & Analyze Videos
              </button>
            </div>
          ) : filteredNotes.length === 0 ? (
            /* No search results */
            <div className="py-12 text-center text-slate-400 text-xs">
              No saved videos matching &ldquo;<span className="text-white">{search}</span>&rdquo;
            </div>
          ) : (
            /* Note Cards */
            <div className="grid grid-cols-1 gap-3">
              {filteredNotes.map((note) => (
                <div
                  key={note.videoId}
                  onClick={() => {
                    onSelectNote(note);
                    onClose();
                  }}
                  className="group cursor-pointer p-3.5 md:p-4 rounded-2xl bg-surface-100/60 hover:bg-surface-200/90 border border-white/5 hover:border-[#00F59B]/30 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  {/* Video Thumbnail */}
                  <div className="relative w-full sm:w-36 h-24 sm:h-20 rounded-xl overflow-hidden bg-surface-300 shrink-0">
                    <Image
                      src={note.videoInfo.thumbnailUrl}
                      alt={note.videoInfo.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-[#00F59B] transition-colors">
                      {note.videoInfo.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="truncate max-w-[150px]">{note.videoInfo.channel}</span>
                      <span>•</span>
                      <span className="text-slate-500">{formatDate(note.savedAt)}</span>
                      {note.analysis.chapters && note.analysis.chapters.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500">
                            {note.analysis.chapters.length} chapters
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                      {note.analysis.shortSummary}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <button
                      onClick={(e) => handleDelete(e, note.videoId)}
                      disabled={deletingId === note.videoId}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove from library"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <button
                      className="btn-primary py-1.5 px-3.5 text-xs font-semibold flex items-center gap-1 group-hover:shadow-md group-hover:shadow-[#00F59B]/20"
                    >
                      <span>Open Notes</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Modal Footer ─── */}
        <div className="p-4 border-t border-white/5 bg-surface-100/40 flex items-center justify-between text-xs text-slate-500 px-6">
          <span>VideoMind AI Study Library</span>
          <span>Click any card to resume studying</span>
        </div>

      </div>
    </div>
  );
}
