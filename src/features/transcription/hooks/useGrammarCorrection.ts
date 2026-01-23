"use client";

import { useState } from "react";

/**
 * Maneja corrección gramatical por hablante.
 */

export function useGrammarCorrection(conversation: string) {
  const [selectedSpeaker, setSelectedSpeaker] = useState<"A" | "B">("A");
  const [correction, setCorrection] = useState("");
  const [correcting, setCorrecting] = useState(false);

  async function correctGrammar() {
    setCorrecting(true);
    setCorrection("");

    const res = await fetch("/api/correct-speaker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        speaker: selectedSpeaker,
        conversation,
      }),
    });

    const data = await res.json();
    setCorrection(data.result);
    setCorrecting(false);
  }

  return {
    selectedSpeaker,
    setSelectedSpeaker,
    correction,
    correcting,
    correctGrammar,
  };
}
