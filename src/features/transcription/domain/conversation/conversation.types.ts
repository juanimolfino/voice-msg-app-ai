/**
 * Modelos del dominio conversación
 */

export type Speaker = "A" | "B" | "Z"; // Z = ambos, para correcciones generales

// Al final de conversation.types.ts, agregar:

/**
 * Target para correcciones (incluye "all" para ambos hablantes)
 */
export type TargetSpeaker = "A" | "B" | "all";

/**
 * Mensaje base dicho por una persona
 */
export type OriginalMessage = {
  speaker: Speaker;
  text: string;
};

/**
 * Corrección gramatical (opcional)
 */
export type Correction = {
  text: string;
};

/**
 * Sugerencia alternativa (opcional)
 */
export type Suggestion = {
  text: string;
};

/**
 * Grupo lógico de mensajes
 * (original + corrección + sugerencia)
 */
export type MessageGroup = {
  groupId: string;
  speaker: Speaker;

  original: OriginalMessage;

  correction?: Correction | null;
  suggestion?: Suggestion | null;
};

// corrección de toda la conversación
export type CorrectedMessage = {
  speaker: Speaker;
  original: string;
  correction: string | null;
  suggestion: string | null;
};

export type CorrectionResult = {
  messages: CorrectedMessage[];
};


export type Conversation = {
  id: string;
  title: string;
  created_at: string;
};



/**
 * Estados posibles del flujo de transcripción
 */
export type TranscriptionStatus = // 🔵 Estados del hook (useTranscription)

// Representan el flujo del negocio:

// hay o no audio seleccionado

// se está enviando a la API

// hay resultado

// hubo error de transcripción

// Son globales al feature.

  | "idle"        // no hay audio
  | "ready"       // hay audio cargado
  | "sending"     // enviando a la API
  | "done"        // transcripción lista
  | "error";      // algo falló



// conversation.types.ts

// Define qué ES una conversación en tu app.

// Ejemplo conceptual:

// Qué es un speaker

// Qué es un segmento

// Qué es una conversación

// 📌 Regla:

// Types = vocabulario del negocio

// No importa:

// OpenAI

// React

// Next

// Solo significado.


/**
 * ==========================================
 * TIPOS PARA PERSISTENCIA EN BASE DE DATOS
 * ==========================================
 */

/**
 * Niveles de idioma soportados
 */
export type LanguageLevel = "beginner" | "intermediate" | "advanced";

/**
 * Tipo de corrección solicitada
 */
export type CorrectionType = "grammar" | "vocabulary" | "fluency" | "all";

/**
 * Estado de procesamiento de la conversación
 */
export type ConversationStatus = "processing" | "completed" | "error";

/**
 * Input para crear una nueva conversación en la DB
 * (lo que envía el cliente al servidor)
 */
export type ConversationInput = {
  title: string;
  language: string;
  level: LanguageLevel;
  targetSpeaker: Speaker | "all";
  correctionType: CorrectionType;
  originalText: string;           // Raw transcription de OpenAI
  correctionJson: CorrectedMessage[];  // Array de mensajes corregidos
  durationSeconds?: number;       // Duración del audio en segundos
};

/**
 * Conversación completa como viene de la DB
 * (extiende el input con campos generados por la DB)
 */
export type ConversationRecord = ConversationInput & {
  id: string;
  userId: string;                 // UUID del usuario (de NextAuth)
  status: ConversationStatus;
  correctionsCount: number;       // Calculado al guardar
  messageCount: number;           // Calculado al guardar
  createdAt: string;              // ISO string
  updatedAt: string;              // ISO string
};

/**
 * Conversación simplificada para listados
 * (sin el JSON completo, para performance)
 */
export type ConversationSummary = {
  id: string;
  title: string;
  language: string;
  level: LanguageLevel;
  correctionsCount: number;
  messageCount: number;
  createdAt: string;
};