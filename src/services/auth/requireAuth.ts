import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

/**
 * Verifica que el usuario esté autenticado en una API Route
 * Devuelve la sesión o una respuesta 401
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "No autorizado. Iniciá sesión para continuar." },
        { status: 401 }
      )
    };
  }

  return {
    success: true,
    userId: session.user.id,
    session
  };
}