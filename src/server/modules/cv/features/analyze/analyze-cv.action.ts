"use server";

import pdfParse from "pdf-parse";
import { analyzeCvUseCase } from "./analyze-cv.use-case";
import type { CvAnalysisResult } from "@server/modules/cv/domain/cv.types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf"];

/**
 * Server Action: Subir y analizar un CV
 * Recibe un FormData con el archivo PDF y el userId
 */
export async function analyzeCvAction(
  formData: FormData
): Promise<CvAnalysisResult> {
  try {
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file) {
      return { success: false, error: "No se recibió ningún archivo" };
    }

    if (!userId) {
      return { success: false, error: "Usuario no identificado" };
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Solo se permiten archivos PDF",
      };
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "El archivo excede el tamaño máximo de 10MB",
      };
    }

    // Extraer texto del PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length < 50) {
      return {
        success: false,
        error:
          "No se pudo extraer suficiente texto del PDF. Asegúrate de que no sea una imagen escaneada.",
      };
    }

    // Analizar con el use case
    const result = await analyzeCvUseCase({
      userId,
      fileName: file.name,
      rawText,
    });

    return result;
  } catch (error) {
    console.error("[analyzeCvAction] Error:", error);
    return {
      success: false,
      error: "Error interno al procesar el CV",
    };
  }
}
