// src/services/credits/getCreditsAction.ts
'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCredits, checkCredits } from "./creditsService";

/**
 * Server Action: Obtiene créditos del usuario actual
 * Usar en Server Components (páginas)
 */
export async function getUserCredits(): Promise<{
  success: true;
  credits: number;
  hasCredits: boolean;
} | {
  success: false;
  error: string;
}> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { success: false, error: "No autenticado" };
  }

  try {
    const credits = await getCredits(session.user.id);
    const hasCredits = await checkCredits(session.user.id);
    
    return { success: true, credits, hasCredits };
  } catch (error) {
    return { success: false, error: `Error al obtener créditos: ${error instanceof Error ? error.message : "Error desconocido"}` };
  }
}