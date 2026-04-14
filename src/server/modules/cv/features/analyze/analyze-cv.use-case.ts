import { db } from "@server/db";
import { cvs } from "@server/modules/cv/infrastructure/db/cv.schema";
import { analyzeCV } from "./openai-analyzer";
import type { CvAnalysisResult } from "@server/modules/cv/domain/cv.types";

type AnalyzeCvInput = {
  userId: string;
  fileName: string;
  rawText: string;
  blobUrl?: string;
};

/**
 * Use case: Analizar un CV
 * 1. Envía el texto extraído a OpenAI para análisis
 * 2. Guarda el registro del CV en la base de datos
 * 3. Retorna el perfil estructurado
 */
export async function analyzeCvUseCase(
  input: AnalyzeCvInput
): Promise<CvAnalysisResult> {
  try {
    // 1. Analizar con OpenAI
    const profile = await analyzeCV(input.rawText);

    // 2. Guardar en DB
    await db.insert(cvs).values({
      userId: input.userId,
      originalFileName: input.fileName,
      originalText: input.rawText,
      blobUrl: input.blobUrl ?? null,
      parsedProfile: profile,
    });

    return {
      success: true,
      profile,
      rawText: input.rawText,
    };
  } catch (error) {
    console.error("[analyzeCvUseCase] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al analizar el CV",
    };
  }
}
