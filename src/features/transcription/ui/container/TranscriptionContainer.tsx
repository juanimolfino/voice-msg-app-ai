"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { usePersistentSession } from "../../hooks/usePersistentSession";

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

const SESSION_KEY = "transcription-session";

export function TranscriptionContainer() {
  const { isRestored, restoredData, save, clear } = usePersistentSession(SESSION_KEY);
  const skipNextSaveRef = useRef(false);

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

  const { correctConversation, loading } = useGrammarCorrection();

  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker>("A");
  const [correctionResult, setCorrectionResult] = useState<CorrectionResult | null>(null);

  // Efecto de restauración
  useEffect(() => {
    if (!isRestored || !restoredData) return;
    
    skipNextSaveRef.current = true;
    
    if (restoredData.rawText) {
      restoreSession({
        rawText: restoredData.rawText,
        conversation: restoredData.conversation,
      });
      setCorrectionResult(restoredData.correctionResult);
    }
  }, [isRestored, restoredData, restoreSession]);

  // Efecto de guardado
  useEffect(() => {
    if (!isRestored) return;
    if (!conversation && !correctionResult) return;
    
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    save({ rawText, conversation, correctionResult });
  }, [rawText, conversation, correctionResult, isRestored, save]);

  // URL del audio memoizada
  const audioUrl = useMemo(() => {
    if (!audio) return null;
    return URL.createObjectURL(audio);
  }, [audio]);

  // 🔹 Handler unificado de reset - MEMOIZADO
  const handleReset = useCallback(() => {
    discardAudio();
    clear();
    setCorrectionResult(null);
  }, [discardAudio, clear]); // dependencias: funciones del hook que no cambian

  // 🔹 Handler de corrección - MEMOIZADO
  const handleCorrect = useCallback(async () => {
    if (!conversation) return;

    const result = await correctConversation({
      conversation,
      language: "english",
      level: "intermediate",
      correct: { A: true, B: true },
    });

    setCorrectionResult(result);
  }, [conversation, correctConversation]); // dependencias: conversation y el hook

  // 🔹 Handler de enviar audio - MEMOIZADO
  const handleSendAudio = useCallback(() => {
    sendAudio();
  }, [sendAudio]);

  // Debug de status (podemos sacarlo después)
  useEffect(() => {
    console.log("📊 Status cambió a:", status);
  }, [status]);

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
              onClick={handleSendAudio}  // ← ahora es estable
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Enviar a transcribir
            </button>
            <button
              onClick={handleReset}  // ← ahora es estable
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
            onClick={handleReset}
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
            onChange={setSelectedSpeaker}  // ← esto también podría memoizarse si fuera necesario
            onCorrect={handleCorrect}  // ← ahora es estable
            loading={loading}
          />

          {correctionResult && (
            <CorrectedConversationView messages={correctionResult.messages} />
          )}

          <button
            onClick={handleReset}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Transcribir otro audio
          </button>
        </>
      )}
    </div>
  );
}