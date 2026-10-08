"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types";

const SUGGESTED_QUESTIONS = [
  "What is the main point in 1 simple sentence?",
  "Explain this video to me like I'm a beginner.",
  "What are the top 3 actionable takeaways?",
  "What examples or real stories were mentioned?",
  "Give me a step-by-step summary of what to do.",
];

interface ChatTabProps {
  transcript: string;
  videoTitle: string;
  chatHistory: ChatMessage[];
  onChatUpdate: (history: ChatMessage[]) => void;
  onSwitchTab: () => void;
}

export default function ChatTab({
  transcript,
  videoTitle,
  chatHistory,
  onChatUpdate,
}: ChatTabProps) {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMsg, setStreamingMsg] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, streamingMsg]);

  const sendMessage = async (messageText?: string) => {
    const text = (messageText ?? input).trim();
    if (!text || isStreaming) return;

    setInput("");
    setError("");

    const userMsg: ChatMessage = { role: "user", content: text };
    const updatedHistory = [...chatHistory, userMsg];
    onChatUpdate(updatedHistory);

    setIsStreaming(true);
    setStreamingMsg("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
          transcript,
          videoTitle,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Unable to answer right now.");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setStreamingMsg(fullText);
        }
      }

      const aiMsg: ChatMessage = { role: "assistant", content: fullText };
      onChatUpdate([...updatedHistory, aiMsg]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred while answering.";
      setError(msg);
      // Roll back on failure
      onChatUpdate(chatHistory);
    } finally {
      setIsStreaming(false);
      setStreamingMsg("");
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-270px)] min-h-[480px] animate-fade-in">
      {/* ─── Chat messages area ─── */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        {/* Empty state greeting */}
        {chatHistory.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full gap-5 py-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 border border-brand-500/30 flex items-center justify-center text-2xl shadow-lg shadow-brand-500/10">
              💬
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-1">
                Ask Any Question About This Video
              </h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                No need to re-watch the video. Ask anything in simple words and get instant answers!
              </p>
            </div>

            {/* Clickable suggested questions */}
            <div className="flex flex-col gap-2 w-full max-w-md mt-2">
              <p className="text-xs text-slate-500 text-left pl-1 font-medium">
                Tap any question to ask immediately:
              </p>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs sm:text-sm hover:border-brand-500/40 hover:bg-white/10 transition-all flex items-center justify-between group"
                  id={`suggested-${q.slice(0, 15).replace(/\s+/g, "-")}`}
                >
                  <span>{q}</span>
                  <span className="text-brand-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message history */}
        {chatHistory.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}

        {/* Streaming answer */}
        {isStreaming && streamingMsg && (
          <div className="flex gap-3">
            <AssistantAvatar />
            <div className="chat-bubble-ai px-4 py-3 max-w-[85%] rounded-2xl">
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap typing-cursor">
                {streamingMsg}
              </p>
            </div>
          </div>
        )}

        {/* Loading dots */}
        {isStreaming && !streamingMsg && (
          <div className="flex gap-3 items-center">
            <AssistantAvatar />
            <div className="chat-bubble-ai px-4 py-3 rounded-2xl">
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error notice */}
        {error && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── Question Input Bar ─── */}
      <div className="flex-shrink-0 pt-3 border-t border-white/5">
        {chatHistory.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
            {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={isStreaming}
                className="flex-shrink-0 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs hover:text-white hover:border-brand-500/30 transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2.5 items-end">
          <div className="flex-1 glass rounded-2xl overflow-hidden border border-white/10">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question about this video... (Press Enter to send)"
              disabled={isStreaming}
              rows={1}
              id="chat-input"
              className="w-full bg-transparent text-white placeholder-slate-400 text-sm px-4 py-3 resize-none focus:outline-none disabled:opacity-60"
              style={{ maxHeight: "120px" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 120) + "px";
              }}
            />
          </div>

          <button
            onClick={() => sendMessage()}
            disabled={isStreaming || !input.trim()}
            id="send-btn"
            title="Send your question"
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center hover:from-brand-400 hover:to-accent-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-brand-500/20"
          >
            {isStreaming ? (
              <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-2">
          Answers are drawn directly from what was spoken in this video.
        </p>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="chat-bubble-user px-4 py-3 max-w-[85%] rounded-2xl">
          <p className="text-white text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <AssistantAvatar />
      <div className="chat-bubble-ai px-4 py-3 max-w-[85%] rounded-2xl">
        <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 border border-brand-500/30 flex items-center justify-center text-sm shadow-sm">
      💡
    </div>
  );
}
