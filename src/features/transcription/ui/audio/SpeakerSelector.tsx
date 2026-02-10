/**
 * UI para seleccionar hablante y disparar corrección gramatical
 */

import { Speaker } from "../../domain/conversation/conversation.types";

type Props = {
  speaker: Speaker;
  onChange: (speaker: Speaker) => void;
  onCorrect: () => void;
  loading: boolean;
};

export function SpeakerSelector({
  speaker,
  onChange,
  onCorrect,
  loading,
}: Props) {
  return (
    <div className="flex gap-2 items-center">
      <select
        value={speaker}
        onChange={(e) => onChange(e.target.value as Speaker)}
        className="border p-2 rounded text-black"
      >
        <option value="A">Persona A</option>
        <option value="B">Persona B</option>
        <option value="Z">Ambos</option>
      </select>

      <button
        onClick={onCorrect}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Corrigiendo..." : "Corregir mi gramática"}
      </button>
    </div>
  );
}
