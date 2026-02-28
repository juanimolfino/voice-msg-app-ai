import { kimiChatCompletion } from "../../../../services/kimi/client";
/**
 * Detecta el idioma de un texto usando Kimi
 * Devuelve el idioma en inglés: 'english', 'spanish', 'french', etc.
 */
export async function detectLanguageWithKimi(text: string): Promise<string> {
  const prompt = `
Analyze this text and identify the language.
Respond with ONLY the language name in English, lowercase.
Examples: "english", "spanish", "french", "mandarin", "italian", "russian", "portuguese", "german", "japanese", "korean", "arabic", "hindi", etc.

Text: """
${text.slice(0, 500)}
"""

Language:
`;

  const response = await kimiChatCompletion({
    model: "kimi-k2-0711-preview",
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
    // max_tokens eliminado - no soportado por el tipo
  });

  const language = response.choices[0]?.message?.content?.trim().toLowerCase() || 'english';
  
  return language.replace(/[."']/g, '');
}