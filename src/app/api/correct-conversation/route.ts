import { NextResponse } from "next/server";
import { correctSpeakerGrammar } from "@/features/transcription/services/kimi/correctConversation";

import { requireAuth } from "@/services/auth/requireAuth";
import { refundCredit } from "@/services/credits/creditsService";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // ✅ Verificar sesión
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  // ✅ Verificación explícita de userId
  if (!auth.userId) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }
  const userId = auth.userId; // Para reembolso si falla
  try {
    const body = await req.json();

    const { language, level, correct, conversation } = body;

    if (!language || !level || !correct || !conversation) {
      // Si falla la última API, reembolsar el crédito
      await refundCredit(userId);
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
    // Si falla la última API, reembolsar el crédito
    await refundCredit(userId);
    return NextResponse.json(
      { error: "AI correction failed", err },
      { status: 500 },
    );
  }
}
