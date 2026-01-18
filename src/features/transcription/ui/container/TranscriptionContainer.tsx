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
    setAudio,
    conversation,
    rawText,
    loading,
    sendAudio,
  } = useTranscription();

  const {
    selectedSpeaker,
    setSelectedSpeaker,
    correcting,
    correction,
    correctGrammar,
  } = useGrammarCorrection(conversation);

  const audioUrl = useMemo(() => {
    if (!audio) return null;
    return URL.createObjectURL(audio);
  }, [audio]);

  const discardAudio = () => {
    setAudio(null);
  };

   const handleSend = () => {
    if (!audio) return;
    sendAudio(audio);
  };


  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <AudioSourceSelector onAudioReady={setAudio} />

      {audioUrl && (
        <div className="space-y-2">
          <audio controls src={audioUrl} className="w-full" />

          <div className="flex gap-2">
            <button
              onClick={handleSend}
              disabled={loading || correcting || !audio}
              className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Transcribiendo..." : "Enviar a transcribir"}
            </button>

            <button
              onClick={discardAudio}
              disabled={loading}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      <ConversationView rawText={rawText} conversation={conversation} />

      {conversation && (
        <SpeakerSelector
          speaker={selectedSpeaker}
          onChange={setSelectedSpeaker}
          onCorrect={correctGrammar}
          loading={correcting}
        />
      )}

      <GrammarSuggestions text={correction} />
    </div>
  );
}
