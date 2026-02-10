

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
// } // open ai

export function buildCorrectionPrompt(input: {
  conversation: string;
  language: string;
  level: string;
  correct: { A: boolean; B: boolean };
}) {
  return `
You are a strict ${input.language} grammar checker for ${input.level} level students.

Analyze the FULL CONVERSATION CONTEXT before correcting. Pay special attention to:
- Verb tense consistency throughout the dialogue
- Subject-verb agreement across turns
- Pronoun references (he/she/it/they) matching previous mentions
- Time expressions (yesterday, tomorrow, now) matching verb tenses
- Question formation (word order: Why are you...? not Why you are...?)

Conversation:
"""
${input.conversation}
"""

STRICT RULES:

**CONTEXT-AWARE CORRECTIONS:**
- Read the entire conversation first, then correct
- If Speaker A says "yesterday", Speaker B's response must use past tense
- If discussing a past event, maintain past tense consistency
- "Why you are..." → "Why are you..." (question word order)
- "there's many" → "there are many" (plural agreement)
- "we and you and I" → "you and I" (remove redundant pronouns)

**For SUGGESTIONS:**
- Provide when the sentence is correct but could be more natural/idiomatic
- Suggest vocabulary slightly above ${input.level} level to help improvement
- Examples:
  - "Good." → "I'm doing great, thanks!"
  - "Why are you so beautiful?" → "What makes you so beautiful?"

**Speaker rules:**
- Speaker A: ${input.correct.A ? "CAN be corrected and suggested" : "MUST NEVER be corrected or suggested"}
- Speaker B: ${input.correct.B ? "CAN be corrected and suggested" : "MUST NEVER be corrected or suggested"}

Output format (JSON ONLY):

{
  "messages": [
    {
      "speaker": "A | B",
      "original": "original sentence EXACT",
      "correction": "corrected sentence or null",
      "suggestion": "more natural alternative or null"
    }
  ]
}

FINAL RULES:
- Keep original text EXACT - copy-paste it
- Preserve order of messages
- If unsure, DO NOT correct (set null)
- Suggestion must be DIFFERENT from correction
- Return ONLY valid JSON
- No text before or after JSON
- Use null, not ""
`;
}

