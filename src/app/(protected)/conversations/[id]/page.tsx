import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getConversationById } from "@/features/transcription/lib/conversations/data";

import Link from "next/link";
import clsx from "clsx";


import { ClearSessionOnMount } from "@/components/session/ClearSessionOnMount";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const conversation = await getConversationById(id, session.user.id);

  if (!conversation) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <ClearSessionOnMount /> {/* Limpia localStorage al montar */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">
              {conversation.title}
            </h1>
            <p className="text-black text-sm mt-1">
              {formatDate(conversation.createdAt)} · {conversation.language} ·{" "}
              {conversation.level}
            </p>
          </div>
          <Link
            href="/conversations"
            className="text-black hover:text-stone-200 transition-colors"
          >
            ← Volver al listado
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-stone-300 p-4 rounded-lg">
            <p className="text-black text-sm font-semibold">Mensajes</p>
            <p className="text-2xl font-bold text-black">
              {conversation.messageCount}
            </p>
          </div>
          <div className="bg-stone-300 p-4 rounded-lg">
            <p className="text-black text-sm font-semibold">Correcciones</p>
            <p className="text-2xl font-bold text-black">
              {conversation.correctionsCount}
            </p>
          </div>
          <div className="bg-stone-300 p-4 rounded-lg">
            <p className="text-black text-sm font-semibold">Duración</p>
            <p className="text-2xl font-bold text-black">
              {conversation.durationSeconds
                ? `${Math.round(conversation.durationSeconds / 60)}m`
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Conversación corregida */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-black">
            Correcciones y sugerencias
          </h2>

          <div className="space-y-3">
            {conversation.correctionJson.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  message.speaker === "A" ? "bg-stone-300" : "bg-stone-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      message.speaker === "A"
                        ? "bg-indigo-600 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {message.speaker}
                  </span>
                </div>

                <p className={clsx(message.correction ? "text-red-500" : "text-black ")}>
                  <span className="font-semibold">Original:</span>{" "}
                  {message.original}
                </p>

                {message.correction && (
                  <p className="text-emerald-400 mb-1">
                    <span className="text-emerald-500 font-semibold">
                      Corrección:
                    </span>{" "}
                    {message.correction}
                  </p>
                )}

                {message.suggestion && (
                  <p className="text-blue-400">
                    <span className="text-blue-500 font-semibold">
                      Sugerencia:
                    </span>{" "}
                    {message.suggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Texto original (collapsible en el futuro) */}
        <div className="border-t border-stone-700 pt-6">
          <h2 className="text-lg font-semibold text-black mb-3">
            Transcripción original
          </h2>
          <div className="bg-stone-100 p-4 rounded-lg">
            <p className="text-stone-700 text-sm whitespace-pre-wrap">
              {conversation.originalText}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}