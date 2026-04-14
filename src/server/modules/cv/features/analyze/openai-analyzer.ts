import OpenAI from "openai";
import { env } from "@/env";
import type { ParsedProfile } from "@server/modules/cv/infrastructure/db/cv.schema";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Eres un experto analizador de currículums vitae (CVs) para el mercado laboral de LATAM.
Tu tarea es extraer información estructurada de un CV en texto plano.

Responde SIEMPRE en formato JSON válido con esta estructura exacta:
{
  "fullName": "string",
  "email": "string",
  "phone": "string o null",
  "location": "string o null",
  "summary": "resumen profesional en 2-3 oraciones",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "title": "puesto",
      "company": "empresa",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM o null si es actual",
      "description": "descripción breve"
    }
  ],
  "education": [
    {
      "degree": "título",
      "institution": "institución",
      "year": "año de graduación"
    }
  ],
  "languages": ["Español", "Inglés", ...],
  "certifications": ["cert1", "cert2", ...]
}

Si algún campo no se encuentra en el CV, usa null para campos opcionales o un array vacío para listas.
Extrae toda la información posible. Sé preciso con los nombres de empresas y títulos.`;

export async function analyzeCV(rawText: string): Promise<ParsedProfile> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analiza el siguiente CV y extrae la información estructurada:\n\n${rawText}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI no devolvió contenido");
  }

  const parsed = JSON.parse(content) as ParsedProfile;
  return parsed;
}
