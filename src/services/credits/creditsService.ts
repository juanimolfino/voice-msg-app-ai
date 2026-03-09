// src/services/credits/creditsService.ts
import { db } from "@/services/database/db";

/**
 * Verifica si el usuario tiene créditos disponibles
 */
export async function checkCredits(userId: string): Promise<boolean> {
  const result = await db.query(
    "SELECT credits FROM user_credits WHERE user_id = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    // Usuario nuevo: crear con 5 créditos gratis
    await db.query(
      "INSERT INTO user_credits (user_id, credits, plan) VALUES ($1, 5, 'free')",
      [userId]
    );
    return true; // Tiene 5 créditos
  }

  const credits = result.rows[0].credits;
  return credits === -1 || credits > 0; // -1 = ilimitado (plan pro)
}

/**
 * Obtiene créditos actuales del usuario
 */
export async function getCredits(userId: string): Promise<number> {
  const result = await db.query(
    "SELECT credits FROM user_credits WHERE user_id = $1",
    [userId]
  );

  if (result.rows.length === 0) return 0;
  return result.rows[0].credits;
}

/**
 * Descuenta 1 crédito (con verificación de seguridad)
 */
export async function spendCredit(userId: string): Promise<boolean> {
  // Seguridad: solo descontar si tiene créditos > 0 (no ilimitado)
  const result = await db.query(
    `
    UPDATE user_credits 
    SET credits = credits - 1 
    WHERE user_id = $1 
      AND credits > 0 
      AND plan != 'pro'
    RETURNING credits
    `,
    [userId]
  );

  return result.rows.length > 0; // True si se actualizó algo
}

/**
 * Reembolsa 1 crédito (cuando hay error en el pipeline)
 */
export async function refundCredit(userId: string): Promise<void> {
  // Seguridad: solo reembolsar si no es plan pro (ilimitado)
  await db.query(
    `
    UPDATE user_credits 
    SET credits = credits + 1 
    WHERE user_id = $1 
      AND plan != 'pro'
    `,
    [userId]
  );
}

/**
 * Verifica que el userId de la sesión coincida con el de la operación
 * Previene: usuario A intenta modificar créditos de usuario B
 */
export function verifyUserAccess(
  sessionUserId: string,
  requestedUserId?: string
): boolean {
  if (!requestedUserId) return true; // Operación sobre sí mismo
  return sessionUserId === requestedUserId;
}