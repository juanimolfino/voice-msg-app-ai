import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ConversationList } from "./ConversationList";
import { ConversationListSkeleton } from "./ConversationListSkeleton";
import { NewConversationButton } from "./NewConversationButton";

export default async function ConversationsListPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header - estático, no necesita suspense */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-100">
          Mis conversaciones
        </h1>
        <NewConversationButton />
      </div>

      {/* Listado - con suspense para skeleton */}
      <Suspense fallback={<ConversationListSkeleton />}>
        <ConversationList userId={session.user.id} />
      </Suspense>
    </div>
  );
}
