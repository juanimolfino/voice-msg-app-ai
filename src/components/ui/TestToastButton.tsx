'use client'
// EJEMPLO DE USO DE SONNER TOASTS, SE PUEDE ELIMINAR DESPUES DE PROBAR QUE FUNCIONA CORRECTAMENTE
import { toast } from 'sonner'

export function TestToastButton() {
  return (
    <button
      onClick={() => toast.success('¡Sonner funcionando correctamente!')}
      className="px-4 py-2 bg-stone-800 text-stone-100 rounded-md hover:bg-stone-700 transition-colors"
    >
      Test Toast
    </button>
  )
}