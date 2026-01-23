/**
 * Render helper para resaltar texto entre <green> tags.
 * Dominio puro de formateo de texto.
 */

export function renderWithGreen(text: string) {
  const parts = text.split(/(<green>|<\/green>)/g);

  return parts.map((part, i) => {
    if (part === "<green>" || part === "</green>") return null;

    const isGreen =
      parts[i - 1] === "<green>" && parts[i + 1] === "</green>";

    return (
      <span
        key={i}
        className={isGreen ? "text-green-600 font-semibold" : ""}
      >
        {part}
      </span>
    );
  });
}
