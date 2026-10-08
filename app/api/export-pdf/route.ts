import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/lib/pdf";
import type { VideoInfo, VideoAnalysis, ChatMessage } from "@/types";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const {
      videoInfo,
      analysis,
      chatHistory,
    }: {
      videoInfo: VideoInfo;
      analysis: VideoAnalysis;
      chatHistory?: ChatMessage[];
    } = await req.json();

    if (!videoInfo || !analysis) {
      return NextResponse.json(
        { error: "Missing video data for PDF generation." },
        { status: 400 }
      );
    }

    const pdfBuffer = await generatePDF({ videoInfo, analysis, chatHistory });

    const filename = `Edurova-${videoInfo.title
      .replace(/[^a-zA-Z0-9]/g, "-")
      .slice(0, 50)}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err) {
    console.error("[/api/export-pdf] Error:", err);
    return NextResponse.json(
      { error: "PDF generation failed. Please try again." },
      { status: 500 }
    );
  }
}
