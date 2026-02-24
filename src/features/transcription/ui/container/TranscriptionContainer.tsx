"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { usePersistentSession } from "../../hooks/usePersistentSession";

import { useTranscription } from "@/features/transcription/hooks/useTranscription";
import { useGrammarCorrection } from "@/features/transcription/hooks/useGrammarCorrection";
import { useSaveConversation } from "@/features/transcription/hooks/useSaveConversation";

import { sessionEvents } from "@/services/events/sessionEvents";

import { AudioSourceSelector } from "@/features/transcription/ui/audio/AudioSourceSelector";
import { ConversationView } from "@/features/transcription/ui/audio/ConversationView";
import { SpeakerSelector } from "@/features/transcription/ui/audio/SpeakerSelector";
import { CorrectedConversationView } from "@/features/transcription/ui/language/CorrectedConversationView";

import {
  Speaker,
  ConversationInput,
} from "../../domain/conversation/conversation.types";

const SESSION_KEY = "transcription-session";

export function TranscriptionContainer() {
  const { isRestored, restoredData, save, clear } =
    usePersistentSession(SESSION_KEY);
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

  const {
    correctConversation,
    result: correctionResult,
    loading,
  } = useGrammarCorrection();

  const { save: saveToDb, isSaving } = useSaveConversation();

  // Estados locales
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker>("A");
  const [wasCleared, setWasCleared] = useState(false);

  // Escuchar limpieza de sesión
  useEffect(() => {
    const cleanup = sessionEvents.on("session:cleared", () => {
      setWasCleared(true);
      skipNextSaveRef.current = true;
    });

    return cleanup;
  }, []);

  // Efecto de restauración desde localStorage
  useEffect(() => {
    if (!isRestored || !restoredData || wasCleared) return;

    skipNextSaveRef.current = true;

    if (restoredData.rawText) {
      restoreSession({
        rawText: restoredData.rawText,
        conversation: restoredData.conversation,
      });
    }
  }, [isRestored, restoredData, restoreSession, wasCleared]);

  // Efecto de guardado en localStorage (auto-save)
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

  // Handler de reset
  const handleReset = useCallback(() => {
    discardAudio();
    clear();
  }, [discardAudio, clear]);

  // Handler de corrección
  const handleCorrect = useCallback(async () => {
    if (!conversation) return;

    await correctConversation({
      conversation,
      language: "english",
      level: "intermediate",
      correct: { A: true, B: true },
    });
  }, [conversation, correctConversation]);

  // Handler de enviar audio
  const handleSendAudio = useCallback(() => {
    sendAudio();
  }, [sendAudio]);

  // Handler de guardar en DB
  const handleSave = useCallback(async () => {
    if (!correctionResult || !rawText) return;

    const now = new Date();
    const title = `Conversación ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    const input: ConversationInput = {
      title,
      language: "english",
      level: "intermediate",
      targetSpeaker: "all",
      correctionType: "grammar",
      originalText: rawText,
      correctionJson: correctionResult.messages,
      durationSeconds: audio ? Math.round(audio.size / 1024) : undefined,
    };

    await saveToDb(input, SESSION_KEY);
  }, [correctionResult, rawText, audio, saveToDb]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Overlay de guardado - FIXED para cubrir toda la pantalla */}
      {isSaving && (
        <div className="fixed inset-0 h-screen w-screen bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-stone-200 text-lg">Guardando conversación...</p>
            <p className="text-stone-400 text-sm">
              Esto solo tomará unos segundos
            </p>
          </div>
        </div>
      )}

      {/* Contenido normal */}
      <div className={isSaving ? "opacity-50 pointer-events-none" : ""}>
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
                onClick={handleSendAudio}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Enviar a transcribir
              </button>
              <button
                onClick={handleReset}
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
              onChange={setSelectedSpeaker}
              onCorrect={handleCorrect}
              loading={loading}
            />

            {correctionResult && (
              <CorrectedConversationView messages={correctionResult.messages} />
            )}

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="bg-gray-200 px-4 py-2 rounded"
              >
                Transcribir otro audio
              </button>

              {correctionResult && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Guardando..." : "Guardar conversación"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}