import { NextRequest, NextResponse } from "next/server";
import { generateStudySet } from "@/lib/groq";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { transcript, videoTitle } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Transcript is required to create a quiz and flashcards." },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI service is currently not ready. Please try again shortly." },
        { status: 500 }
      );
    }

    const studySet = await generateStudySet(
      transcript,
      videoTitle || "Educational Video"
    );

    return NextResponse.json(studySet);
  } catch (err) {
    console.error("[/api/generate-quiz] Error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to generate quiz and flashcards. Please try again.",
      },
      { status: 500 }
    );
  }
}
