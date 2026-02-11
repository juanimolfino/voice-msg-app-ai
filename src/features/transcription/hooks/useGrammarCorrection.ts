import { useState } from "react";
import { CorrectionResult } from "../domain/conversation/conversation.types";



export function useGrammarCorrection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      return json;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    correctConversation,
    loading,
    error,
  };
}
