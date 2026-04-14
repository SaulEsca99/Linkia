import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { analyzeCvUseCase } from "@server/modules/cv/features/analyze/analyze-cv.use-case";

/**
 * POST /api/cv/analyze
 * Recibe un PDF en FormData, extrae texto, analiza con IA
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Solo se permiten archivos PDF" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "El archivo excede 10MB" },
        { status: 400 }
      );
    }

    // Extraer texto del PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);

    if (!pdfData.text || pdfData.text.trim().length < 50) {
      return NextResponse.json(
        { error: "No se pudo extraer suficiente texto del PDF" },
        { status: 422 }
      );
    }

    // Analizar
    const result = await analyzeCvUseCase({
      userId,
      fileName: file.name,
      rawText: pdfData.text,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      profile: result.profile,
      message: "CV analizado exitosamente",
    });
  } catch (error) {
    console.error("[POST /api/cv/analyze] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
