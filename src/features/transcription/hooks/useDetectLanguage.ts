'use client'

import { useState, useCallback, useEffect } from 'react'
import { sessionEvents } from '@/services/events/sessionEvents'

type DetectStatus = 'idle' | 'detecting' | 'success' | 'error'

interface UseDetectLanguageReturn {
  detect: (text: string) => Promise<string>
  language: string | null
  status: DetectStatus
  isDetecting: boolean
  error: string | null
  restore: (data: { language: string }) => void // NUEVO
}

export function useDetectLanguage(): UseDetectLanguageReturn {
  const [status, setStatus] = useState<DetectStatus>('idle')
  const [language, setLanguage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Escuchar limpieza de sesión
  useEffect(() => {
    const cleanup = sessionEvents.on('session:cleared', () => {
      setStatus('idle')
      setLanguage(null)
      setError(null)
    })
    return cleanup
  }, [])

  const detect = useCallback(async (text: string): Promise<string> => {
    setStatus('detecting')
    setError(null)

    try {
      const res = await fetch('/api/detect-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error detectando idioma')
      }

      const data = await res.json()
      setLanguage(data.language)
      setStatus('success')
      return data.language

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado'
      setError(message)
      setStatus('error')
      throw err
    }
  }, [])

  // NUEVO: Restaurar desde localStorage
  const restore = useCallback((data: { language: string }) => {
    if (!data.language) return
    setLanguage(data.language)
    setStatus('success')
  }, [])

  return {
    detect,
    language,
    status,
    isDetecting: status === 'detecting',
    error,
    restore, // NUEVO
  }
}