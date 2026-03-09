// src/services/credits/getCreditsAction.ts
'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// 👉 Importamos SOLO getCreditsInfo (canProcessConversation se usa en APIs, no aquí)
import { getCreditsInfo } from "./creditsService";
// 👉 Importamos revalidatePath para invalidar el cache cuando se gastan créditos
import { revalidatePath } from "next/cache";

/**
 * Server Action: Obtiene créditos del usuario actual
 * Usar en Server Components (páginas) como el header que muestra "Pro • 45/50 restantes"
 * 
 * 🔄 CAMBIO IMPORTANTE: Antes devolvía solo {credits, hasCredits}
 * Ahora devuelve información rica del plan para mostrar en UI
 */
export async function getUserCredits(): Promise<{
  success: true;
  credits: number;           // Créditos comprados disponibles (packs)
  hasCredits: boolean;       // Tiene algún crédito disponible (incluido o comprado)
  plan: string;              // 'free', 'pro_light', 'pro_unlimited'
  usedThisMonth: number;     // Cuántas conversaciones usó este mes
  includedThisMonth: number; // Cuántas incluye su plan (0 para free, 50/200 para pro)
  isUnlimited: boolean;      // True si es pro_unlimited y está dentro del fair use
  availableThisMonth: number; // Cuántas le quedan este mes (incluidas - usadas)
} | {
  success: false;
  error: string;
}> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { success: false, error: "No autenticado" };
  }

  try {
    // 👉 NUEVO: Obtenemos info completa en lugar de solo el número de créditos
    const info = await getCreditsInfo(session.user.id);
    
    if (!info) {
      return { success: false, error: "No se pudo obtener información de créditos" };
    }
    
    // 👉 Calculamos si tiene créditos disponibles (considerando plan ilimitado)
    // isUnlimited = true significa que es pro_unlimited y usó menos de 200
    // totalAvailable = Infinity cuando es ilimitado, o la suma de incluidos + comprados
    const hasCredits = info.isUnlimited || info.totalAvailable > 0;
    
    return { 
      success: true, 
      credits: info.credits,        // Solo los comprados (para mostrar "Tienes 3 créditos de respaldo")
      hasCredits,                   // true si puede procesar ahora
      plan: info.plan,              // Para mostrar badge "Pro" o "Free"
      usedThisMonth: info.usedCredits,
      includedThisMonth: info.includedCredits,
      isUnlimited: info.isUnlimited,
      availableThisMonth: info.availableThisMonth // Para mostrar "45/50 restantes"
    };
  } catch (error) {
    return { success: false, error: `Error al obtener créditos: ${error instanceof Error ? error.message : "Error desconocido"}` };
  }
}

/**
 * 👉 NUEVA FUNCIÓN: Invalida el cache de créditos
 * 
 * 🎯 PROBLEMA: Cuando la API gasta un crédito, el Server Component no se entera
 * porque Next.js cachea los datos. El usuario ve el número viejo hasta que refresca.
 * 
 * 💡 SOLUCIÓN: Llamar a esta función desde la API después de gastar un crédito
 * para forzar que la próxima vez que se cargue la página, se fetchee fresh data.
 * 
 * 📝 NOTA: Esto no es instantáneo (no es WebSocket), pero en la próxima 
 * navegación o refresh mostrará el número correcto. Para updates verdaderamente
 * instantáneos necesitaríamos manejar estado en cliente (useState).
 */
export async function revalidateCreditsCache(): Promise<void> {
  // Invalida el cache de la página principal (donde se muestran los créditos)
  revalidatePath('/');
  // Si tenés otras páginas donde se muestran créditos, agregar aquí:
  // revalidatePath('/dashboard');
  // revalidatePath('/settings');
}