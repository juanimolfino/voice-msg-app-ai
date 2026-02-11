//  SOLO lecturas (SELECT)

import { db } from "@/lib/db";
import { Conversation } from "@/features/transcription/domain/conversation/conversation.types";

export async function getConversationsByUser(
  userId: string,
): Promise<Conversation[]> {
  const result = await db.query(
    `
    SELECT id, title, created_at
    FROM conversations
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId],
  );

  return result.rows;
}
