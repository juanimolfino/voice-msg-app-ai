/**
 * Modelos del dominio conversación
 */

export type Speaker = "A" | "B" | "Z"; // Z = ambos, para correcciones generales

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