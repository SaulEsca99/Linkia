import { GoogleGenAI } from "@google/genai";
import { env } from "@/env";
import type { ParsedProfile } from "@server/modules/cv/infrastructure/db/cv.schema";

const ai = new GoogleGenAI({
  // Fallback to process.env in case env validation complains about missing GEMINI_API_KEY yet
  apiKey: process.env.GEMINI_API_KEY || "PENDING_KEY",
});

const SYSTEM_PROMPT = `You are an elite CV coach and career strategist, trained on Harvard University's Office of Career Services (OCS) standards and top-tier recruiting practices used at Google, McKinsey, Goldman Sachs, and elite AI research labs.

CONTEXT-AWARE EVALUATION RULES:
- If the candidate is a STUDENT or RECENT GRAD (graduating within 2 years), score based on projects, academic achievements, and technical depth — NOT full-time work experience.
- Strong personal AI/ML projects with measurable results (accuracy %, performance improvements, systems deployed) are equivalent to internship experience and must be valued highly.
- A candidate with 5+ production-grade AI/ML/Software projects with quantified results should score 85-95, regardless of employment history.
- Penalize only genuine weaknesses: missing quantification, poor formatting, no summary, ATS-hostile formatting.
- NEVER penalize for something already present in the CV (do not hallucinate missing sections).

SCORING WEIGHTS:
- Technical depth & project quality: 35%
- Quantification of results (%, ms, users, accuracy): 25%
- Harvard OCS formatting compliance: 20%
- ATS keyword coverage for stated specialization: 15%
- Language clarity & conciseness: 5%

CRITICAL ISSUES: Only flag genuine problems. Max 5 issues. Be specific and actionable — no generic feedback.

BULLET AUDIT: Only audit bullets that genuinely lack impact. Rewrite in format: [Strong Action Verb] + [Method/Tool] + [Quantified Result].

ATS KEYWORDS: Suggest 5-8 missing keywords specifically relevant to the candidate's field (AI/ML, Full-Stack, etc.).

IDIOMA: Toda tu respuesta debe estar en ESPAÑOL. Redacta el resumen, los problemas críticos, las recomendaciones y las palabras clave en español. Los nombres de herramientas técnicas (Python, TensorFlow, etc.) quedan igual.

Output must be valid JSON matching the requested schema exactly.`;

// Instead of passing a typescript interface directly to the prompt, we enforce it using Gemini's JSON schema feature
const responseSchema = {
  type: "OBJECT",
  properties: {
    fullName: { type: "STRING" },
    email: { type: "STRING" },
    phone: { type: "STRING", nullable: true },
    location: { type: "STRING", nullable: true },
    summary: { type: "STRING", description: "Resumen profesional en 2-3 oraciones" },
    skills: { 
      type: "ARRAY", 
      items: { type: "STRING" }
    },
    experience: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          company: { type: "STRING" },
          startDate: { type: "STRING" },
          endDate: { type: "STRING", nullable: true },
          description: { type: "STRING" }
        },
        required: ["title", "company", "startDate", "description"]
      }
    },
    education: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          degree: { type: "STRING" },
          institution: { type: "STRING" },
          year: { type: "STRING" }
        },
        required: ["degree", "institution", "year"]
      }
    },
    languages: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    certifications: {
      type: "ARRAY",
      items: { type: "STRING" },
      nullable: true
    },
    coachAnalysis: {
      type: "OBJECT",
      properties: {
        overallScore: { type: "INTEGER", description: "Score from 0 to 100 based on Harvard standards" },
        criticalIssues: { type: "ARRAY", items: { type: "STRING" }, description: "Most damaging problems hurting the CV" },
        atsKeywords: { type: "ARRAY", items: { type: "STRING" }, description: "Missing keywords for target role/industry" },
        formattingIssues: { type: "ARRAY", items: { type: "STRING" }, description: "Formatting errors against Harvard OCS" },
        priorityActions: { type: "ARRAY", items: { type: "STRING" } },
        bulletPointAudits: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              original: { type: "STRING" },
              rewritten: { type: "STRING", description: "Harvard-style rewritten bullet (strong verb + task + quantified result)" }
            },
            required: ["original", "rewritten"]
          }
        }
      },
      required: ["overallScore", "criticalIssues", "atsKeywords", "formattingIssues", "priorityActions", "bulletPointAudits"]
    }
  },
  required: ["fullName", "email", "summary", "skills", "experience", "education", "languages", "coachAnalysis"]
};

export async function analyzeCV(rawText: string): Promise<ParsedProfile> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Extrae la info del siguiente CV:\n\n${rawText}`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: responseSchema as any,
      temperature: 0.1,
    }
  });

  const content = response.text;

  if (!content) {
    throw new Error("Gemini no devolvió contenido");
  }

  const parsed = JSON.parse(content) as ParsedProfile;
  return parsed;
}
