"use client";

import { useRef } from "react";

type Props = {
  onAudioReady: (file: File | null) => void;
};

export function FileUpload({ onAudioReady }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onAudioReady(file);
  };

  const resetInput = () => { // para resetear el input y permitir subir el mismo archivo otra vez
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <input
      ref={inputRef}
      type="file"
      accept="audio/*"
      onChange={(e) => {
        handleChange(e);
        resetInput();
      }}
    />
  );
}
