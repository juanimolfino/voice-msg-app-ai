// hooks/usePersistentSession.ts
import { useState, useEffect, useCallback } from "react";
import { CorrectionResult } from "@/features/transcription/domain/conversation/conversation.types"; // ajustá el path si es necesario

// Usamos los tipos REALES de tu dominio, no genéricos
interface SessionData {
  rawText: string | null;
  conversation: string | null;
  correctionResult: CorrectionResult | null;
}

export function usePersistentSession(key: string) {
  const [isRestored, setIsRestored] = useState<boolean | null>(null);
  const [restoredData, setRestoredData] = useState<SessionData | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRestoredData(parsed);
      }
    } catch (e) {
      console.error("Error loading session:", e);
    }
    setIsRestored(true);
  }, [key]);

  const save = useCallback((data: SessionData) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving session:", e);
    }
  }, [key]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Error clearing session:", e);
    }
  }, [key]);

  return {
    isRestored,
    restoredData,
    save,
    clear
  };
}