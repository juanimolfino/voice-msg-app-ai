import { openai } from "./client";

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
- Use simple, natural English
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
