'use client'

import { useEffect } from 'react'
import { sessionEvents } from '@/services/events/sessionEvents'

// Key usada en sessionStorage para indicar qué limpiar
const CLEAR_SESSION_KEY = 'clear_session_key'

export function ClearSessionOnMount() {
  useEffect(() => {
    // Solo corre en cliente
    const keyToClear = sessionStorage.getItem(CLEAR_SESSION_KEY)
    
    if (keyToClear) {
      // Borrar del localStorage
      localStorage.removeItem(keyToClear)
      // Notificar a otros componentes (por si acaso)
      sessionEvents.emit('session:cleared')
      // Limpiar el flag para no volver a ejecutar
      sessionStorage.removeItem(CLEAR_SESSION_KEY)
      
      console.log('🧹 Session limpiada:', keyToClear)
    }
  }, [])

  return null
}