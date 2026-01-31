// mutaciones (INSERT / UPDATE / DELETE)
"use server";

import { db } from "@/lib/db";

export async function createConversation({
  userId,
  title,
}: {
  userId: string;
  title: string;
}) {
  const result = await db.query(
    `
    INSERT INTO conversations (user_id, title)
    VALUES ($1, $2)
    RETURNING id, title, created_at
    `,
    [userId, title],
  );

  return result.rows[0];
}
