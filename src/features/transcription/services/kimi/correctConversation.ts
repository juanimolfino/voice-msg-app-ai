import { buildCorrectionPrompt } from "../prompts/correction-prompt";
// import { openai } from "@/services/openai/client"; // ❌ ELIMINADO: OpenAI client
import { kimiChatCompletion } from "../../../../services/kimi/client"; // ✅ NUEVO: Kimi client

//* 🧼 Regla de oro
// Services → devuelven objetos
// API routes → devuelven NextResponse

export async function correctSpeakerGrammar(input: {
  conversation: string;
  language: string;
  level: string;
  correct: { A: boolean; B: boolean };
}) {
  const { conversation, language, level, correct } = input;

  if (!conversation || !language || !level || !correct) {
    throw new Error("Missing required fields");
  }

  const prompt = buildCorrectionPrompt({
    conversation,
    language,
    level,
    correct,
  });

  console.log("Generated prompt for AI correction:", prompt);

  try {
    // ✅ NUEVO: Usar Kimi API en lugar de OpenAI
    const response = await kimiChatCompletion({
      model: "kimi-k2-0711-preview", // Kimi 2.5 - excelente para correcciones gramaticales
      // Alternativas: "kimi-latest" (siempre último), "kimi-k1" (razonamiento profundo)
      temperature: 0.2, // Bajo para consistencia en formato JSON
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" }, // ✅ NUEVO: Forzar JSON estricto (más confiable que OpenAI)
    });

    console.log("Kimi API response status:", response.choices[0]?.finish_reason);

    // ✅ NUEVO: Extraer contenido de la respuesta de Kimi
    const text = response.choices[0]?.message?.content;

    if (!text) {
      throw new Error("Empty response from Kimi API");
    }

    const json = JSON.parse(text);

    if (!json || !json.messages) {
      throw new Error("Response missing required fields");
    }

    return json;
  } catch (err) {
    console.error("AI correction error:", err);
    // Diferenciar errores de parsing vs API
    if (err instanceof SyntaxError) {
      throw new Error("Response was not valid JSON");
    }
    throw err;
  }
}
