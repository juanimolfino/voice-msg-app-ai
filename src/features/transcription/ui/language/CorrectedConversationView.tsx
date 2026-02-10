"use client";

import { Speaker } from "../../domain/conversation/conversation.types";

type CorrectedMessage = {
  speaker: Speaker;
  original: string;
  correction: string | null;
  suggestion: string | null;
};

type Props = {
  messages: CorrectedMessage[];
};

export function CorrectedConversationView({ messages }: Props) {
  return (
    <div className="space-y-4">
      {messages.map((msg, idx) => (
        <div key={idx} className="rounded-md border p-3">
          <p className="font-semibold mb-1">
            Speaker {msg.speaker}
          </p>

          {/* Texto original / corregido */}
          <p className="text-sm">
            {msg.correction ? (
              <>
                <span className="line-through text-red-500">
                  {msg.original}
                </span>
                <span className="ml-2 text-green-600 font-medium">
                  {msg.correction}
                </span>
              </>
            ) : (
              <span>{msg.original}</span>
            )}
          </p>

          {/* Sugerencia estilística */}
          {msg.suggestion && (
            <p className="mt-1 text-sm text-blue-600">
              💡 {msg.suggestion}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
