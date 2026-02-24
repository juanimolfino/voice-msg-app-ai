"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveConversation } from "@/features/transcription/lib/conversations/actions";
import {
  ConversationInput,
  ConversationRecord,
} from "@/features/transcription/domain/conversation/conversation.types";

type SaveStatus = "idle" | "saving" | "success" | "error";

interface UseSaveConversationReturn {
  save: (input: ConversationInput, sessionKey?: string) => Promise<void>;
  status: SaveStatus;
  isSaving: boolean;
  lastSaved: ConversationRecord | null;
  error: string | null;
  reset: () => void;
}

// Key usada en sessionStorage para indicar qué limpiar en la página destino
const CLEAR_SESSION_KEY = "clear_session_key";

export function useSaveConversation(): UseSaveConversationReturn {
  const router = useRouter();
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<ConversationRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async (
    input: ConversationInput,
    sessionKey?: string,
  ): Promise<void> => {
    setStatus("saving");
    setError(null);

    try {
      const result = await saveConversation(input);

      if (!result.success) {
        setStatus("error");
        setError(result.error);
        toast.error(result.error);
        return;
      }

      // ÉXITO: Guardar referencia para limpieza posterior
      setStatus("success");
      setLastSaved(result.data);

      // Guardar en sessionStorage la key a limpiar (para la página destino)
      if (sessionKey) {
        sessionStorage.setItem(CLEAR_SESSION_KEY, sessionKey);
      }

      toast.success("¡Conversación guardada exitosamente!");

      // Redirigir inmediatamente, la limpieza pasa en la página destino
      router.push(`/conversations/${result.data.id}`);

    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setStatus("error");
      setError(message);
      toast.error(message);
    }
  };

  const reset = () => {
    setStatus("idle");
    setLastSaved(null);
    setError(null);
  };

  return {
    save,
    status,
    isSaving: status === "saving",
    lastSaved,
    error,
    reset,
  };
}