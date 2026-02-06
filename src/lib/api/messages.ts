import { Message } from "@/lib/messages/types";
import { apiFetch } from "./client";

export async function getConversationMessages(conversationId: string) {
  return apiFetch<Message[]>(
      `/api/conversations/${conversationId}/messages`,
  );
}



