export type Speaker = "A" | "B";

export type MessageKind = "original" | "correction" | "suggestion";

export interface Message {
  id: string;
  conversationId: string;
  groupId: string;
  speaker: Speaker;
  kind: MessageKind;
  content: string;
  createdAt: string;
}

export type MessageRole =
  | "speaker_1"
  | "speaker_2"
  | "correction"
  | "suggestion";

export interface CreateMessageInput {
  conversationId: string;
  groupId: string;
  speaker: Speaker;
  kind: MessageKind;
  content: string;
}

export interface Message {
  id: string;
  conversationId: string;
  groupId: string;
  speaker: Speaker;
  kind: MessageKind;
  content: string;
  createdAt: string;
}
