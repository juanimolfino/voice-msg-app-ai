/**
 * Servicio de eventos para sincronización de sesión
 * Reutilizable en cualquier feature que use persistent session
 */

type SessionEventType = 'session:cleared' | 'session:saved';

class SessionEventBus extends EventTarget {
  emit(type: SessionEventType) {
    this.dispatchEvent(new CustomEvent(type));
  }

  on(type: SessionEventType, callback: () => void) {
    this.addEventListener(type, callback);
    // Return cleanup function
    return () => this.removeEventListener(type, callback);
  }
}

export const sessionEvents = new SessionEventBus();

/**
 * Funcionamiento:
 * - Cuando se guarda una sesión, se emite 'session:saved' con sessionEvents.emit('session:saved')
 * - Cuando se limpia una sesión, se emite 'session:cleared' con sessionEvents.emit('session:cleared')
 * - Cualquier componente puede suscribirse a estos eventos usando sessionEvents.on('session:saved', callback) 
 *   o sessionEvents.on('session:cleared', callback) y limpiar la suscripción cuando se desmonta.
 * 
 * Cuando se hace "clear":
 *   1. usePersistentSession limpia localStorage
 *   2. DISPARA evento 'session:cleared'
 *  
 * Los demás hooks escuchan 'session:cleared':
 *   - useTranscription → resetea sus estados
 *   - useGrammarCorrection → resetea loading/error
 *   - TranscriptionContainer → resetea correctionResult
 */