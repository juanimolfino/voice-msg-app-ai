"use client";

import { useState } from "react";

/**
 * Estados posibles del flujo de transcripción
 */
export type TranscriptionStatus = // 🔵 Estados del hook (useTranscription)

// Representan el flujo del negocio:

// hay o no audio seleccionado

// se está enviando a la API

// hay resultado

// hubo error de transcripción

// Son globales al feature.

  | "idle"        // no hay audio
  | "ready"       // hay audio cargado
  | "sending"     // enviando a la API
  | "done"        // transcripción lista
  | "error";      // algo falló

export function useTranscription() {
  const [audio, setAudio] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [conversation, setConversation] = useState("");
  const [status, setStatus] = useState<TranscriptionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

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
      setError(
        err instanceof Error ? err.message : "Error desconocido"
      );
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
  };
}
