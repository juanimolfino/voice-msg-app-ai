/**
 * Kimi API client (Moonshot AI)
 * Documentación: https://platform.moonshot.cn/docs
 */

interface KimiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface KimiResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Cliente simple para Kimi API - no necesita librería externa
export async function kimiChatCompletion(params: {
  model: string;
  messages: KimiMessage[];
  temperature?: number;
  response_format?: { type: "json_object" };
}): Promise<KimiResponse> {
  
  const response = await fetch("https://api.moonshot.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.KIMI_API_KEY!}`,
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.2,
      response_format: params.response_format,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kimi API error: ${response.status} - ${error}`);
  }

  return response.json();
}
