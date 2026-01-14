"use client";

/**
 * Feature container:
 * Orquesta la transcripción + corrección gramatical.
 * No contiene UI detallada ni reglas de negocio.
 * 
 * 🧠 Por qué

La feature conecta todo

No tiene lógica interna compleja

Si mañana cambia el diseño → no rompe nada
 */

import { useTranscription } from "@/hooks/useTranscription";
import { useGrammarCorrection } from "@/hooks/useGrammarCorrection";

import { AudioInput } from "@/components/audio/AudioInput";
import { ConversationView } from "@/components/audio/ConversationView";
import { SpeakerSelector } from "@/components/audio/SpeakerSelector";
import { GrammarSuggestions } from "@/components/language/GrammarSuggestions";

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

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <AudioInput audio={audio} onChange={setAudio} onSend={sendAudio} loading={loading} />

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
