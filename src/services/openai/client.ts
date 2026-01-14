/**
 * OpenAI client singleton
 * Nunca importar OpenAI directamente en routes o componentes
 */

import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
