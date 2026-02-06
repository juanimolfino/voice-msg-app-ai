"use client";

import { useMemo, useState } from "react";

import { useTranscription } from "@/features/transcription/hooks/useTranscription";
import { useGrammarCorrection } from "@/features/transcription/hooks/useGrammarCorrection";

import { AudioSourceSelector } from "@/features/transcription/ui/audio/AudioSourceSelector";
import { ConversationView } from "@/features/transcription/ui/audio/ConversationView";
import { SpeakerSelector } from "@/features/transcription/ui/audio/SpeakerSelector";
import { CorrectedConversationView } from "@/features/transcription/ui/language/CorrectedConversationView";

type Speaker = "A" | "B";

type CorrectedMessage = {
  speaker: Speaker;
  original: string;
  correction: string | null;
  suggestion: string | null;
};

type CorrectionResult = {
  messages: CorrectedMessage[];
};

export function TranscriptionContainer() {
  /**
   * 🔹 Transcripción (NO TOCAR)
   */
  const {
    audio,
    rawText,
    conversation,
    status,
    error,
    onAudioReady,
    sendAudio,
    discardAudio,
  } = useTranscription();

  /**
   * 🔹 Corrección AI
   */
  const { correctConversation, loading } = useGrammarCorrection();

  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker>("A");

  const [correctionResult, setCorrectionResult] =
    useState<CorrectionResult | null>(null);

  /**
   * URL para escuchar audio
   */
  const audioUrl = useMemo(() => {
    if (!audio) return null;
    return URL.createObjectURL(audio);
  }, [audio]);

  /**
   * Acción: pedir corrección a la AI
   */
  async function onCorrect() {
    if (!conversation) return;

    const result = await correctConversation({
      conversation,
      language: "english",
      level: "intermediate",
      correct: {
        // A: selectedSpeaker === "A",
        // B: selectedSpeaker === "B",
        A: true,
        B: true,
      },
    });

    setCorrectionResult(result);
    console.log("TranscriptionContainer: AI correction result:", result);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {status === "idle" && (
        <>
          <p className="text-sm text-gray-500">
            🎧 Subí un audio o grabá uno para empezar
          </p>
          <AudioSourceSelector onAudioReady={onAudioReady} />
        </>
      )}

      {status === "ready" && audioUrl && (
        <div className="space-y-2">
          <audio controls src={audioUrl} className="w-full" />
          <div className="flex gap-2">
            <button
              onClick={sendAudio}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Enviar a transcribir
            </button>
            <button
              onClick={discardAudio}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {status === "sending" && (
        <p className="text-sm text-gray-500">🧠 Transcribiendo audio...</p>
      )}

      {status === "error" && (
        <div className="space-y-2">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={discardAudio}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Volver a intentar
          </button>
        </div>
      )}

      {status === "done" && (
        <>
          {audioUrl && <audio controls src={audioUrl} className="w-full" />}

          <ConversationView rawText={rawText} conversation={conversation} />

          <SpeakerSelector
            speaker={selectedSpeaker}
            onChange={setSelectedSpeaker}
            onCorrect={onCorrect}
            loading={loading}
          />

          {correctionResult && (
            <CorrectedConversationView messages={correctionResult.messages} />
          )}

          <button
            onClick={() => {
              discardAudio()
              setCorrectionResult(null)
            }}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Transcribir otro audio
          </button>
        </>
      )}
    </div>
  );
}
