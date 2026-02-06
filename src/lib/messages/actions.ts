import { db } from "@/lib/db";
import { CreateMessageInput } from "./types";

export async function createMessage({
  conversationId,
  groupId,
  speaker,
  kind,
  content,
}: CreateMessageInput) {
  await db.query(
    `
    INSERT INTO messages (
      conversation_id,
      group_id,
      speaker,
      kind,
      content
    )
    VALUES ($1, $2, $3, $4, $5)
    `,
    [conversationId, groupId, speaker, kind, content]
  );
}