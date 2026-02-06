import { db } from "@/lib/db";
import { Message } from "./types";

export async function getMessagesByConversationId(
  conversationId: string
): Promise<Message[]> {
  
  const result = await db.query(
    `
    SELECT
      id,
      conversation_id AS "conversationId",
      group_id AS "groupId",
      speaker,
      kind,
      content,
      created_at AS "createdAt"
    FROM messages
    WHERE conversation_id = $1
    ORDER BY created_at ASC
    `,
    [conversationId]
  );

  return result.rows;
}