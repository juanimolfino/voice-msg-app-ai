import { useState, useEffect, useCallback } from "react";
import { CorrectionResult } from "../domain/conversation/conversation.types";
import { sessionEvents } from "@/services/events/sessionEvents";

export function useGrammarCorrection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CorrectionResult | null>(null);

  // Escuchar limpieza de sesión
  useEffect(() => {
    const cleanup = sessionEvents.on("session:cleared", () => {
      setLoading(false);
      setError(null);
      setResult(null);
    });

    return cleanup;
  }, []);

  async function correctConversation(input: {
    conversation: string;
    language: string;
    level: "beginner" | "intermediate" | "advanced";
    correct: { A: boolean; B: boolean };
  }): Promise<CorrectionResult> {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/correct-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        throw new Error("Failed to correct conversation");
      }

      const json = await res.json();
      setResult(json);
      return json;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function clearResult() {
    setResult(null);
  }

  // NUEVO: Restaurar desde localStorage
  const restore = useCallback((data: { result: CorrectionResult }) => {
    if (!data.result) return;
    setResult(data.result);
  }, []);

  return {
    correctConversation,
    clearResult,
    result,
    loading,
    error,
    restore, // NUEVO
  };
}