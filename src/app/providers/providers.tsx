"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1c1917',
            color: '#fafaf9',
            border: '1px solid #44403c',
          },
        }}
      />
    </SessionProvider>
  )
}