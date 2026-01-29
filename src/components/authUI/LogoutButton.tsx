"use client"

import { signOut } from "next-auth/react"

export function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })}>
      Logout
    </button>
  )
}

// 📌 Qué hace:

// Borra cookie
// Borra sesión en DB
// Redirect a /login