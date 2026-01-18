"use client";

import { useRef, useState } from "react";

type RecorderProps = {
  onAudioReady: (file: File) => void;
};

export function Recorder({ onAudioReady }: RecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const file = new File([blob], "recording.webm", {
        type: "audio/webm",
      });

      onAudioReady(file);

      // apagar micrófono
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div>
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          🎤 Grabar
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          ⏹ Detener
        </button>
      )}
    </div>
  );
}
