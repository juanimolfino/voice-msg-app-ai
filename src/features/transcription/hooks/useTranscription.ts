"use client";

import { useState, useEffect } from "react";
import { TranscriptionStatus } from "../domain/conversation/conversation.types";
import { sessionEvents } from "@/services/events/sessionEvents";

export function useTranscription() {
  // estados
  const [audio, setAudio] = useState<File | null>(null);
  const [rawText, setRawText] = useState<string | null>("");
  const [conversation, setConversation] = useState<string | null>("");
  const [status, setStatus] = useState<TranscriptionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // NUEVO: Escuchar cuando se limpia la sesión
  useEffect(() => {
    const cleanup = sessionEvents.on("session:cleared", () => {
      setAudio(null);
      setRawText("");
      setConversation("");
      setError(null);
      setStatus("idle");
    });

    return cleanup;
  }, []);

  /**
   * Se llama cuando el usuario confirma que quiere transcribir
   */
  async function sendAudio() {
    if (!audio) return;

    try {
      setStatus("sending");
      setError(null);
      setRawText("");
      setConversation("");

      const formData = new FormData();
      formData.append("audio", audio);

      const res = await fetch("/api/transcription-diarize", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Error al transcribir");
      }

      const data = await res.json();

      setRawText(data.rawText);
      setConversation(data.conversation);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }

  /**
   * El usuario descarta el audio
   */
  function discardAudio() {
    setAudio(null);
    setRawText("");
    setConversation("");
    setError(null);
    setStatus("idle");
  }

  /**
   * Cuando llega un audio nuevo (file upload o recorder)
   */
  function onAudioReady(file: File | null) {
    setAudio(file);
    setStatus(file ? "ready" : "idle");
  }

  /**
   * se usa para restaurar la sesión desde el localStorage al cargar el componente. Recibe un objeto con rawText y conversation, y los setea en el estado. Si hay conversación, también setea el status a "done".
   */
  function restoreSession(data: {
    rawText: string | null;
    conversation: string | null;
  }) {
    if (!data) return;

    if (data.rawText) setRawText(data.rawText);
    if (data.conversation) setConversation(data.conversation);

    if (data.conversation) {
      setStatus("done");
    }
  }

  return {
    // estado
    audio,
    rawText,
    conversation,
    status,
    error,

    // acciones
    onAudioReady,
    sendAudio,
    discardAudio,
    restoreSession,
  };
}
