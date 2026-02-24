// hooks/usePersistentSession.ts
import { useState, useEffect, useCallback } from "react";
import { CorrectionResult } from "@/features/transcription/domain/conversation/conversation.types";
import { sessionEvents } from "@/services/events/sessionEvents";

interface SessionData {
  rawText: string | null;
  conversation: string | null;
  correctionResult: CorrectionResult | null;
}

export function usePersistentSession(key: string) {
  const [isRestored, setIsRestored] = useState<boolean | null>(null);
  const [restoredData, setRestoredData] = useState<SessionData | null>(null);

  // Cargar al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      console.log("📦 Loading from localStorage:", key, stored); // DEBUG
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
      setRestoredData(null); // Limpiar estado para que no restaure
    });
    
    return cleanup;
  }, []);

  const save = useCallback((data: SessionData) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      sessionEvents.emit('session:saved'); // Notificar guardado
    } catch (e) {
      console.error("Error saving session:", e);
    }
  }, [key]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setRestoredData(null); // Limpiar estado local inmediatamente
      sessionEvents.emit('session:cleared'); // Notificar a todos
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