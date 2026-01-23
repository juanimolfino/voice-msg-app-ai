"use client";

import { useRef, useState, useEffect } from "react";

/**
 * Props del Recorder
 *
 * - onAudioReady(file | null)
 *   → El único output del componente.
 *   → El container decide qué hacer con ese audio.
 *
 * - disabled
 *   → Control externo (ej: si ya hay audio cargado).
 *   → El Recorder NO decide si se puede grabar o no.
 */
type RecorderProps = {
  onAudioReady: (file: File) => void;
  disabled?: boolean;
};

/**
 * Devuelve el MIME type soportado por el navegador actual.
 * Safari y Chrome difieren, por eso se detecta dinámicamente.
 */
function getSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") return null;

  const types = [
    "audio/mp4",   // Safari
    "audio/webm",  // Chrome / Firefox
  ];

  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? null;
}

export function Recorder({ onAudioReady, disabled }: RecorderProps) {
  // refs técnicas (no disparan renders)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // estado visual mínimo
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Arranca la grabación
   * - pide permiso
   * - inicializa MediaRecorder
   * - NO envía nada automáticamente
   */
  const startRecording = async () => {
    if (disabled || isRecording) return;

    setError(null);

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setError("Este navegador no soporta grabación de audio.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const extension = mimeType.includes("mp4") ? "mp4" : "webm";

        const file = new File([blob], `recording.${extension}`, {
          type: mimeType,
        });

        // único punto donde el Recorder "habla" con el mundo
        onAudioReady(file);

        // 🔒 apagar micrófono SIEMPRE
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);

      // Safari: puede fallar aunque el usuario haya aceptado
      setError(
        "No se pudo acceder al micrófono. Probá tocar “Grabar” otra vez."
      );

      // seguridad extra
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;

      setIsRecording(false);
    }
  };

  /**
   * Detiene la grabación
   * El onstop se encarga del resto
   */
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  /**
   * Cleanup de seguridad
   * Si el componente se desmonta con el mic abierto → lo cerramos
   */
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {!isRecording ? (
        <button
          onClick={startRecording}
          disabled={disabled}
          className={`px-4 py-2 rounded text-white transition
            ${disabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"}`}
        >
          🎤 Grabar
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          ⏹ Detener
        </button>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error}
          <br />
          <span className="text-xs text-gray-500">
            Safari puede fallar al primer intento.
            <br />
            Si acabás de aceptar el permiso, tocá “Grabar” otra vez.
          </span>
        </p>
      )}
    </div>
  );
}
