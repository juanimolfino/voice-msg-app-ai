import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getConversationsByUser } from "@/features/transcription/lib/conversations/data";
import Link from "next/link";

export default async function ConversationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null; // middleware ya redirige
  }

  const conversations = await getConversationsByUser(session.user.id);

  return (
    <main>
      <h1>Mis conversaciones</h1>

      {conversations.length === 0 && (
        <p>No tenés conversaciones todavía</p>
      )}

      <ul>
        {conversations.map((c) => (
          <li key={c.id}>
            <Link href={`/conversations/${c.id}`}>
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
