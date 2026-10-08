// VideoMind AI — Shared TypeScript Types

export interface VideoInfo {
  id: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
  duration: string;
  url: string;
}

export interface TranscriptSegment {
  text: string;
  offset: number; // milliseconds
  duration: number;
}

export interface Chapter {
  title: string;
  timestamp: string;
  description: string;
  startSeconds: number;
}

export interface VideoAnalysis {
  shortSummary: string;
  detailedSummary: string;
  keyTakeaways: string[];
  importantConcepts: string[];
  chapters: Chapter[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnalyzeResponse {
  videoInfo: VideoInfo;
  transcript: TranscriptSegment[];
  analysis: VideoAnalysis;
  rawTranscript: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  transcript: string;
  videoTitle: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  concept?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StudySet {
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface SavedNote {
  id: string; // usually videoId
  videoId: string;
  videoInfo: VideoInfo;
  analysis: VideoAnalysis;
  transcript: TranscriptSegment[];
  rawTranscript: string;
  savedAt: number; // timestamp ms
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  timestamp?: string;
  children?: MindMapNode[];
}

export interface MindMapData {
  title: string;
  root: MindMapNode;
}

export interface ActionItem {
  id: string;
  task: string;
  context?: string;
  category?: string;
}

export interface ActionPlan {
  summary: string;
  items: ActionItem[];
}

export interface TranslatedAnalysis {
  language: string;
  shortSummary: string;
  detailedSummary: string;
  keyTakeaways: string[];
  importantConcepts: string[];
}


