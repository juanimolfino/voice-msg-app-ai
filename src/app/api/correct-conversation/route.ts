// src/app/api/correct-conversation/route.ts
import { NextResponse } from "next/server";
import { correctSpeakerGrammar } from "@/features/transcription/services/kimi/correctConversation";
import { requireAuth } from "@/services/auth/requireAuth";
// 👉 Importamos spendCredit para gastar AL FINAL, y refundCredit por si falla
import { spendCredit, refundCredit } from "@/services/credits/creditsService";
// 👉 Importamos revalidateCreditsCache para invalidar cache
import { revalidateCreditsCache } from "@/services/credits/getCreditsAction";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // ✅ Verificar sesión
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  if (!auth.userId) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }
  
  const userId = auth.userId;

  try {
    const body = await req.json();
    const { language, level, correct, conversation } = body;

    if (!language || !level || !correct || !conversation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 👉 GASTAR CRÉDITO: Solo al final, cuando todo está listo para procesar
    const spent = await spendCredit(userId);
    
    if (!spent) {
      // Esto no debería pasar porque las APIs anteriores ya verificaron,
      // pero por seguridad lo manejamos
      return NextResponse.json(
        { error: "No se pudo procesar el crédito. Intentá de nuevo." },
        { status: 500 }
      );
    }

    // 👉 INVALIDAR CACHE: Marcamos que los créditos cambiaron
    await revalidateCreditsCache();

    // 👉 Procesar con Kimi (ahora sí, ya cobramos)
    const result = await correctSpeakerGrammar({
      language,
      level,
      correct,
      conversation,
    });

    console.log("API route: AI correction result:", result);

    return NextResponse.json({
      ...result,
      // 👉 Flag para que el frontend sepa que se gastó un crédito
      creditSpent: true
    });
    
  } catch (err) {
    // 👉 REEMBOLSO: Si falla la corrección, devolvemos el crédito
    // porque el usuario no recibió el resultado que pagó
    await refundCredit(userId);
    
    // 👉 También invalidamos cache al reembolsar
    await revalidateCreditsCache();
    
    console.error("Correction error:", err);
    
    return NextResponse.json(
      { error: "AI correction failed" },
      { status: 500 },
    );
  }
}