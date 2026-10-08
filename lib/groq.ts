import Groq from "groq-sdk";
import type { VideoAnalysis, Chapter, StudySet } from "@/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/** Active model — override via GROQ_MODEL env var */
const MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";

export { groq };

/**
 * Generates a structured video analysis from the transcript text.
 * Uses JSON mode for reliable parsing.
 */
export async function generateVideoAnalysis(
  transcript: string,
  videoTitle: string
): Promise<VideoAnalysis> {
  // Trim transcript to avoid token limits (~6000 words)
  const words = transcript.split(/\s+/);
  const trimmed =
    words.length > 6000 ? words.slice(0, 6000).join(" ") + "..." : transcript;

  const prompt = `You are an expert educational content analyst. Analyze the following YouTube video transcript and generate a comprehensive study guide.

Video Title: "${videoTitle}"

Transcript:
${trimmed}

Respond ONLY with valid JSON matching this exact schema (no markdown, no extra text):
{
  "shortSummary": "A 2-3 sentence overview of the entire video",
  "detailedSummary": "A detailed 150-250 word explanation of all major topics covered",
  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3", "takeaway 4", "takeaway 5"],
  "importantConcepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5"],
  "chapters": [
    {
      "title": "Chapter Title",
      "timestamp": "00:00",
      "description": "Short 1-2 sentence description",
      "startSeconds": 0
    }
  ]
}

Rules:
- keyTakeaways: 5-8 bullet points, each a complete actionable sentence
- importantConcepts: 4-8 key terms/concepts from the video
- chapters: 4-10 logical sections with meaningful titles, realistic timestamps based on transcript flow
- All content must be grounded in the transcript
- Respond with ONLY the JSON object`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 3000,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("AI returned an empty response.");

  try {
    const parsed = JSON.parse(content) as VideoAnalysis;

    // Validate & sanitize
    return {
      shortSummary: parsed.shortSummary || "Summary not available.",
      detailedSummary: parsed.detailedSummary || "Details not available.",
      keyTakeaways: Array.isArray(parsed.keyTakeaways)
        ? parsed.keyTakeaways
        : [],
      importantConcepts: Array.isArray(parsed.importantConcepts)
        ? parsed.importantConcepts
        : [],
      chapters: Array.isArray(parsed.chapters)
        ? (parsed.chapters as Chapter[])
        : [],
    };
  } catch {
    throw new Error("Failed to parse AI response. Please try again.");
  }
}

/**
 * Generates a streaming chat response grounded in the transcript.
 */
export async function chatWithVideo(
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  transcript: string,
  videoTitle: string
): Promise<AsyncIterable<{ choices: Array<{ delta?: { content?: string | null } }> }>> {
  // Trim transcript for chat context (~4000 words)
  const words = transcript.split(/\s+/);
  const trimmedTranscript =
    words.length > 4000 ? words.slice(0, 4000).join(" ") + "..." : transcript;

  const systemPrompt = `You are VideoMind AI, an intelligent assistant that helps users understand YouTube videos.

You have access to the full transcript of the video titled: "${videoTitle}"

TRANSCRIPT:
${trimmedTranscript}

RULES:
1. Answer questions ONLY based on the transcript content above.
2. If the answer is NOT found in the transcript, clearly state: "This information was not found in the video."
3. Be concise but thorough. Use bullet points for multi-part answers.
4. Quote or paraphrase specific parts of the transcript when relevant.
5. Be friendly and educational in tone.`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: userMessage },
  ];

  return groq.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.5,
    max_tokens: 1500,
    stream: true,
  });
}

/**
 * Generates an interactive Study Set (Flashcards + MCQ Quiz) grounded in the transcript.
 */
export async function generateStudySet(
  transcript: string,
  videoTitle: string
): Promise<StudySet> {
  const words = transcript.split(/\s+/);
  const trimmed =
    words.length > 5000 ? words.slice(0, 5000).join(" ") + "..." : transcript;

  const prompt = `You are a world-class teacher and learning coach. Analyze the following YouTube video transcript and generate an active learning study set consisting of:
1. 6 to 8 Flashcards covering the most crucial concepts, terminology, and insights.
2. 5 Multiple-Choice Questions (MCQ Quiz) with 4 options, the correct answer index (0-3), and a friendly explanation.

Video Title: "${videoTitle}"

Transcript:
${trimmed}

Respond ONLY with valid JSON matching this exact schema:
{
  "flashcards": [
    {
      "id": "card-1",
      "concept": "Core Concept Name or Topic",
      "question": "Clear, engaging question or prompt testing understanding",
      "answer": "Concise, easy-to-remember explanation (2-3 sentences)"
    }
  ],
  "quiz": [
    {
      "id": "q-1",
      "question": "Engaging multiple-choice question testing comprehension",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct based on the video"
    }
  ]
}

Rules:
- flashcards: 6 to 8 cards. Each question should prompt active recall.
- quiz: Exactly 5 questions. Make distractors plausible. correctIndex must be 0, 1, 2, or 3 matching the correct option.
- Keep language simple, clear, and friendly for non-technical learners.
- Output ONLY the JSON object.`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 3000,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("AI returned an empty response.");

  try {
    const parsed = JSON.parse(content) as StudySet;
    return {
      flashcards: Array.isArray(parsed.flashcards)
        ? parsed.flashcards.map((f, i) => ({
            id: f.id || `card-${i + 1}`,
            concept: f.concept || "Key Concept",
            question: f.question || "What is the key takeaway?",
            answer: f.answer || "See video notes.",
          }))
        : [],
      quiz: Array.isArray(parsed.quiz)
        ? parsed.quiz.map((q, i) => ({
            id: q.id || `q-${i + 1}`,
            question: q.question || "Question?",
            options:
              Array.isArray(q.options) && q.options.length === 4
                ? q.options
                : ["A", "B", "C", "D"],
            correctIndex:
              typeof q.correctIndex === "number" &&
              q.correctIndex >= 0 &&
              q.correctIndex < 4
                ? q.correctIndex
                : 0,
            explanation:
              q.explanation || "Correct based on the video explanation.",
          }))
        : [],
    };
  } catch {
    throw new Error("Failed to parse study set response.");
  }
}

