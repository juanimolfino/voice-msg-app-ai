// src/services/credits/creditsService.ts
// =====================================================
// SISTEMA DE CRÉDITOS CON SOPORTE PARA PLANES Y SUSCRIPCIONES
// =====================================================
// Este archivo maneja toda la lógica de créditos:
// - Free: 5 créditos de por vida
// - Pro Light: 50 conversaciones/mes + pay-as-you-go
// - Pro Unlimited: 200 conversaciones/mes (fair use)
// - Packs: Créditos comprados que expiran en 12 meses

import { db } from "@/services/database/db";

// Tipos de planes soportados
export type PlanType = 'free' | 'pro_light' | 'pro_unlimited';

// Estructura de respuesta de créditos
export interface CreditsInfo {
  credits: number;           // Créditos comprados disponibles (packs)
  plan: PlanType;            // Plan actual
  includedCredits: number;   // Cuántas incluye el plan este mes (50 o 200)
  usedCredits: number;       // Cuántas usó este mes
  availableThisMonth: number; // Cuántas le quedan este mes (included - used)
  totalAvailable: number;    // Total disponible (availableThisMonth + credits)
  resetsAt: Date | null;     // Cuándo resetea el contador mensual
  isUnlimited: boolean;      // True si es pro_unlimited y está dentro del fair use
}

/**
 * =====================================================
 * OBTENER INFORMACIÓN COMPLETA DE CRÉDITOS
 * =====================================================
 * Usado en el header para mostrar "Pro • 45/50 restantes" o "Free • 3 créditos"
 * También usado antes de procesar para verificar si puede continuar
 */
export async function getCreditsInfo(userId: string): Promise<CreditsInfo | null> {
  const result = await db.query(
    `SELECT 
      credits, 
      plan, 
      included_credits, 
      used_credits, 
      reset_at,
      subscription_ends_at
    FROM user_credits 
    WHERE user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    // Usuario nuevo: crear con 5 créditos gratis
    await db.query(
      `INSERT INTO user_credits 
       (user_id, credits, plan, included_credits, used_credits) 
       VALUES ($1, 5, 'free', 0, 0)`,
      [userId]
    );
    
    return {
      credits: 5,
      plan: 'free',
      includedCredits: 0,
      usedCredits: 0,
      availableThisMonth: 0,
      totalAvailable: 5,
      resetsAt: null,
      isUnlimited: false
    };
  }

  const row = result.rows[0];
  
  // Verificar si debe resetear el contador mensual (nuevo mes)
  const now = new Date();
  const resetAt = row.reset_at ? new Date(row.reset_at) : null;
  
  if (resetAt && now > resetAt && row.plan !== 'free') {
    // Resetear contador mensual
    await db.query(
      `UPDATE user_credits 
       SET used_credits = 0, 
           reset_at = $2,
           updated_at = NOW()
       WHERE user_id = $1`,
      [userId, getNextResetDate()]
    );
    row.used_credits = 0;
  }

  const includedCredits = row.included_credits || 0;
  const usedCredits = row.used_credits || 0;
  const availableThisMonth = Math.max(0, includedCredits - usedCredits);
  const purchasedCredits = row.credits || 0;
  
  // Pro Unlimited tiene "ilimitado" hasta 200, después usa créditos comprados
  const isUnlimited = row.plan === 'pro_unlimited' && usedCredits < 200;

  return {
    credits: purchasedCredits,
    plan: row.plan,
    includedCredits,
    usedCredits,
    availableThisMonth,
    totalAvailable: isUnlimited ? Infinity : availableThisMonth + purchasedCredits,
    resetsAt: resetAt,
    isUnlimited
  };
}

/**
 * =====================================================
 * VERIFICAR SI PUEDE PROCESAR UNA CONVERSACIÓN
 * =====================================================
 * Usado en la API antes de gastar. Devuelve true/false y razón
 */
export async function canProcessConversation(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  source?: 'free' | 'included' | 'purchased' | 'unlimited';
}> {
  const info = await getCreditsInfo(userId);
  
  if (!info) {
    return { allowed: false, reason: "Usuario no encontrado" };
  }

  // Caso 1: Pro Unlimited dentro del fair use (200/mes)
  if (info.isUnlimited) {
    return { allowed: true, source: 'unlimited' };
  }

  // Caso 2: Tiene créditos incluidos del plan disponibles
  if (info.availableThisMonth > 0) {
    return { allowed: true, source: 'included' };
  }

  // Caso 3: Tiene créditos comprados (packs)
  if (info.credits > 0) {
    return { allowed: true, source: 'purchased' };
  }

  // Caso 4: Free sin créditos
  return { 
    allowed: false, 
    reason: "Sin créditos disponibles. Actualizá a Pro o comprá más." 
  };
}

/**
 * =====================================================
 * GASTAR UN CRÉDITO (DESCONTAR)
 * =====================================================
 * Lógica: 
 * 1. Si es Pro Unlimited y usó < 200: solo incrementar used_credits
 * 2. Si tiene créditos incluidos disponibles: incrementar used_credits
 * 3. Si no: descontar de credits (comprados)
 * 
 * Devuelve true si pudo gastar, false si no
 */
export async function spendCredit(userId: string): Promise<boolean> {
  // Verificar primero para determinar de dónde descontar
  const check = await canProcessConversation(userId);
  
  if (!check.allowed) return false;

  if (check.source === 'unlimited' || check.source === 'included') {
    // Descontar de los incluidos (incrementar used_credits)
    const result = await db.query(
      `UPDATE user_credits 
       SET used_credits = used_credits + 1,
           updated_at = NOW()
       WHERE user_id = $1
       RETURNING used_credits, included_credits`,
      [userId]
    );
    return result.rows.length > 0;
  } else {
    // Descontar de créditos comprados
    const result = await db.query(
      `UPDATE user_credits 
       SET credits = GREATEST(credits - 1, 0),
           updated_at = NOW()
       WHERE user_id = $1 AND credits > 0
       RETURNING credits`,
      [userId]
    );
    return result.rows.length > 0 && result.rows[0].credits >= 0;
  }
}

/**
 * =====================================================
 * REEMBOLSAR UN CRÉDITO (CUANDO FALLA LA API)
 * =====================================================
 * Solo reembolsa si gastó de créditos comprados, no de los incluidos
 * porque esos son "use it or lose it" mensuales
 */
export async function refundCredit(userId: string): Promise<void> {
  // Solo reembolsar si no es plan ilimitado (no tiene sentido)
  await db.query(
    `UPDATE user_credits 
     SET credits = credits + 1,
         updated_at = NOW()
     WHERE user_id = $1 
       AND plan != 'pro_unlimited'
       AND credits >= 0`,
    [userId]
  );
}

/**
 * =====================================================
 * AGREGAR CRÉDITOS COMPRADOS (PACKS)
 * =====================================================
 * Usado por el webhook cuando compra un pack de 10 o 50
 */
export async function addPurchasedCredits(
  userId: string, 
  amount: number
): Promise<void> {
  await db.query(
    `UPDATE user_credits 
     SET credits = credits + $2,
         total_purchased_credits = total_purchased_credits + $2,
         last_credit_purchase_at = NOW(),
         updated_at = NOW()
     WHERE user_id = $1`,
    [userId, amount]
  );
}

/**
 * =====================================================
 * ACTIVAR SUSCRIPCIÓN PRO
 * =====================================================
 * Usado por webhook cuando paga suscripción mensual
 */
export async function activateProSubscription(
  userId: string,
  plan: 'pro_light' | 'pro_unlimited',
  stripeSubscriptionId: string,
  stripeCustomerId: string
): Promise<void> {
  const includedCredits = plan === 'pro_light' ? 50 : 200;
  
  await db.query(
    `UPDATE user_credits 
     SET plan = $2,
         included_credits = $3,
         used_credits = 0,
         stripe_subscription_id = $4,
         stripe_customer_id = $5,
         reset_at = $6,
         subscription_ends_at = NULL,
         updated_at = NOW()
     WHERE user_id = $1`,
    [
      userId, 
      plan, 
      includedCredits, 
      stripeSubscriptionId, 
      stripeCustomerId,
      getNextResetDate()
    ]
  );
}

/**
 * =====================================================
 * CANCELAR SUSCRIPCIÓN (DOWNGRADE GRACEFUL)
 * =====================================================
 * No baja a free inmediatamente, mantiene hasta subscription_ends_at
 * Usado por webhook cuando cancela en Stripe
 */
export async function scheduleDowngrade(
  userId: string,
  subscriptionEndsAt: Date
): Promise<void> {
  await db.query(
    `UPDATE user_credits 
     SET subscription_ends_at = $2,
         updated_at = NOW()
     WHERE user_id = $1`,
    [userId, subscriptionEndsAt]
  );
}

/**
 * =====================================================
 * EJECUTAR DOWNGRADE (CUANDO TERMINA EL MES PAGADO)
 * =====================================================
 * Llamado por cron job o cuando verificamos y detectamos que pasó la fecha
 */
export async function executeDowngrade(userId: string): Promise<void> {
  await db.query(
    `UPDATE user_credits 
     SET plan = 'free',
         included_credits = 0,
         used_credits = 0,
         stripe_subscription_id = NULL,
         reset_at = NULL,
         subscription_ends_at = NULL,
         updated_at = NOW()
     WHERE user_id = $1 
       AND subscription_ends_at IS NOT NULL 
       AND subscription_ends_at <= NOW()`,
    [userId]
  );
}

/**
 * =====================================================
// src/services/credits/creditsService.ts (continuación)
// =====================================================

/**
 * =====================================================
 * VERIFICAR ACCESO DE USUARIO (SEGURIDAD)
 * =====================================================
 * Previene que usuario A modifique créditos de usuario B
 */
export function verifyUserAccess(
  sessionUserId: string,
  requestedUserId?: string
): boolean {
  if (!requestedUserId) return true;
  return sessionUserId === requestedUserId;
}

/**
 * =====================================================
 * HELPERS INTERNOS
 * =====================================================
 */

// Calcula el primer día del próximo mes (para reset de créditos mensuales)
function getNextResetDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}