import { db } from "@/services/database/db";
import { ConversationRecord, ConversationSummary } from "@/features/transcription/domain/conversation/conversation.types";
import { unstable_cache } from "next/cache";

/**
 * Obtiene una conversación completa por su ID
 * @param id UUID de la conversación
 * @param userId ID del usuario (para verificar propiedad)
 * @returns La conversación o null si no existe o no pertenece al usuario
 */

export const getConversationById = unstable_cache(
  async (id: string, userId: string): Promise<ConversationRecord | null> => {
 console.log('🔍 [CACHE MISS] Query DB para conversation:', id); // DEBUG

  const result = await db.query(
    `
    SELECT 
      id,
      user_id,
      title,
      language,
      level,
      status,
      original_text,
      correction_json,
      duration_seconds,
      target_speaker,
      correction_type,
      corrections_count,
      message_count,
      created_at,
      updated_at
    FROM conversations
    WHERE id = $1 AND user_id = $2
    `,
    [id, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    language: row.language,
    level: row.level,
    targetSpeaker: row.target_speaker,
    correctionType: row.correction_type,
    originalText: row.original_text,
    correctionJson: row.correction_json,
    durationSeconds: row.duration_seconds,
    status: row.status,
    correctionsCount: row.corrections_count,
    messageCount: row.message_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
},
  ['conversation-detail'],
  {
    tags: ['conversations'],
    revalidate: 3600,
  }
);

/**
 * Obtiene todas las conversaciones de un usuario (resumen)
 * Ordenadas por fecha descendente (más recientes primero)
 */
// Cache del listado de conversaciones por usuario
// Se revalida automáticamente cuando llamamos revalidatePath('/conversations')

// * Paso 2: Revalidar el cache al guardar
// Ya tenemos revalidatePath('/conversations') en actions.ts, pero ahora también necesitamos revalidar el tag específico.


export const getConversationsByUser = unstable_cache(
  async (userId: string): Promise<ConversationSummary[]> => {
    console.log('🔍 [CACHE MISS] Ejecutando query a DB para user:', userId); // DEBUG
    const result = await db.query(
    `
    SELECT 
      id,
      title,
      language,
      level,
      corrections_count,
      message_count,
      created_at
    FROM conversations
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId]
  );

    return result.rows.map((row: {
    id: string;
    title: string;
    language: string;
    level: string;
    corrections_count: number;
    message_count: number;
    created_at: string;
  }) => ({
    id: row.id,
    title: row.title,
    language: row.language,
    level: row.level,
    correctionsCount: row.corrections_count,
    messageCount: row.message_count,
    createdAt: row.created_at,
  }));
},
  ['conversations-list'], // Cache key base
  {
    tags: ['conversations'], // Tag para revalidar
    revalidate: 3600, // 1 hora (opcional, para safety) Para que dure "todo el día": Podemos poner revalidate: 86400 (24 horas) o incluso más
  }
);