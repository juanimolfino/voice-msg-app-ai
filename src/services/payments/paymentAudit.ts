// src/services/payments/paymentAudit.ts
import { db } from "@/services/database/db";

type PaymentType = 'credits_10' | 'credits_50' | 'pro_light' | 'pro_unlimited';

interface PaymentLogInput {
  userId: string;
  sessionId: string;
  type: PaymentType;
  amount: number; // en centavos
  currency?: string;
  paymentIntentId?: string;
}

interface PaymentMetadata {
  processing_source?: string;
  mode?: string;
  type?: string;
  credits_added?: number;
  [key: string]: string | number | undefined;
}

/**
 * Verifica si un pago ya fue procesado (IDEMPOTENCIA)
 */
export async function isPaymentAlreadyProcessed(sessionId: string): Promise<boolean> {
  const result = await db.query(
    "SELECT status FROM payment_logs WHERE stripe_session_id = $1",
    [sessionId]
  );
  
  if (result.rows.length === 0) return false;
  
  const status = result.rows[0].status;
  return status === 'completed' || status === 'duplicate';
}

/**
 * Registra el inicio de un pago
 */
export async function logPaymentStart(data: PaymentLogInput): Promise<void> {
  try {
    await db.query(
      `
      INSERT INTO payment_logs 
        (user_id, stripe_session_id, stripe_payment_intent_id, type, amount, currency, status)
      VALUES 
        ($1, $2, $3, $4, $5, $6, 'pending')
      ON CONFLICT (stripe_session_id) 
      DO NOTHING
      `,
      [data.userId, data.sessionId, data.paymentIntentId, data.type, data.amount, data.currency || 'aud']
    );
  } catch (error) {
    console.error("Error logging payment start:", error);
  }
}

/**
 * Marca un pago como completado
 */
export async function logPaymentCompleted(
  sessionId: string, 
  metadata?: PaymentMetadata
): Promise<void> {
  try {
    console.log(`✅ log payment complete, Marking session ${sessionId} as completed. Metadata:`, metadata);
    await db.query(
      `
      UPDATE payment_logs 
      SET status = 'completed', 
          processed_at = NOW()
      WHERE stripe_session_id = $1
      `,
      [sessionId]
    );
  } catch (error) {
    console.error("Error logging payment completion:", error);
  }
}

/**
 * Marca un pago como duplicado
 */
export async function logPaymentDuplicate(sessionId: string): Promise<void> {
  try {
    await db.query(
      `
      UPDATE payment_logs 
      SET status = 'duplicate', 
          processed_at = NOW()
      WHERE stripe_session_id = $1
      `,
      [sessionId]
    );
  } catch (error) {
    console.error("Error logging duplicate:", error);
  }
}

/**
 * Marca un pago como fallido
 */
export async function logPaymentFailed(sessionId: string, errorMessage: string): Promise<void> {
  try {
    await db.query(
      `
      UPDATE payment_logs 
      SET status = 'failed', 
          error_message = $2,
          processed_at = NOW()
      WHERE stripe_session_id = $1
      `,
      [sessionId, errorMessage]
    );
  } catch (error) {
    console.error("Error logging payment failure:", error);
  }
}