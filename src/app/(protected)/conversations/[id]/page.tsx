import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getMessagesByConversationId } from "@/features/transcription/lib/messages/data";
import { Message } from "@/features/transcription/lib/messages/types";

/* -----------------------------
   Utils
-------------------------------- */

function groupByGroupId(messages: Message[]) {
  return messages.reduce<Record<string, Message[]>>((acc, msg) => {
    if (!acc[msg.groupId]) acc[msg.groupId] = [];
    acc[msg.groupId].push(msg);
    return acc;
  }, {});
}

/* -----------------------------
   UI
-------------------------------- */

function MessageLine({ message }: { message: Message }) {
  switch (message.kind) {
    case "original":
      return <p className="text-gray-500 line-through">{message.content}</p>;
    case "correction":
      return <p className="text-green-600 font-medium">{message.content}</p>;
    case "suggestion":
      return <p className="text-blue-600 italic">{message.content}</p>;
    default:
      return null;
  }
}

/* -----------------------------
   Page
-------------------------------- */

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>; // 🔑
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = await params; // ✅

  let messages: Message[];

  try {
    messages = await getMessagesByConversationId(id);
  } catch (error) {
    console.error("Error fetching messages:", error);
    notFound();
  }

  const grouped = groupByGroupId(messages);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Conversation</h1>

      {Object.values(grouped).length === 0 && (
        <p className="text-gray-500">No messages yet.</p>
      )}

      {Object.values(grouped).map((group) => (
        <div
          key={group[0].groupId}
          className="border rounded-lg p-4 space-y-2"
        >
          {group.map((msg) => (
            <MessageLine key={msg.id} message={msg} />
          ))}
        </div>
      ))}
    </div>
  );
}
