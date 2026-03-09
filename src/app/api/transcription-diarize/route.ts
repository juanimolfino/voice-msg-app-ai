import { NextResponse } from "next/server"; // 👉 Herramienta de Next.js para devolver respuestas HTTP
import { transcribeDiarizedAudio } from "@/features/transcription/services/openai/transcribeDiarized";
// 👉 Service
// 📡 Habla con OpenAI
// 🎧 Recibe audio
// 📄 Devuelve transcripción técnica

// 💡 No decide nada, solo ejecuta
import { mapDiarizedToConversation } from "@/features/transcription/domain/conversation/conversation.mapper"; // Esta es la clave

// 👉 Convierte datos técnicos
// 👉 en datos del negocio

import { requireAuth } from "@/services/auth/requireAuth";
import { checkCredits, spendCredit, refundCredit } from "@/services/credits/creditsService";

export async function POST(req: Request) {


// ✅ VERIFICAR SESIÓN
  const auth = await requireAuth();
  if (!auth.success) return auth.response;
   // ✅ Verificación explícita de userId
  if (!auth.userId) {
    return NextResponse.json(
      { error: "Sesión inválida" },
      { status: 401 }
    );
  }
  
  const userId = auth.userId; // Lo usaremos para créditos en el futuro

// ----//
 // 2. Verificar créditos
  const hasCredits = await checkCredits(userId);
  if (!hasCredits) {
    return NextResponse.json(
      { error: "Sin créditos disponibles. Actualizá a Pro o comprá más." },
      { status: 402 } // Payment Required
    );
  }



  const formData = await req.formData();
  const audioFile = formData.get("audio") as File | null; // 📌 as File | null
// Porque TS no confía en que exista 😅
// TS SIEMPRE te obliga a cubrir errores posibles 🛡️

  if (!audioFile) {
    return NextResponse.json(
      { error: "No audio file provided" },
      { status: 400 }
    );
  }

  try {
     // 3. Descontar crédito ANTES de procesar
    const spent = await spendCredit(userId);
    if (!spent) {
      return NextResponse.json(
        { error: "No se pudo procesar el crédito" },
        { status: 500 }
      );
    }

    // 4. Procesar audio con OpenAI
    const diarized = await transcribeDiarizedAudio(audioFile); //le doy el audio a openai y me devuevle la transcripción técnica con diarización

//     resultado
//     {
//   text: "...",
//   segments: [
//     { speaker: "spk_0", text: "hello" }
//     { speaker: "spk_1", text: "hi there" }]
//    } AUN NO SIRVE PARA LA UI

    const { rawText, conversation } =
      mapDiarizedToConversation(diarized.segments); // mentalmente hace esto: 
      
      
// OpenAI speaker IDs
// ↓
// Mapeo A / B
// ↓
// Texto legible
// ↓
// Conversación lista para UI

// output del domain:
// {
//   rawText: "Hi Hello",
//   conversation: `
// Persona A:
// - Hi
// Persona B:
// - Hello
// `
// }

    return NextResponse.json({ rawText, conversation });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error";

    console.error("Transcription error:", message);
    // Si falla la última API, reembolsar el crédito
      await refundCredit(userId);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

//CONCLUSION: 
// 👉 El endpoint no piensa
// 👉 El domain piensa

//🧠 Idea clave (una frase)

// El domain define QUÉ es tu mundo
// El mapper define CÓMO entra o sale información de ese mundo