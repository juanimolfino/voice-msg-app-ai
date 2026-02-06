import { apiFetch } from "./client";
import { Message } from "../messages/types";

export async function getMessages(conversationId: string) {
  return apiFetch<Message[]>(
    `/api/conversations/${conversationId}/messages`
  );
}
