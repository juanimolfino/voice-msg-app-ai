// Que hace esta api?
// | Método | Qué hace                                  |
// | ------ | ----------------------------------------- |
// | `GET`  | Lista conversaciones del usuario logueado |
// | `POST` | Crea una nueva conversación               |


// src/app/api/conversations/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { getConversationsByUser } from "@/features/transcription/lib/conversations/data";
import { createConversation } from "@/features/transcription/lib/conversations/actions";

/* ================= GET ================= */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await getConversationsByUser(session.user.id);

  return NextResponse.json(conversations);
}

/* ================= POST ================= */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const title = body.title ?? "Nueva conversación";

  const conversation = await createConversation({
    userId: session.user.id,
    title,
  });

  return NextResponse.json(conversation, { status: 201 });
}