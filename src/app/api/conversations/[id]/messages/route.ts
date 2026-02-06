import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getMessagesByConversationId } from "@/lib/messages/data";
import { createMessage } from "@/lib/messages/actions";
import { randomUUID } from "crypto";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params; //* regla mental params siempre se await
  const messages = await getMessagesByConversationId(id);

  return NextResponse.json(messages);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
    const { id } = await params; 
  const body = await req.json();
  const { speaker, content, kind } = body;

  if (!speaker || !content || !kind) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const groupId = randomUUID();

  await createMessage({
    conversationId: id,
    groupId,
    speaker,
    kind,
    content,
  });

  return NextResponse.json({ success: true });
}
