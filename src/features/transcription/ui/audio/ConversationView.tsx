/**
 * Muestra transcripción cruda y conversación procesada
 */

type Props = {
  rawText: string;
  conversation: string;
};

export function ConversationView({ rawText, conversation }: Props) {
  if (!rawText && !conversation) return null;

  return (
    <>
      {rawText && (
        <div className="border rounded p-3 bg-gray-100 text-black">
          <strong>Transcripción cruda:</strong>
          <p className="whitespace-pre-wrap mt-2">{rawText}</p>
        </div>
      )}

      {conversation && (
        <div className="border rounded p-3 bg-gray-50 text-black whitespace-pre-wrap">
          {conversation}
        </div>
      )}
    </>
  );
}
