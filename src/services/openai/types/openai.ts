/**
 * Tipos NO oficiales de OpenAI
 * (hasta que el SDK los incluya)
 */

export type DiarizedSegment = {
  speaker: string;
  text: string;
  start?: number;
  end?: number;
};

export type DiarizedTranscription = {
  text: string;
  segments: DiarizedSegment[];
};

export type AnalyzeConversationInput = {
  language: string;
  level: "beginner" | "intermediate" | "advanced";
  conversation: string;
};