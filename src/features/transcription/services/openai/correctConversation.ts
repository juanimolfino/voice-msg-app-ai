import { buildCorrectionPrompt } from "./correction-prompt";
import { openai } from "@/services/openai/client";

//* 🧼 Regla de oro
// Services → devuelven objetos
// API routes → devuelven NextResponse

export async function correctSpeakerGrammar(input: {
  conversation: string;
  language: string;
  level: string;
  correct: { A: boolean; B: boolean };
}) {
  const { conversation, language, level, correct } = input;

  if (!conversation || !language || !level || !correct) {
    throw new Error("Missing required fields");
  }

  const prompt = buildCorrectionPrompt({
    conversation,
    language,
    level,
    correct,
  });

  //    console.log("open ai services: Correction prompt:", prompt);

  try {
    const response = await openai.responses.create({
  model: "gpt-4.1-mini",
        temperature: 0.2,
        
  input: [
    {
      role: "user",
      content: prompt,
    },
  ],

//   response_format: {
//     type: "json_schema",
//     json_schema: {
//       name: "grammar_correction",
//       schema: {
//         type: "object",
//         properties: {
//           messages: {
//             type: "array",
//             items: {
//               type: "object",
//               properties: {
//                 speaker: { type: "string" },
//                 original: { type: "string" },
//                 correction: { type: ["string", "null"] },
//                 suggestion: { type: ["string", "null"] },
//               },
//               required: ["speaker", "original", "correction", "suggestion"],
//             },
//           },
//         },
//         required: ["messages"],
//       },
//     },
//   } as any,
});


    console.log("response chat gpt status", response);
    //   if (response.status) {
    //     throw new Error("Missing required fields");
    //   }

    const text = response.output_text;
   // const json = response.output_parsed;

    const json = JSON.parse(text);

    if (!json) {
      throw new Error("Response was not valid JSON");
    }

    return json;
  } catch (err) {
    console.error("AI correction error:", err);
    throw new Error("Response was not valid JSON");
  }
}

//       response_format: {
//   type: "json_schema",
//   json_schema: {
//     name: "GrammarCorrection",
//     schema: {
//       type: "object",
//       properties: {
//         messages: {
//           type: "array",
//           items: {
//             type: "object",
//             properties: {
//               speaker: { enum: ["A", "B"] },
//               original: { type: "string" },
//               correction: { type: ["string", "null"] },
//               suggestion: { type: ["string", "null"] }
//             },
//             required: ["speaker", "original", "correction", "suggestion"]
//           }
//         }
//       },
//       required: ["messages"]
//     }
//   }
// }
