import { CorrectionResult } from "@/features/transcription/domain/conversation/conversation.types";

export type StoredSession = {
  rawText: string | null;
  conversation: string | null;
  correctionResult: CorrectionResult | null;
};

const KEY = "transcription_session_v1";

export function saveSession(data: StoredSession) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

export function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
