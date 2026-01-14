import { NextResponse } from "next/server"; // 👉 Herramienta de Next.js para devolver respuestas HTTP
import { transcribeDiarizedAudio } from "@/services/openai/transcribeDiarized"; 
// 👉 Service
// 📡 Habla con OpenAI
// 🎧 Recibe audio
// 📄 Devuelve transcripción técnica

// 💡 No decide nada, solo ejecuta
import { mapDiarizedToConversation } from "@/domain/conversation/conversation.mapper"; // Esta es la clave

// 👉 Convierte datos técnicos
// 👉 en datos del negocio


export async function POST(req: Request) {
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