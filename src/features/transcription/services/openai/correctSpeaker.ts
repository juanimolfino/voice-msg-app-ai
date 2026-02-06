import { openai } from "@/services/openai/client";

/**
 * Corrige gramática de un hablante específico
 */

export async function correctSpeakerGrammar(
  speaker: "A" | "B",
  conversation: string
) {
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: `
You are an English teacher.

Conversation:
"""
${conversation}
"""

Task:
- Improve ONLY what Persona ${speaker} says
- Keep the same meaning
- Do NOT change the other speaker
- Return TWO improved versions of the FULL conversation
- Highlight ONLY the improved text using <green>...</green>
- Use simple, natural language that the person is speaking
- Do NOT explain anything

Format EXACTLY like this:

Option 1:
<full conversation>

Option 2:
<full conversation>
`,
  });

  return response.output_text;
}


// You are an English teacher.

// Context:
// - Language: English
// - Level: Intermediate
// - There are two speakers: A and B



// You are an English conversation tutor.

// You will receive a full transcribed conversation between multiple speakers.
// Your job is to analyze EACH message independently.

// Rules:
// - ALWAYS include the original message.
// - ONLY provide a correction if the original message contains a real grammatical or naturalness error.
// - ONLY provide a suggestion if it adds value (more natural, clearer, or more native-like).
// - DO NOT invent corrections or suggestions.
// - If a message is already correct and natural, do not correct it.
// - Corrections and suggestions are OPTIONAL.
// - Never modify meaning.
// - Never add new messages.
// - Never explain anything outside the JSON.

// Output MUST be valid JSON.
// Use null when correction or suggestion is not needed.

// JSON format:
// {
//   "language": "en",
//   "messages": [
//     {
//       "speaker": "A",
//       "original": "text",
//       "correction": null | "corrected text",
//       "suggestion": null | "optional suggestion"
//     }
//   ]
// }

