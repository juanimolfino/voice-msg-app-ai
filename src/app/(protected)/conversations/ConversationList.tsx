import { getConversationsByUser } from "@/features/transcription/lib/conversations/data";
import Link from "next/link";

export async function ConversationList({ userId }: { userId: string }) {
  const conversations = await getConversationsByUser(userId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-400 text-lg mb-4">
          No tenés conversaciones guardadas todavía
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/conversations/${conversation.id}`}
          prefetch={true} // prefetch para mejorar la velocidad de carga al entrar a la conversación
          className="block bg-stone-800 p-4 rounded-lg hover:bg-stone-700 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-stone-100 group-hover:text-indigo-300 transition-colors">
                {conversation.title}
              </h2>
              <p className="text-stone-400 text-sm mt-1">
                {formatDate(conversation.createdAt)} · {conversation.language} ·{" "}
                {conversation.level}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-stone-500 text-xs">Mensajes</p>
                <p className="text-stone-200 font-semibold">
                  {conversation.messageCount}
                </p>
              </div>
              <div className="text-center">
                <p className="text-stone-500 text-xs">Correcciones</p>
                <p className="text-emerald-400 font-semibold">
                  {conversation.correctionsCount}
                </p>
              </div>
              <div className="text-stone-500 group-hover:text-stone-300 transition-colors">
                →
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}