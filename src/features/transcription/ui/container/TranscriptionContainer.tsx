"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
// hooks
import { usePersistentSession } from "../../hooks/usePersistentSession";
import { useTranscription } from "@/features/transcription/hooks/useTranscription";
import { useGrammarCorrection } from "@/features/transcription/hooks/useGrammarCorrection";
import { useSaveConversation } from "@/features/transcription/hooks/useSaveConversation";
import { useDetectLanguage } from "@/features/transcription/hooks/useDetectLanguage";
// services
import { sessionEvents } from "@/services/events/sessionEvents";
// ui
import { AudioSourceSelector } from "@/features/transcription/ui/audio/AudioSourceSelector";
import { CorrectedConversationView } from "@/features/transcription/ui/language/CorrectedConversationView";
// types
import {
  ConversationInput,
  LanguageLevel,
} from "../../domain/conversation/conversation.types";

const SESSION_KEY = "transcription-session";

type ProcessingStep =
  | "idle"
  | "transcribing"
  | "detecting-language"
  | "correcting"
  | "done"
  | "error";

interface TranscriptionContainerProps {
  hasCredits: boolean;
  credits: number;
}

// 👉 TIPO PARA EVENTOS GLOBALES DE CRÉDITOS
declare global {
  interface WindowEventMap {
    'credit:spent': CustomEvent;
    'credit:refunded': CustomEvent;
  }
}

export function TranscriptionContainer({
  hasCredits,
  //credits,
}: TranscriptionContainerProps) {
  const { isRestored, restoredData, save, clear } =
    usePersistentSession(SESSION_KEY);
  const skipNextSaveRef = useRef(false);

  // 👉 REF PARA SABER SI YA GASTAMOS EL CRÉDITO EN ESTE PIPELINE
  // Evita gastar dos veces si hay reintentos
  const creditSpentRef = useRef(false);

  // Hooks sin initialData - se hidratan con restore() en useEffect
  const {
    audio,
    rawText,
    conversation,
    status: transcriptionStatus,
    error: transcriptionError,
    onAudioReady,
    sendAudio,
    discardAudio,
    restoreSession,
  } = useTranscription();

  const {
    correctConversation,
    clearResult: clearCorrectionResult,
    result: correctionResult,
    restore: restoreCorrection,
  } = useGrammarCorrection();

  const { save: saveToDb, isSaving } = useSaveConversation();

  const {
    detect: detectLanguage,
    language: detectedLanguage,
    restore: restoreLanguage,
  } = useDetectLanguage();

  // Estados locales
  const [level, setLevel] = useState<LanguageLevel>("intermediate");
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("idle");
  const [processError, setProcessError] = useState<string | null>(null);

  // URL del audio
  const audioUrl = useMemo(() => {
    if (!audio) return null;
    return URL.createObjectURL(audio);
  }, [audio]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Restauración desde localStorage - USAMOS restore() en los 3 hooks
  useEffect(() => {
    if (!isRestored || !restoredData) return;

    // Si no hay resultado completo, limpiar
    if (!restoredData.correctionResult || !restoredData.conversation) {
      clear();
      return;
    }

    skipNextSaveRef.current = true;

    if (restoredData.level) setLevel(restoredData.level);
    setProcessingStep("done");

    // Hidratar los 3 hooks
    if (restoredData.rawText && restoredData.conversation) {
      restoreSession({
        rawText: restoredData.rawText,
        conversation: restoredData.conversation,
      });
    }

    if (restoredData.detectedLanguage) {
      restoreLanguage({ language: restoredData.detectedLanguage });
    }

    restoreCorrection({ result: restoredData.correctionResult });
  }, [
    isRestored,
    restoredData,
    restoreSession,
    restoreLanguage,
    restoreCorrection,
    clear,
  ]);

  // Auto-save
  useEffect(() => {
    if (!isRestored) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    if (correctionResult && processingStep === "done") {
      save({
        rawText,
        conversation,
        correctionResult,
        level,
        detectedLanguage: detectedLanguage || undefined,
      });
    }
  }, [
    correctionResult,
    detectedLanguage,
    processingStep,
    rawText,
    conversation,
    level,
    isRestored,
    save,
  ]);

  // Escuchar limpieza
  useEffect(() => {
    const cleanup = sessionEvents.on("session:cleared", () => {
      setProcessingStep("idle");
      setLevel("intermediate");
      setProcessError(null);
      skipNextSaveRef.current = true;
      clearCorrectionResult();
      // 👉 Resetear el flag de crédito gastado al limpiar sesión
      creditSpentRef.current = false;
    });
    return cleanup;
  }, [clearCorrectionResult]);

  // 👉 EFECTO: Cuando termina la corrección exitosamente, disparar evento de crédito gastado
  useEffect(() => {
    if (processingStep === "done" && correctionResult && !creditSpentRef.current) {
      // 👉 Marcar que gastamos el crédito
      creditSpentRef.current = true;
      
      // 👉 DISPARAR EVENTO GLOBAL: El header se actualizará instantáneamente
      window.dispatchEvent(new CustomEvent('credit:spent'));
      
      console.log('💰 Crédito gastado - UI actualizada');
    }
  }, [processingStep, correctionResult]);

  // 👉 EFECTO: Si hay error en corrección, disparar reembolso visual
  useEffect(() => {
    if (processingStep === "error" && creditSpentRef.current) {
      // 👉 El backend ya reembolsó, nosotros actualizamos la UI
      window.dispatchEvent(new CustomEvent('credit:refunded'));
      creditSpentRef.current = false;
      console.log('💰 Crédito reembolsado - UI actualizada');
    }
  }, [processingStep]);

  // Handler principal: PROCESAR
  const handleProcess = useCallback(async () => {
    if (!audio) return;

    // 👉 Resetear flag al iniciar nuevo proceso
    creditSpentRef.current = false;
    setProcessError(null);
    setProcessingStep("transcribing");

    try {
      await sendAudio();
    } catch (err) {
      console.error("Error en transcripción:", err);
      setProcessingStep("idle");
    }
  }, [audio, sendAudio]);

  // Efecto: Cuando termina transcripción, detectar idioma
  useEffect(() => {
    if (transcriptionStatus !== "done" || processingStep !== "transcribing")
      return;
    if (!conversation) {
      setProcessError("No se generó conversación");
      setProcessingStep("idle");
      return;
    }

    setProcessingStep("detecting-language");

    detectLanguage(conversation).catch((err) => {
      setProcessError(
        err instanceof Error ? err.message : "Error detectando idioma",
      );
      setProcessingStep("error"); // 👉 Marcar como error para posible reembolso
    });
  }, [transcriptionStatus, processingStep, conversation, detectLanguage]);

  // Efecto: Cuando detecta idioma, corregir
  useEffect(() => {
    if (processingStep !== "detecting-language") return;
    if (!detectedLanguage || !conversation) return;

    const runCorrection = async () => {
      try {
        setProcessingStep("correcting");
        await correctConversation({
          conversation,
          language: detectedLanguage,
          level,
          correct: { A: true, B: true },
        });
        setProcessingStep("done");
      } catch (err) {
        setProcessError(
          err instanceof Error ? err.message : "Error en corrección",
        );
        setProcessingStep("error"); // 👉 Marcar como error para reembolso
      }
    };

    runCorrection();
  }, [
    processingStep,
    detectedLanguage,
    conversation,
    level,
    correctConversation,
  ]);

  // Reset completo
  const handleReset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    sessionEvents.emit("session:cleared");
    clear();
    discardAudio();
    clearCorrectionResult();
    setProcessingStep("idle");
    setProcessError(null);
    setLevel("intermediate");
    creditSpentRef.current = false;
  }, [discardAudio, clearCorrectionResult, clear, audioUrl]);

  // Descartar solo audio
  const handleDiscardAudio = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    discardAudio();
    clear();
    clearCorrectionResult();
    setProcessingStep("idle");
    setProcessError(null);
    creditSpentRef.current = false;
  }, [discardAudio, clearCorrectionResult, clear, audioUrl]);

  // Guardar en DB
  const handleSave = useCallback(async () => {
    if (!correctionResult || !rawText) return;

    const now = new Date();
    const title = `Conversación ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    const input: ConversationInput = {
      title,
      language: detectedLanguage || "english",
      level,
      targetSpeaker: "all",
      correctionType: "grammar",
      originalText: rawText,
      correctionJson: correctionResult.messages,
      durationSeconds: audio ? Math.round(audio.size / 1024) : undefined,
    };

    await saveToDb(input, SESSION_KEY);
  }, [correctionResult, rawText, detectedLanguage, level, audio, saveToDb]);

  // Estados derivados
  const hasAudio = !!audio;
  const hasResult = processingStep === "done" && !!correctionResult;
  const isProcessing =
    processingStep === "transcribing" ||
    processingStep === "detecting-language" ||
    processingStep === "correcting";
  const hasError = !!processError || transcriptionStatus === "error";
  const canProcess = hasAudio && !hasResult && !isProcessing && hasCredits;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Overlay de procesamiento */}
      {isProcessing && (
        <div className="fixed inset-0 h-screen w-screen bg-stone-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-stone-200 text-lg">
              {processingStep === "transcribing" &&
                "🎤 Transcribiendo audio..."}
              {processingStep === "detecting-language" &&
                "🔍 Detectando idioma..."}
              {processingStep === "correcting" && "✍️ Corrigiendo gramática..."}
            </p>
          </div>
        </div>
      )}

      {/* Overlay de guardado */}
      {isSaving && (
        <div className="fixed inset-0 h-screen w-screen bg-stone-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-stone-200 text-lg">Guardando conversación...</p>
          </div>
        </div>
      )}

      {/* En el JSX, mostrar mensaje si no tiene créditos */}
      {!hasCredits && hasAudio && !hasResult && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-700 text-sm">
            No tenés créditos disponibles.
            <a href="/upgrade" className="underline font-medium ml-1">
              Comprá más o actualizá a Pro
            </a>
          </p>
        </div>
      )}

      {/* Contenido */}
      <div
        className={
          isProcessing || isSaving ? "opacity-50 pointer-events-none" : ""
        }
      >
        {/* ESTADO 1: Sin audio */}
        {!hasAudio && !hasResult && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              🎧 Subí un audio o grabá uno para empezar
            </p>
            <AudioSourceSelector
              onAudioReady={onAudioReady}
              disabled={isProcessing}
            />
          </>
        )}

        {/* ESTADO 2: Con audio */}
        {hasAudio && !hasResult && (
          <div className="space-y-6">
            {audioUrl && <audio controls src={audioUrl} className="w-full" />}

            {hasError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                <p className="text-red-700 text-sm">
                  {processError ||
                    transcriptionError ||
                    "Hubo un error al procesar."}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleProcess}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors text-sm"
                  >
                    🔄 Reintentar
                  </button>
                  <button
                    onClick={handleDiscardAudio}
                    className="bg-gray-200 px-4 py-2 rounded text-sm hover:bg-gray-300 transition-colors"
                  >
                    Subir otro
                  </button>
                </div>
              </div>
            )}

            {!hasError && (
              <>
                <div className="bg-stone-800 p-4 rounded-lg space-y-3">
                  <label className="block text-stone-300 text-sm font-medium">
                    Nivel del hablante
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as LanguageLevel)}
                    disabled={isProcessing}
                    className="w-full bg-stone-700 text-stone-100 border border-stone-600 rounded px-3 py-2"
                  >
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleProcess}
                    disabled={isProcessing || !canProcess}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    ✨ Procesar
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                  >
                    Descartar
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ESTADO 3: Resultado completo */}
        {hasResult && (
          <div className="space-y-6">
            {audioUrl ? (
              <audio controls src={audioUrl} className="w-full" />
            ) : (
              <div className="bg-stone-800 p-3 rounded text-sm text-stone-400">
                📝 Audio no disponible (sesión guardada)
              </div>
            )}

            <div className="bg-stone-800 p-3 rounded text-sm text-stone-400">
              Idioma:{" "}
              <span className="text-stone-200 capitalize">
                {detectedLanguage}
              </span>{" "}
              • Nivel:{" "}
              <span className="text-stone-200 capitalize">{level}</span>
            </div>

            <CorrectedConversationView messages={correctionResult.messages} />

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? "Guardando..." : "💾 Guardar"}
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                🔄 Nueva
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}