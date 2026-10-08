import { YoutubeTranscript } from "youtube-transcript";
import type { TranscriptSegment, VideoInfo } from "@/types";

/**
 * Extracts the YouTube video ID from various URL formats.
 */
export function extractVideoId(url: string): string | null {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/, // raw ID
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validates a YouTube URL string.
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}

/**
 * Fetches video metadata from YouTube's oEmbed API (no API key required).
 */
export async function fetchVideoInfo(videoId: string): Promise<VideoInfo> {
  const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

  const response = await fetch(oEmbedUrl);
  if (!response.ok) {
    throw new Error("Video not found. Please check the URL and try again.");
  }

  const data = await response.json();

  // Duration is not available from oEmbed; we skip it or mark as unknown
  return {
    id: videoId,
    title: data.title ?? "Unknown Title",
    channel: data.author_name ?? "Unknown Channel",
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    duration: "", // Not available from oEmbed
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

/**
 * Fetches the transcript for a YouTube video.
 */
export async function fetchTranscript(
  videoId: string
): Promise<TranscriptSegment[]> {
  try {
    const rawItems = await YoutubeTranscript.fetchTranscript(videoId);
    return rawItems.map((item) => ({
      text: item.text,
      offset: item.offset,
      duration: item.duration,
    }));
  } catch {
    throw new Error(
      "Subtitles are not available for this video. Please try another video that has captions or subtitles turned on."
    );
  }
}

/**
 * Converts transcript segments into a single clean text string.
 */
export function transcriptToText(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => s.text.replace(/\n/g, " ").trim())
    .filter(Boolean)
    .join(" ");
}

/**
 * Formats milliseconds into a human-readable timestamp (MM:SS or HH:MM:SS).
 */
export function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Splits transcript text into overlapping chunks for AI processing.
 * Keeps context by using a sliding window approach.
 */
export function chunkTranscript(
  text: string,
  maxWords = 3000,
  overlapWords = 200
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    chunks.push(words.slice(start, end).join(" "));
    if (end === words.length) break;
    start += maxWords - overlapWords;
  }

  return chunks;
}
