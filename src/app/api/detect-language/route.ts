// src/app/api/detect-language/route.ts
import { NextRequest, NextResponse } from "next/server";
import { detectLanguageWithKimi } from "@/features/transcription/services/kimi/detectLanguage";
import { requireAuth } from "@/services/auth/requireAuth";

export async function POST(request: NextRequest) {
  // ✅ Verificar sesión
  const auth = await requireAuth();
  if (!auth.success) return auth.response;
  
  if (!auth.userId) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }
  
  // 👉 NO verificamos créditos aquí, ya lo hizo la primera API
  // Si llegó hasta acá, es porque tiene créditos disponibles
  
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const language = await detectLanguageWithKimi(text);

    return NextResponse.json({ language });
    
  } catch (error) {
    console.error("Error detecting language:", error);
    // 👉 NO reembolsamos porque NO gastamos todavía
    return NextResponse.json(
      { error: "Failed to detect language" },
      { status: 500 },
    );
  }
}