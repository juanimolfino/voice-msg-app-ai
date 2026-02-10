import { NextResponse } from "next/server";
import { correctSpeakerGrammar } from "@/features/transcription/services/openai/correctConversation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { language, level, correct, conversation } = body;

    if (!language || !level || !correct || !conversation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await correctSpeakerGrammar({
      language,
      level,
      correct,
      conversation,
    });

    console.log("API route: AI correction result:", result);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "AI correction failed", err },
      { status: 500 },
    );
  }
}
