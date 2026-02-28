// hooks/usePersistentSession.ts
import { useState, useEffect, useCallback } from "react";
import { CorrectionResult, LanguageLevel } from "@/features/transcription/domain/conversation/conversation.types";
import { sessionEvents } from "@/services/events/sessionEvents";

interface SessionData {
  rawText: string | null;
  conversation: string | null;
  correctionResult: CorrectionResult | null;
  level?: LanguageLevel;           // NUEVO
  detectedLanguage?: string;       // NUEVO
}

export function usePersistentSession(key: string) {
  const [isRestored, setIsRestored] = useState<boolean | null>(null);
  const [restoredData, setRestoredData] = useState<SessionData | null>(null);

  // Cargar al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      console.log("📦 Loading from localStorage:", key, stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRestoredData(parsed);
      }
    } catch (e) {
      console.error("Error loading session:", e);
    }
    setIsRestored(true);
  }, [key]);

  // Escuchar limpieza y resetear estado local
  useEffect(() => {
    const cleanup = sessionEvents.on('session:cleared', () => {
      setRestoredData(null);
    });
    
    return cleanup;
  }, []);

  const save = useCallback((data: SessionData) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      sessionEvents.emit('session:saved');
    } catch (e) {
      console.error("Error saving session:", e);
    }
  }, [key]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setRestoredData(null);
      sessionEvents.emit('session:cleared');
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