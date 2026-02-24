'use server'

import { db } from '@/services/database/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { 
  ConversationInput, 
  ConversationRecord,
  CorrectedMessage 
} from '@/features/transcription/domain/conversation/conversation.types'

import { revalidatePath } from 'next/cache'; // Revalidar por path para el listado, así se actualiza si entramos desde el listado justo después de crear una conversación
import { revalidateTag } from 'next/cache'; // Revalidar por tag para la página de detalle, así se actualiza si entramos desde el listado justo después de crear una conversación

/**
 * Guarda una conversación completa en la base de datos
 * @param input Datos de la conversación a guardar
 * @returns La conversación guardada con su ID
 */
export async function saveConversation(
  input: ConversationInput
): Promise<{ success: true; data: ConversationRecord } | { success: false; error: string }> {
  try {
    // 1. Validar sesión del usuario
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const userId = session.user.id

    // 2. Calcular contadores desde el correctionJson
    const correctionsCount = input.correctionJson.filter(
      (msg: CorrectedMessage) => msg.correction !== null
    ).length
    
    const messageCount = input.correctionJson.length

    // 3. Insertar en la DB usando pg
    const result = await db.query(
      `
      INSERT INTO conversations (
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
        message_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING 
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
      `,
      [
        userId,
        input.title,
        input.language,
        input.level,
        'completed',           // status
        input.originalText,
        JSON.stringify(input.correctionJson), // pg necesita string para jsonb
        input.durationSeconds || null,
        input.targetSpeaker,
        input.correctionType,
        correctionsCount,
        messageCount,
      ]
    )

    const data = result.rows[0]

    // 4. Revalidar el path del listado para que se actualice
    revalidatePath('/conversations')

    revalidateTag('conversations'); // limpia el cache de unstable_cache del detalle, para que si entramos justo después de crear una conversación, se muestre actualizada

    // 5. Mapear respuesta de DB a nuestro type
    const conversationRecord: ConversationRecord = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      language: data.language,
      level: data.level,
      targetSpeaker: data.target_speaker,
      correctionType: data.correction_type,
      originalText: data.original_text,
      correctionJson: data.correction_json, // pg ya parsea jsonb a objeto
      durationSeconds: data.duration_seconds,
      status: data.status,
      correctionsCount: data.corrections_count,
      messageCount: data.message_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    return { success: true, data: conversationRecord }

  } catch (error) {
    console.error('Error guardando conversación:', error)
    return { success: false, error: 'Error al guardar en la base de datos' }
  }
}