// src/app/api/transcription-diarize/route.ts
import { NextResponse } from "next/server";
import { transcribeDiarizedAudio } from "@/features/transcription/services/openai/transcribeDiarized";
import { mapDiarizedToConversation } from "@/features/transcription/domain/conversation/conversation.mapper";
import { requireAuth } from "@/services/auth/requireAuth";
// 👉 Solo importamos canProcessConversation para VERIFICAR, no gastamos aquí
import { canProcessConversation } from "@/services/credits/creditsService";

export async function POST(req: Request) {
  // ✅ VERIFICAR SESIÓN
  const auth = await requireAuth();
  if (!auth.success) return auth.response;
  
  if (!auth.userId) {
    return NextResponse.json(
      { error: "Sesión inválida" },
      { status: 401 }
    );
  }
  
  const userId = auth.userId;

  // 👉 SOLO VERIFICAMOS que tiene créditos disponibles
  // NO gastamos todavía, esperamos a que todo el pipeline termine
  const check = await canProcessConversation(userId);
  
  if (!check.allowed) {
    return NextResponse.json(
      { 
        error: check.reason || "Sin créditos disponibles. Actualizá a Pro o comprá más.",
        code: "INSUFFICIENT_CREDITS",
        action: "UPGRADE_OR_BUY"
      },
      { status: 402 }
    );
  }

  const formData = await req.formData();
  const audioFile = formData.get("audio") as File | null;

  if (!audioFile) {
    return NextResponse.json(
      { error: "No audio file provided" },
      { status: 400 }
    );
  }

  try {
    // 👉 Procesar audio con OpenAI (SIN gastar crédito)
    const diarized = await transcribeDiarizedAudio(audioFile);
    const { rawText, conversation } = mapDiarizedToConversation(diarized.segments);

    return NextResponse.json({ 
      rawText, 
      conversation,
      // 👉 Devolvemos el source para que el frontend sepa de dónde vendrá el gasto
      creditSource: check.source // 'free' | 'included' | 'purchased' | 'unlimited'
    });
    
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Transcription error:", message);
    
    // 👉 NO hay reembolso porque NO gastamos todavía
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}