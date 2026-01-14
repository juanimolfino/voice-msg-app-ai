"use client";

import { useState } from "react";

/**
 * Maneja el flujo de subida de audio y transcripción.
 * Estado + llamada a API.
 */

export function useTranscription() {
  const [audio, setAudio] = useState<File | null>(null);
  const [conversation, setConversation] = useState("");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendAudio() {
    if (!audio) return;

    setLoading(true);
    setConversation("");
    setRawText("");

    const formData = new FormData();
    formData.append("audio", audio);

    const res = await fetch("/api/transcription-diarize", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setRawText(data.rawText);
    setConversation(data.conversation);
    setLoading(false);
  }

  return {
    audio,
    setAudio,
    conversation,
    rawText,
    loading,
    sendAudio,
  };
}
