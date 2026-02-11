"use client";

import { useMemo, useState, useEffect, useRef } from "react";

import {
  saveSession,
  loadSession,
  clearSession,
} from "@/lib/localstorage/localsession";

import { useTranscription } from "@/features/transcription/hooks/useTranscription";
import { useGrammarCorrection } from "@/features/transcription/hooks/useGrammarCorrection";

import { AudioSourceSelector } from "@/features/transcription/ui/audio/AudioSourceSelector";
import { ConversationView } from "@/features/transcription/ui/audio/ConversationView";
import { SpeakerSelector } from "@/features/transcription/ui/audio/SpeakerSelector";
import { CorrectedConversationView } from "@/features/transcription/ui/language/CorrectedConversationView";

import {
  Speaker,
  CorrectionResult,
} from "../../domain/conversation/conversation.types";

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
    restoreSession,
  } = useTranscription();

  /**
   * 🔹 Corrección AI
   */
  const { correctConversation, loading } = useGrammarCorrection();

  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker>("A");

  const [correctionResult, setCorrectionResult] =
    useState<CorrectionResult | null>(null);

  const isRestoringRef = useRef(true);

  useEffect(() => {
    const stored = loadSession();
    if (!stored) {
      isRestoringRef.current = false;
      return;
    }

    console.log("Restoring session from localStorage", stored);

    if (stored.rawText) {
      restoreSession({
        rawText: stored.rawText,
        conversation: stored.conversation,
      });
      setCorrectionResult(stored.correctionResult);
    }
    // 🔑 importante
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!conversation && !correctionResult) return;
    if (isRestoringRef.current) return;

    saveSession({
      rawText,
      conversation,
      correctionResult,
    });
  }, [rawText, conversation, correctionResult]);

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
              onClick={() => {
                discardAudio();
                clearSession();
                setCorrectionResult(null);
              }}
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
            onClick={() => {
              discardAudio();
              clearSession();
              setCorrectionResult(null);
            }}
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
              discardAudio();
              clearSession();
              setCorrectionResult(null);
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
