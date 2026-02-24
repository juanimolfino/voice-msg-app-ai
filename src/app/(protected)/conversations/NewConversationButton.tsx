'use client'

import { useRouter } from 'next/navigation'
import { sessionEvents } from '@/services/events/sessionEvents'

export function NewConversationButton() {
  const router = useRouter()
  
  const handleClick = () => {
    localStorage.removeItem('transcription-session')
    sessionEvents.emit('session:cleared')
    router.push('/')
  }
  
  return (
    <button
      onClick={handleClick}
      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
    >
      Nueva conversación
    </button>
  )
}