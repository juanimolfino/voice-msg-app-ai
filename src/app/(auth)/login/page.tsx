"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    await signIn("email", {
      email,
      callbackUrl: "/",
    })

    setSent(true)
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h1>Login</h1>

      {sent ? (
        <p>📩 Te enviamos un link mágico a tu email</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">
            Enviarme link mágico
          </button>
        </form>
      )}
    </div>
  )
}
