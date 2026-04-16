/**
 * GET /api/jobs/scrape
 * Route Handler que llama al scraper service (OCC + Computrabajo).
 * Caché de 30 minutos via Next.js fetch cache / revalidate.
 *
 * Query params:
 *   keywords  — comma-separated, e.g. "PHP,MySQL,Oracle"
 *   ubicacion — optional, e.g. "Ciudad de México"
 */
import { NextRequest, NextResponse } from "next/server";
import { scrapeJobs } from "@server/modules/jobs/jobs-scraper.service";

// Revalidación automática del caché de Next.js cada 30 minutos
export const revalidate = 1800;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keywordsParam = searchParams.get("keywords") ?? "";
  const ubicacion = searchParams.get("ubicacion") ?? undefined;

  if (!keywordsParam.trim()) {
    return NextResponse.json(
      { success: false, error: "El parámetro 'keywords' es requerido (comma-separated)" },
      { status: 400 }
    );
  }

  // Parsear y limpiar keywords
  const keywords = keywordsParam
    .split(",")
    .map(k => k.trim())
    .filter(k => k.length > 0)
    .slice(0, 5); // Máx 5 keywords para URLs razonables

  try {
    const startTime = Date.now();
    const result = await scrapeJobs({ keywords, ubicacion });
    const elapsed = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        jobs: result.jobs,
        totalFound: result.totalFound,
        sources: {
          occ: result.jobs.filter(j => j.source === "OCC").length,
          computrabajo: result.jobs.filter(j => j.source === "Computrabajo").length,
        },
        errors: result.errors.length > 0 ? result.errors : undefined,
        meta: {
          keywords,
          ubicacion,
          scrapedIn: `${elapsed}ms`,
          cachedFor: "30 minutes",
        },
      },
      {
        headers: {
          // Cache-Control para hosting: CDN + browser
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("[/api/jobs/scrape] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error inesperado al hacer scraping. Intenta de nuevo.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
