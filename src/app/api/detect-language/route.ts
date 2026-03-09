import { NextRequest, NextResponse } from "next/server";
import { detectLanguageWithKimi } from "@/features/transcription/services/kimi/detectLanguage";

import { requireAuth } from "@/services/auth/requireAuth";
import { refundCredit } from "@/services/credits/creditsService";

export async function POST(request: NextRequest) {
  // ✅ Verificar sesión
  const auth = await requireAuth();
  if (!auth.success) return auth.response;
  // ✅ Verificación explícita de userId
  if (!auth.userId) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }
  const userId = auth.userId; // Ahora es string garantizado
  try {
    const { text } = await request.json();

    if (!text) {
      // Si falla la última API, reembolsar el crédito
      await refundCredit(userId);
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const language = await detectLanguageWithKimi(text);

    return NextResponse.json({ language });
  } catch (error) {
    console.error("Error detecting language:", error);
        // Si falla la última API, reembolsar el crédito
      await refundCredit(userId);
    return NextResponse.json(
      { error: "Failed to detect language" },
      { status: 500 },
    );
  }
}
