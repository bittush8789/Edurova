"use client";

import { useState, useEffect } from "react";
import type { StudySet, Flashcard, QuizQuestion } from "@/types";

interface StudyTabProps {
  transcript: string;
  videoTitle: string;
}

export default function StudyTab({ transcript, videoTitle }: StudyTabProps) {
  const [mode, setMode] = useState<"flashcards" | "quiz">("flashcards");
  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());
  const [reviewCards, setReviewCards] = useState<Set<string>>(new Set());

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const fetchStudySet = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, videoTitle }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate study materials.");
      }
      const data: StudySet = await res.json();
      setStudySet(data);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setCurrentQuizIndex(0);
      setSelectedAnswers({});
      setQuizSubmitted(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut for flashcards (Space to flip, Arrows to navigate)
  useEffect(() => {
    if (mode !== "flashcards" || !studySet || studySet.flashcards.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNextCard();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrevCard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, studySet, currentCardIndex]);

  const handleNextCard = () => {
    if (!studySet) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % studySet.flashcards.length);
  };

  const handlePrevCard = () => {
    if (!studySet) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) =>
      prev === 0 ? studySet.flashcards.length - 1 : prev - 1
    );
  };

  const toggleMastered = (cardId: string) => {
    setMasteredCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
        // Remove from review
        setReviewCards((r) => {
          const nr = new Set(r);
          nr.delete(cardId);
          return nr;
        });
      }
      return next;
    });
  };

  const toggleReview = (cardId: string) => {
    setReviewCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
        // Remove from mastered
        setMasteredCards((m) => {
          const nm = new Set(m);
          nm.delete(cardId);
          return nm;
        });
      }
      return next;
    });
  };

  const handleSelectQuizOption = (optionIndex: number) => {
    if (selectedAnswers[currentQuizIndex] !== undefined) return; // locked once selected
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuizIndex]: optionIndex,
    }));
  };

  const calculateScore = () => {
    if (!studySet) return 0;
    let score = 0;
    studySet.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  // If not generated yet
  if (!studySet) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00F59B]/20 via-[#00F59B]/10 to-transparent border border-[#00F59B]/30 flex items-center justify-center text-3xl mb-5 shadow-lg shadow-[#00F59B]/10">
          🎯
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Interactive Study Suite
        </h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Test your comprehension and remember more in less time. Our AI analyzes the video to create active recall flashcards and a practice quiz.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-8 text-left">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
            <span className="text-xl">🎴</span>
            <div>
              <h4 className="text-white text-xs font-semibold mb-0.5">Flip Flashcards</h4>
              <p className="text-slate-400 text-xs">Concept drills with spaced repetition marking</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
            <span className="text-xl">📝</span>
            <div>
              <h4 className="text-white text-xs font-semibold mb-0.5">Instant Practice Quiz</h4>
              <p className="text-slate-400 text-xs">Multiple-choice questions with step-by-step explanations</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="w-full mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-left">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={fetchStudySet}
          disabled={loading}
          className="btn-primary py-3 px-8 text-sm font-semibold flex items-center gap-2 shadow-xl shadow-[#00F59B]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin text-black" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span>Crafting Cards & Quiz...</span>
            </>
          ) : (
            <>
              <span>⚡ Generate Flashcards & Quiz</span>
            </>
          )}
        </button>
      </div>
    );
  }

  const currentCard = studySet.flashcards[currentCardIndex];
  const currentQuiz = studySet.quiz[currentQuizIndex];
  const totalCards = studySet.flashcards.length;
  const totalQuestions = studySet.quiz.length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* ─── Mode Switcher Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-2xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-1.5 p-1 bg-surface-200/50 rounded-xl">
          <button
            onClick={() => setMode("flashcards")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
              mode === "flashcards"
                ? "bg-[#00F59B] text-black font-semibold shadow-md shadow-[#00F59B]/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🎴 Flashcards</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/10">
              {totalCards}
            </span>
          </button>
          <button
            onClick={() => setMode("quiz")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
              mode === "quiz"
                ? "bg-[#00F59B] text-black font-semibold shadow-md shadow-[#00F59B]/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📝 Practice Quiz</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/10">
              {totalQuestions}
            </span>
          </button>
        </div>

        <button
          onClick={fetchStudySet}
          disabled={loading}
          className="text-xs text-slate-400 hover:text-[#00F59B] flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all self-end sm:self-auto"
          title="Regenerate questions"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Regenerate</span>
        </button>
      </div>

      {/* ─── FLASHCARDS MODE ─── */}
      {mode === "flashcards" && currentCard && (
        <div className="space-y-5">
          {/* Progress bar & Stats */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">
                Card {currentCardIndex + 1} of {totalCards}
              </span>
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ✓ {masteredCards.size} Mastered
              </span>
              {reviewCards.size > 0 && (
                <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  ⚡ {reviewCards.size} Review
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-slate-400 text-[11px]">
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">Space</kbd> to flip, <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">→</kbd> to navigate
            </span>
          </div>

          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#00F59B] h-full transition-all duration-300"
              style={{ width: `${((currentCardIndex + 1) / totalCards) * 100}%` }}
            />
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped((prev) => !prev)}
            className="cursor-pointer select-none perspective-[1000px] min-h-[320px] md:min-h-[350px] relative w-full group"
          >
            <div
              className={`w-full h-full min-h-[320px] md:min-h-[350px] rounded-3xl p-6 md:p-10 flex flex-col justify-between transition-transform duration-500 transform-style-3d border ${
                isFlipped
                  ? "bg-gradient-to-b from-surface-200/90 to-surface-300/80 border-[#00F59B]/40 shadow-xl shadow-[#00F59B]/5"
                  : "bg-gradient-to-b from-surface-200/90 to-surface-100/90 border-white/10 hover:border-white/20 shadow-xl"
              }`}
            >
              {/* Header badge */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/20">
                  {currentCard.concept || "Key Topic"}
                </span>
                <span className="text-xs text-slate-400 group-hover:text-slate-300 flex items-center gap-1">
                  <span>{isFlipped ? "Showing Answer" : "Tap to Flip"}</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </span>
              </div>

              {/* Card Body */}
              <div className="my-auto py-6">
                {!isFlipped ? (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                      Question / Concept
                    </span>
                    <h3 className="text-lg md:text-2xl font-bold text-white leading-relaxed">
                      {currentCard.question}
                    </h3>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold tracking-wider uppercase text-[#00F59B]">
                      Explanation & Answer
                    </span>
                    <p className="text-sm md:text-lg text-slate-200 leading-relaxed font-normal">
                      {currentCard.answer}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-400">
                <span>VideoMind Active Recall</span>
                <span className="text-slate-400">
                  {isFlipped ? "Click anywhere to see question" : "Click anywhere to reveal answer"}
                </span>
              </div>

            </div>
          </div>

          {/* Navigation & Learning Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {/* Prev / Next buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrevCard}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-surface-200 hover:bg-surface-300 text-white text-xs font-medium border border-white/5 transition-all flex items-center justify-center gap-1.5"
                title="Previous card"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
              <button
                onClick={handleNextCard}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-surface-200 hover:bg-surface-300 text-white text-xs font-medium border border-white/5 transition-all flex items-center justify-center gap-1.5"
                title="Next card"
              >
                <span>Next</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Mastery Toggles */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => toggleReview(currentCard.id)}
                className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                  reviewCards.has(currentCard.id)
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-surface-200/50 text-slate-400 border-white/5 hover:text-white"
                }`}
              >
                <span>🔄 Needs Review</span>
              </button>
              <button
                onClick={() => toggleMastered(currentCard.id)}
                className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                  masteredCards.has(currentCard.id)
                    ? "bg-[#00F59B]/20 text-[#00F59B] border-[#00F59B]/40 font-semibold"
                    : "bg-surface-200/50 text-slate-400 border-white/5 hover:text-white"
                }`}
              >
                <span>✅ Got It Down</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PRACTICE QUIZ MODE ─── */}
      {mode === "quiz" && (
        <div className="space-y-6">
          {!quizSubmitted ? (
            currentQuiz && (
              <div className="space-y-6">
                {/* Quiz Header & Step Counter */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-white">
                    Question {currentQuizIndex + 1} of {totalQuestions}
                  </span>
                  <span>
                    Answered: {Object.keys(selectedAnswers).length} / {totalQuestions}
                  </span>
                </div>

                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#00F59B] h-full transition-all duration-300"
                    style={{
                      width: `${((currentQuizIndex + 1) / totalQuestions) * 100}%`,
                    }}
                  />
                </div>

                {/* Question Box */}
                <div className="p-6 md:p-8 rounded-3xl bg-surface-200/80 border border-white/10 shadow-lg space-y-6">
                  <h3 className="text-base md:text-xl font-bold text-white leading-snug">
                    {currentQuiz.question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {currentQuiz.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentQuizIndex] === optIdx;
                      const hasAnswered = selectedAnswers[currentQuizIndex] !== undefined;
                      const isCorrect = optIdx === currentQuiz.correctIndex;

                      let btnStyle = "bg-surface-300/60 border-white/5 text-slate-200 hover:border-white/20 hover:bg-surface-300";

                      if (hasAnswered) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-medium shadow-md shadow-emerald-500/10";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-500/15 border-rose-500/50 text-rose-200 font-medium";
                        } else {
                          btnStyle = "bg-surface-300/30 border-white/5 text-slate-400 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectQuizOption(optIdx)}
                          disabled={hasAnswered}
                          className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between gap-3 group ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                hasAnswered && isCorrect
                                  ? "bg-emerald-500 text-black"
                                  : hasAnswered && isSelected
                                  ? "bg-rose-500 text-white"
                                  : "bg-white/10 text-slate-300 group-hover:bg-white/20"
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                          </div>

                          {hasAnswered && isCorrect && (
                            <span className="text-emerald-400 text-base font-bold shrink-0">
                              ✓
                            </span>
                          )}
                          {hasAnswered && isSelected && !isCorrect && (
                            <span className="text-rose-400 text-base font-bold shrink-0">
                              ✕
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Explanation Box */}
                  {selectedAnswers[currentQuizIndex] !== undefined && (
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 animate-fadeIn">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        {selectedAnswers[currentQuizIndex] === currentQuiz.correctIndex ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <span>✅</span> Correct Answer
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <span>✕</span> Keep Learning
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {currentQuiz.explanation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => setCurrentQuizIndex((p) => Math.max(0, p - 1))}
                    disabled={currentQuizIndex === 0}
                    className="px-4 py-2.5 rounded-xl bg-surface-200 hover:bg-surface-300 text-white text-xs font-medium border border-white/5 transition-all disabled:opacity-40"
                  >
                    Previous Question
                  </button>

                  {currentQuizIndex < totalQuestions - 1 ? (
                    <button
                      onClick={() => setCurrentQuizIndex((p) => p + 1)}
                      className="btn-primary py-2.5 px-6 text-xs font-semibold"
                    >
                      Next Question →
                    </button>
                  ) : (
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      className="btn-primary py-2.5 px-6 text-xs font-semibold shadow-lg shadow-[#00F59B]/20"
                    >
                      View Final Score 🏆
                    </button>
                  )}
                </div>
              </div>
            )
          ) : (
            /* ─── QUIZ SCORECARD ─── */
            <div className="p-8 rounded-3xl bg-surface-200/80 border border-white/10 shadow-2xl text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#00F59B]/20 via-[#00F59B]/10 to-transparent border border-[#00F59B]/40 flex items-center justify-center text-4xl shadow-xl shadow-[#00F59B]/15">
                {calculateScore() === totalQuestions ? "🏆" : calculateScore() >= totalQuestions * 0.6 ? "🌟" : "💡"}
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#00F59B]">
                  Quiz Results
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                  You scored {calculateScore()} out of {totalQuestions}
                </h3>
                <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                  {calculateScore() === totalQuestions
                    ? "Flawless score! You fully mastered the concepts covered in this video."
                    : calculateScore() >= totalQuestions * 0.6
                    ? "Strong performance! You have a great grasp of the core insights."
                    : "Good effort! Try reviewing the flashcards to strengthen your retention."}
                </p>
              </div>

              {/* Score Percentage Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-white">
                <span>Accuracy:</span>
                <span className="text-[#00F59B]">
                  {Math.round((calculateScore() / totalQuestions) * 100)}%
                </span>
              </div>

              {/* Questions Review Breakdown */}
              <div className="text-left space-y-3 pt-4 border-t border-white/5 max-h-[350px] overflow-y-auto pr-1">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Review All Questions
                </h4>
                {studySet.quiz.map((q, idx) => {
                  const userAns = selectedAnswers[idx];
                  const isCorrect = userAns === q.correctIndex;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-surface-300/50 border border-white/5 space-y-1.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-200 font-medium">
                          {idx + 1}. {q.question}
                        </span>
                        <span
                          className={`shrink-0 font-bold ${
                            isCorrect ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isCorrect ? "✓ Correct" : "✕ Missed"}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        <strong className="text-emerald-400">Answer:</strong> {q.options[q.correctIndex]}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setCurrentQuizIndex(0);
                    setQuizSubmitted(false);
                  }}
                  className="w-full sm:w-auto btn-primary py-2.5 px-6 text-xs font-semibold"
                >
                  🔄 Retake Quiz
                </button>
                <button
                  onClick={() => setMode("flashcards")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-surface-300 hover:bg-surface-400 text-white text-xs font-medium border border-white/5 transition-all"
                >
                  🎴 Review Flashcards
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
