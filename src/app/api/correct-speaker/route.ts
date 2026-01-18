import { NextResponse } from "next/server";
import { correctSpeakerGrammar } from "@/features/transcription/services/openai/correctSpeaker";

export async function POST(req: Request) {
  const { speaker, conversation } = await req.json();

  if (!speaker || !conversation) {
    return NextResponse.json(
      { error: "Missing speaker or conversation" },
      { status: 400 }
    );
  }

  try {
    const result = await correctSpeakerGrammar(speaker, conversation);

    return NextResponse.json({ result });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error";

    console.error("Correction error:", message);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
