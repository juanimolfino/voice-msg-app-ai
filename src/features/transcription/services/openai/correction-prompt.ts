// type Speaker = "A" | "B";

// export function buildCorrectionPrompt(input: {
//   language: string;
//   level: "beginner" | "intermediate" | "advanced";
//   correct: { A: boolean; B: boolean };
//   messages: { speaker: Speaker; text: string }[];
// }) {
//   return `
// You are a language teacher.

// Language: ${input.language}
// Level: ${input.level}

// Rules:
// - Only correct speakers that are enabled:
//   - Speaker A: ${input.correct.A ? "YES" : "NO"}
//   - Speaker B: ${input.correct.B ? "YES" : "NO"}
// - ALWAYS keep the original sentence.
// - Only provide a correction if the sentence is wrong or unnatural.
// - If no correction is needed, set correction = null.
// - Provide a suggestion ONLY if it adds value.
// - Do NOT invent mistakes.
// - Keep the same meaning.
// - Be concise and natural.

// Return ONLY valid JSON.
// No explanations.
// No markdown.

// Expected JSON format:

// {
//   "messages": [
//     {
//       "speaker": "A",
//       "original": "text",
//       "correction": "text or null",
//       "suggestion": "text or null"
//     }
//   ]
// }

// Conversation:
// ${input.messages
//   .map((m) => `Speaker ${m.speaker}: ${m.text}`)
//   .join("\n")}
// `;
// }

export function buildCorrectionPrompt(input: {
  conversation: string;
  language: string;
  level: string;
  correct: { A: boolean; B: boolean };
}) {
  return `
You are a ${input.language} grammar checker.

Your job is to detect ONLY objective grammar errors. But you MUST to keep the same conversation, only correcting the sentences of the speakers that are enabled for correction. Also, you can provide suggestions if they add value, but they are optional.

Language level: ${input.level}

Conversation:
"""
${input.conversation}
"""

STRICT RULES (VERY IMPORTANT):
- Correct ONLY objective grammar errors (wrong tense, wrong word, pluralization, agreement).
- If a sentence is understandable and natural, correction MUST be null.
- Suggestions are OPTIONAL and ONLY if they keep EXACT meaning, but it has to be a valid alternative.
- NEVER rephrase questions into different intentions.
- NEVER invent mistakes.\

Speaker correction rules:
- Speaker A: ${input.correct.A ? "CAN be corrected" : "MUST NEVER be corrected"}
- Speaker B: ${input.correct.B ? "CAN be corrected" : "MUST NEVER be corrected"}

Output format (JSON ONLY):

{
  "messages": [
    {
      "speaker": "A | B",
      "original": "original sentence EXACT",
      "correction": "corrected sentence or null",
      "suggestion": "alternative sentence with SAME meaning or null"
    }
  ]
}

FINAL RULES:
- Keep original text EXACT
- Preserve order
- If unsure, DO NOT correct
- Return ONLY valid JSON
- No text before or after JSON
- Use null, not ""
- Do not explain anything

`;
}

