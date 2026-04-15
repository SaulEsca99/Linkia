import { db } from "@server/db";
import { cvs } from "@server/modules/cv/infrastructure/db/cv.schema";
import { analyzeCV } from "./openai-analyzer";
import { generateLatexFromProfile } from "./generate-latex";
import { refreshJobsCache } from "@server/modules/jobs/jobs-cache.service";
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
    // 1. Analizar con OpenAI y Generar LaTeX
    const profile = await analyzeCV(input.rawText);
    const latexContent = await generateLatexFromProfile(profile);

    // 2. Guardar en DB
    await db.insert(cvs).values({
      userId: input.userId,
      originalFileName: input.fileName,
      originalText: input.rawText,
      blobUrl: input.blobUrl ?? null,
      parsedProfile: profile,
      latexContent: latexContent,
    });

    // 3. Disparar búsqueda de empleos en background basada en el perfil del CV
    const skills = profile.skills ?? [];
    const title = profile.experience?.[0]?.title ?? "";
    // Fire and forget — no bloquea la respuesta al usuario
    refreshJobsCache(input.userId, "", skills, title, false).catch(err =>
      console.error("[analyzeCvUseCase] Job cache refresh failed:", err)
    );

    return {
      success: true,
      profile,
      latexContent,
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
