import { openai } from "@/services/openai/client";
import { DiarizedTranscription } from "@/services/openai/types/openai";

/**
 * Llama a OpenAI para STT con diarización
 * No procesa dominio
 */

export async function transcribeDiarizedAudio(file: File) {
  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "gpt-4o-transcribe-diarize",
    response_format: "diarized_json",
    chunking_strategy: "auto",
  });

  return transcription as unknown as DiarizedTranscription;
}
