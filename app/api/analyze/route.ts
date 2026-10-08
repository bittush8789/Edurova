import { NextRequest, NextResponse } from "next/server";
import {
  extractVideoId,
  fetchVideoInfo,
  fetchTranscript,
  transcriptToText,
} from "@/lib/youtube";
import { generateVideoAnalysis } from "@/lib/groq";

export const maxDuration = 60; // Vercel timeout

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Please provide a YouTube URL." },
        { status: 400 }
      );
    }

    // 1. Extract video ID
    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      return NextResponse.json(
        {
          error:
            "Invalid YouTube URL. Please paste a valid YouTube video link.",
        },
        { status: 400 }
      );
    }

    // 2. Fetch video info
    let videoInfo;
    try {
      videoInfo = await fetchVideoInfo(videoId);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch video info.";
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    // 3. Fetch transcript
    let transcript;
    try {
      transcript = await fetchTranscript(videoId);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Transcript unavailable for this video.";
      return NextResponse.json({ error: msg }, { status: 422 });
    }

    if (transcript.length === 0) {
      return NextResponse.json(
        {
          error:
            "This video has an empty transcript. Please try another video.",
        },
        { status: 422 }
      );
    }

    // 4. Convert to text
    const rawTranscript = transcriptToText(transcript);

    // 5. Check API key
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes("your_groq_api_key_here")) {
      return NextResponse.json(
        { error: "Groq API key not configured. Please set a valid GROQ_API_KEY in .env.local to enable AI analysis." },
        { status: 500 }
      );
    }

    // 6. Generate AI analysis
    let analysis;
    try {
      analysis = await generateVideoAnalysis(rawTranscript, videoInfo.title);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "AI analysis failed.";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({
      videoInfo,
      transcript,
      analysis,
      rawTranscript,
    });
  } catch (err) {
    console.error("[/api/analyze] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
