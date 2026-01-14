/**
 * Input de audio + botón de envío
 */

type Props = {
  audio: File | null;
  onChange: (file: File | null) => void;
  onSend: () => void;
  loading: boolean;
};

export function AudioInput({
  audio,
  onChange,
  onSend,
  loading,
}: Props) {
  return (
    <>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />

      <button
        onClick={onSend}
        disabled={loading || !audio}
        className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Procesando audio..." : "Enviar audio"}
      </button>
    </>
  );
}
