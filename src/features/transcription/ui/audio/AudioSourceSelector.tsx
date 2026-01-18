"use client";

import { useState } from "react";

import { FileUpload } from "./file/FileUpload";
import { Recorder } from "./recorder/Recorder";

type Props = {
  onAudioReady: (file: File | null) => void;
};

type Source = "file" | "record";

export function AudioSourceSelector({ onAudioReady }: Props) {
  const [source, setSource] = useState<Source>("file");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSource("file")}
          className={`px-3 py-1 rounded ${
            source === "file"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Subir audio
        </button>

        <button
          type="button"
          onClick={() => setSource("record")}
          className={`px-3 py-1 rounded ${
            source === "record"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Grabar
        </button>
      </div>

      {source === "file" && (
        <FileUpload onAudioReady={onAudioReady} />
      )}

      {source === "record" && (
        <Recorder onAudioReady={onAudioReady} />
      )}
    </div>
  );
}
