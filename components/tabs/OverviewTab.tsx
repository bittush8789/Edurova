"use client";

import { useState } from "react";
import type { VideoAnalysis } from "@/types";

interface OverviewTabProps {
  analysis: VideoAnalysis;
}

type SummaryLens = "detailed" | "eli5" | "executive";

export default function OverviewTab({ analysis }: OverviewTabProps) {
  const [lens, setLens] = useState<SummaryLens>("detailed");
  const [copied, setCopied] = useState(false);

  const handleCopyNotes = async () => {
    const text = `QUICK SUMMARY:\n${analysis.shortSummary}\n\nDETAILED SUMMARY:\n${analysis.detailedSummary}\n\nKEY TAKEAWAYS:\n${analysis.keyTakeaways.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\nIMPORTANT CONCEPTS:\n${analysis.importantConcepts.join(", ")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ─── Mode & Actions Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-2.5 sm:px-4 sm:py-3">
        {/* Lens Switcher */}
        <div className="flex items-center gap-1 bg-surface-200/60 p-1 rounded-xl">
          <button
            onClick={() => setLens("detailed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              lens === "detailed"
                ? "bg-[#00F59B] text-black font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="Complete comprehensive study breakdown"
          >
            🎓 Comprehensive
          </button>
          <button
            onClick={() => setLens("eli5")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              lens === "eli5"
                ? "bg-[#00F59B] text-black font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="Explain Like I'm 5 — super simple, friendly language"
          >
            👶 ELI5 Mode
          </button>
          <button
            onClick={() => setLens("executive")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              lens === "executive"
                ? "bg-[#00F59B] text-black font-semibold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="1-Minute Executive Fast Scan"
          >
            ⚡ Fast Scan
          </button>
        </div>

        <button
          onClick={handleCopyNotes}
          className="self-end sm:self-auto px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors border border-white/5"
          title="Copy all notes to clipboard"
        >
          {copied ? (
            <>
              <span className="text-emerald-400">✓</span>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Copy Notes</span>
            </>
          )}
        </button>
      </div>

      {/* ─── ELI5 LENS VIEW ─── */}
      {lens === "eli5" && (
        <section className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <span>👶</span>
              <span>Explain Like I&apos;m 5 (Super Simple Breakdown)</span>
            </div>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed">
              Think of this video like this: {analysis.shortSummary}
            </p>
            <div className="pt-2 text-xs text-amber-300/80 font-medium">
              💡 Tip: The main lesson here is simplified into plain words without confusing jargon.
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <span>🎯</span>
              <span>The Big Ideas in Plain English:</span>
            </h3>
            <div className="space-y-3">
              {analysis.keyTakeaways.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs flex items-center justify-center shrink-0 font-bold">
                    {i + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── EXECUTIVE FAST SCAN ─── */}
      {lens === "executive" && (
        <section className="space-y-6 animate-fadeIn">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs uppercase tracking-wider text-[#00F59B] font-bold">
                1-Minute Executive Brief
              </span>
              <span className="text-xs text-slate-400">⚡ Fast Scan</span>
            </div>
            <p className="text-white font-medium text-base sm:text-lg leading-relaxed">
              {analysis.shortSummary}
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
              Top Actionable Takeaways ({analysis.keyTakeaways.length})
            </h4>
            {analysis.keyTakeaways.map((item, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-surface-200/70 border border-white/5 flex items-start gap-3"
              >
                <span className="text-brand-400 text-sm shrink-0">✦</span>
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── COMPREHENSIVE LENS (DEFAULT) ─── */}
      {lens === "detailed" && (
        <>
          {/* ─── Short Summary ─── */}
          <section>
            <SectionHeader
              icon="⚡"
              title="Quick Summary"
              subtitle="The core message in 30 seconds"
            />
            <div className="glass rounded-2xl p-6 mt-3 border border-white/5">
              <p className="text-slate-200 leading-relaxed text-base sm:text-lg">
                {analysis.shortSummary}
              </p>
            </div>
          </section>

          {/* ─── Detailed Summary ─── */}
          <section>
            <SectionHeader
              icon="📖"
              title="In-Depth Summary"
              subtitle="All major concepts and ideas discussed"
            />
            <div className="glass rounded-2xl p-6 mt-3 border border-white/5">
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base prose-content">
                {analysis.detailedSummary}
              </p>
            </div>
          </section>

          {/* ─── Key Takeaways ─── */}
          <section>
            <SectionHeader
              icon="✅"
              title="Key Takeaways"
              subtitle="Essential lessons you can apply"
              count={analysis.keyTakeaways.length}
            />
            <div className="mt-3 space-y-2.5">
              {analysis.keyTakeaways.length === 0 ? (
                <EmptyState text="No takeaways found." />
              ) : (
                analysis.keyTakeaways.map((item, i) => (
                  <div
                    key={i}
                    className="takeaway-item group hover:border-brand-500/30 transition-colors"
                  >
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center text-xs font-bold group-hover:bg-brand-500/30 transition-colors">
                      {i + 1}
                    </div>
                    <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ─── Important Concepts ─── */}
          <section>
            <SectionHeader
              icon="🧠"
              title="Key Topics & Vocabulary"
              subtitle="Important terminology and subjects from the video"
              count={analysis.importantConcepts.length}
            />
            <div className="mt-3 flex flex-wrap gap-2.5">
              {analysis.importantConcepts.length === 0 ? (
                <EmptyState text="No key topics found." />
              ) : (
                analysis.importantConcepts.map((concept, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm flex items-center gap-1.5 hover:bg-brand-500/20 transition-colors"
                  >
                    <span className="text-brand-400">✦</span>
                    <span>{concept}</span>
                  </span>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  count,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  count?: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="text-lg">{icon}</span>
        <h2 className="text-white font-bold text-base sm:text-lg">{title}</h2>
        {count !== undefined && (
          <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-medium">
            {count}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-slate-400 text-xs mt-0.5 ml-7">{subtitle}</p>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-slate-500 text-sm italic">{text}</p>;
}
