"use client"

import { useSession } from "next-auth/react"

export function UserGreeting() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <p>
      Hola 👋 Bienvenido <b>{session.user?.email}</b>
    </p>
  )
}
// 📌 Qué hace:
// Muestra un saludo personalizado con el correo del usuario autenticado.
// como?:
// 1. Usa el hook useSession de next-auth/react para obtener los datos de la sesión actual.
// 2. Si no hay sesión (usuario no autenticado), no renderiza nada (retorna null).
// 3. Si hay sesión, muestra un párrafo con un saludo y el correo del usuario extraído de session.user.email.

// 📌 Esto:

// Lee la cookie

// NextAuth valida sesión

// Te da session.user.email

// 👉 No toca DB
// 👉 No rompe seguridad
// 👉 Solo UI

// ¿Dónde usarlo?

// app/page.tsx

// Header

// Sidebar

// Donde quieras