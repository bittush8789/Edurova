import { YoutubeTranscript } from "youtube-transcript";
import type { TranscriptSegment, VideoInfo } from "@/types";

/**
 * Extracts the YouTube video ID from various URL formats.
 */
export function extractVideoId(url: string): string | null {
  try {
    const trimmed = url.trim();
    if (!trimmed) return null;

    // 1. Raw 11-character video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    // 2. Structured URL parsing
    try {
      const urlObj = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      const hostname = urlObj.hostname.replace(/^www\./, "");

      if (hostname === "youtube.com" || hostname === "m.youtube.com") {
        const v = urlObj.searchParams.get("v");
        if (v && v.length === 11) return v;

        const pathMatch = urlObj.pathname.match(/\/(?:embed|v|shorts)\/([a-zA-Z0-9_-]{11})/);
        if (pathMatch) return pathMatch[1];
      }

      if (hostname === "youtu.be") {
        const pathId = urlObj.pathname.slice(1).split("/")[0].split("?")[0];
        if (pathId && pathId.length === 11) return pathId;
      }
    } catch {
      // Ignore URL parsing errors, proceed to regex
    }

    // 3. Fallback regular expressions
    const patterns = [
      /[?&]v=([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/|youtube\.com\/(?:embed|v|shorts)\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
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

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) =>
      String.fromCodePoint(parseInt(dec, 10))
    );
}

/**
 * Direct InnerTube caption fetcher fallback if YoutubeTranscript library fails.
 */
async function fetchTranscriptDirect(videoId: string): Promise<TranscriptSegment[]> {
  const resp = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: "ANDROID",
          clientVersion: "20.10.38",
        },
      },
      videoId,
    }),
  });

  if (!resp.ok) {
    throw new Error(`InnerTube request failed: ${resp.status}`);
  }

  const data = await resp.json();
  const captionTracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!Array.isArray(captionTracks) || captionTracks.length === 0) {
    throw new Error("No caption tracks available.");
  }

  // Prefer English, otherwise take the first track
  const track =
    captionTracks.find(
      (t: { languageCode?: string }) =>
        t.languageCode === "en" || t.languageCode?.startsWith("en")
    ) ?? captionTracks[0];

  const trackResp = await fetch(track.baseUrl, {
    headers: {
      "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
    },
  });

  if (!trackResp.ok) {
    throw new Error(`Failed to download caption track: ${trackResp.status}`);
  }

  const xml = await trackResp.text();
  const results: TranscriptSegment[] = [];

  // Parse srv3 format (<p t="ms" d="ms">...)
  const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let pMatch;
  while ((pMatch = pRegex.exec(xml)) !== null) {
    const startMs = parseInt(pMatch[1], 10);
    const durMs = parseInt(pMatch[2], 10);
    const inner = pMatch[3];
    let text = "";
    const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
    let sMatch;
    while ((sMatch = sRegex.exec(inner)) !== null) {
      text += sMatch[1];
    }
    if (!text) {
      text = inner.replace(/<[^>]+>/g, "");
    }
    text = decodeHtmlEntities(text).trim();
    if (text) {
      results.push({
        text,
        offset: startMs,
        duration: durMs,
      });
    }
  }

  if (results.length > 0) return results;

  // Fallback to classic format (<text start="s" dur="s">)
  const textRegex = /<text\s+start="([^"]*)"\s+dur="([^"]*)"[^>]*>([\s\S]*?)<\/text>/g;
  let tMatch;
  while ((tMatch = textRegex.exec(xml)) !== null) {
    const offset = Math.round(parseFloat(tMatch[1]) * 1000);
    const duration = Math.round(parseFloat(tMatch[2]) * 1000);
    const text = decodeHtmlEntities(tMatch[3].replace(/<[^>]+>/g, "")).trim();
    if (text) {
      results.push({ text, offset, duration });
    }
  }

  return results;
}

/**
 * Fetches the transcript for a YouTube video.
 */
export async function fetchTranscript(
  videoId: string
): Promise<TranscriptSegment[]> {
  try {
    const customFetch: typeof fetch = (url, init) => {
      const headers = new Headers(init?.headers);
      headers.set(
        "User-Agent",
        "com.google.android.youtube/20.10.38 (Linux; U; Android 14)"
      );
      return fetch(url, { ...init, headers });
    };

    const rawItems = await YoutubeTranscript.fetchTranscript(videoId, {
      fetch: customFetch,
    });
    return rawItems.map((item) => ({
      text: item.text,
      offset: item.offset,
      duration: item.duration,
    }));
  } catch {
    // Attempt direct fallback
    try {
      const fallbackSegments = await fetchTranscriptDirect(videoId);
      if (fallbackSegments.length > 0) {
        return fallbackSegments;
      }
    } catch {
      // Fall through to error
    }

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
