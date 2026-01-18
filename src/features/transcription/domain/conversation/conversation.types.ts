/**
 * Modelos del dominio conversación
 */

export type Speaker = "A" | "B";

export type Message = {
  speaker: Speaker;
  text: string;
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