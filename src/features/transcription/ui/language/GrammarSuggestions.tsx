import { renderWithGreen } from "@/features/transcription/domain/text/highlightGreen";

/**
 * UI para mostrar sugerencias gramaticales.
 */

export function GrammarSuggestions({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="border rounded p-4 bg-green-50 space-y-4">
      <strong>Sugerencias:</strong>

      {text.split("Option").map((opt, i) => {
        if (!opt.trim()) return null;
        return (
          <div key={i} className="whitespace-pre-wrap">
            <strong>Option</strong>
            {renderWithGreen(opt)}
          </div>
        );
      })}
    </div>
  );
}
