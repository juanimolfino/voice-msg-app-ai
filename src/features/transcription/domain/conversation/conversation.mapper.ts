import { DiarizedSegment } from "@/services/openai/types/openai";
import { Speaker } from "./conversation.types";

/**
 * Convierte speakers reales en A / B
 * Dominio puro, reusable en web / mobile / backend
 * 
 * Tu app NO trata de OpenAI
Tu app trata de:

🟢 Conversaciones entre personas
🟢 Hablantes A y B
🟢 Corrección de lenguaje

👉 Eso es tu domain



📌 OpenAI habla así:

{ speaker: "spk_0", text: "hello" }


📌 Tu app quiere:

Persona A:
- hello


🔥 Ese puente mental es el mapper


 */

// mapDiarizedToConversation
// 👉 Traduce algo técnico (OpenAI)
// 👉 a algo que tu app entiende

export function mapDiarizedToConversation(
  segments: DiarizedSegment[]
): {
  rawText: string;
  conversation: string;
} {

    console.log("Mapping diarized segments:", segments);

  const speakerMap: Record<string, Speaker> = {};
  let speakerIndex = 0;

  let rawText = "";
  let conversation = "";

  for (const segment of segments) {
    rawText += segment.text + " ";

    if (!speakerMap[segment.speaker]) {
      speakerMap[segment.speaker] = speakerIndex === 0 ? "A" : "B";
      speakerIndex++;
    }

    const persona = speakerMap[segment.speaker];
    conversation += `Persona ${persona}:\n- ${segment.text}\n\n`;
  }

  return {
    rawText: rawText.trim(),
    conversation: conversation.trim(),
  };
}
