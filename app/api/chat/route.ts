import { NextRequest } from "next/server";
import { chatWithVideo } from "@/lib/groq";
import type { ChatRequest } from "@/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, history, transcript, videoTitle } = body;

    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: "Please enter a message." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "The AI assistant is temporarily unavailable." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = await chatWithVideo(
      message,
      history ?? [],
      transcript ?? "",
      videoTitle ?? "this video"
    );

    // Stream the response as Server-Sent Events
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
          }
        } catch (err) {
          console.error("[/api/chat] Stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[/api/chat] Error:", err);
    return new Response(
      JSON.stringify({ error: "Chat failed. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
