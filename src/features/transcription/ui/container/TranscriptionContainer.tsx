"use client";

import { useMemo } from "react";

import { useTranscription } from "@/features/transcription/hooks/useTranscription";
import { useGrammarCorrection } from "@/features/transcription/hooks/useGrammarCorrection";

import { AudioSourceSelector } from "@/features/transcription/ui/audio/AudioSourceSelector";
import { ConversationView } from "@/features/transcription/ui/audio/ConversationView";
import { SpeakerSelector } from "@/features/transcription/ui/audio/SpeakerSelector";
import { GrammarSuggestions } from "@/features/transcription/ui/language/GrammarSuggestions";

export function TranscriptionContainer() {
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

  const {
    selectedSpeaker,
    setSelectedSpeaker,
    correcting,
    correction,
    correctGrammar,
  } = useGrammarCorrection(conversation);

  /**
   * URL para pre-escuchar el audio
   * Solo existe si hay audio cargado
   */
  const audioUrl = useMemo(() => {
    if (!audio) return null;
    return URL.createObjectURL(audio);
  }, [audio]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* =====================================
          🟢 ESTADO: idle
          No hay audio cargado
          Acción posible: subir o grabar
      ====================================== */}
      {status === "idle" && (
        <>
          <p className="text-sm text-gray-500">
            🎧 Subí un audio o grabá uno para empezar
          </p>

          <AudioSourceSelector onAudioReady={onAudioReady} />
        </>
      )}

      {/* =====================================
          🟡 ESTADO: ready
          Hay audio cargado
          Acción posible: enviar o descartar
      ====================================== */}
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

      {/* =====================================
          🔵 ESTADO: sending
          Audio enviado, esperando respuesta
          No hay acciones posibles
      ====================================== */}
      {status === "sending" && (
        <p className="text-sm text-gray-500">
          🧠 Transcribiendo audio...
        </p>
      )}

      {/* =====================================
          🔴 ESTADO: error
          Algo falló
          Acción posible: descartar y volver a empezar
      ====================================== */}
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

      {/* =====================================
          🟣 ESTADO: done
          Transcripción lista
          Acciones de valor agregado
      ====================================== */}
      {status === "done" && (
        <>
          {/* Preview del audio transcripto */}
          {audioUrl && (
            <audio controls src={audioUrl} className="w-full" />
          )}

          <ConversationView
            rawText={rawText}
            conversation={conversation}
          />

          <SpeakerSelector
            speaker={selectedSpeaker}
            onChange={setSelectedSpeaker}
            onCorrect={correctGrammar}
            loading={correcting}
          />

          <GrammarSuggestions text={correction} />

          {/* CTA final MVP */}
          <button
            onClick={discardAudio}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Transcribir otro audio
          </button>
        </>
      )}
    </div>
  );
}
