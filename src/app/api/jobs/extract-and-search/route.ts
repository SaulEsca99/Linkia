import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { GoogleGenAI } from "@google/genai";
import { refreshJobsCache, getCachedJobs, getCacheStatus } from "@server/modules/jobs/jobs-cache.service";
import { db } from "@/server/db";
import { cvs } from "@server/modules/cv/infrastructure/db/cv.schema";
import { jobsCache } from "@server/modules/jobs/jobs-cache.schema";
import { eq, desc } from "drizzle-orm";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function extractSkillsFromText(text: string): Promise<{ skills: string[]; title: string }> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Del siguiente texto de CV, extrae SOLO:
1. El título profesional principal (máx 5 palabras)
2. Lista de hasta 12 habilidades técnicas más relevantes para búsqueda de empleo

Responde ÚNICAMENTE en JSON:
{"title": "...", "skills": ["skill1", "skill2", ...]}

TEXTO:
${text.slice(0, 4000)}`,
    config: { temperature: 0.05 },
  });

  try {
    let raw = response.text ?? "{}";
    raw = raw.replace(/```json\s*/i, "").replace(/```\s*/i, "").trim();
    const parsed = JSON.parse(raw);
    return {
      title: parsed.title ?? "",
      skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 12) : [],
    };
  } catch {
    return { title: "", skills: [] };
  }
}

// POST — recibe PDF, extrae skills, busca empleos (no guarda en cvs)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Solo archivos PDF" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: "No se pudo leer el PDF. Usa un PDF con texto seleccionable." }, { status: 422 });
    }

    // Check rate limit before refreshing
    const cacheRecords = await db.select().from(jobsCache).where(eq(jobsCache.userId, userId)).limit(1);
    const status = getCacheStatus(cacheRecords[0] ?? null);
    if (!status.canRefresh) {
      return NextResponse.json({
        error: `Límite de búsquedas alcanzado. Intenta en ${status.nextRefreshIn} minutos.`,
        rateLimited: true,
        nextRefreshIn: status.nextRefreshIn,
      }, { status: 429 });
    }

    const { title, skills } = await extractSkillsFromText(text);
    const jobs = await refreshJobsCache(userId, title, skills, title, true);

    return NextResponse.json({
      success: true,
      jobs,
      detectedTitle: title,
      detectedSkills: skills,
      status: getCacheStatus((await db.select().from(jobsCache).where(eq(jobsCache.userId, userId)).limit(1))[0] ?? null),
      sources: {
        jsearch: jobs.filter(j => j.source === "JSearch").length,
        adzuna: jobs.filter(j => j.source === "Adzuna").length,
        remoteok: jobs.filter(j => j.source === "RemoteOK").length,
      },
    });
  } catch (error) {
    console.error("[extract-and-search POST]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// GET — si ya tiene CV analizado, usa esas skills para cargar empleos del caché
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  try {
    const userCv = await db.select().from(cvs).where(eq(cvs.userId, userId)).orderBy(desc(cvs.createdAt)).limit(1);
    const skills = userCv[0]?.parsedProfile?.skills ?? [];
    const title = userCv[0]?.parsedProfile?.experience?.[0]?.title ?? "";

    const { jobs, status, fromCache } = await getCachedJobs(userId, skills, title);
    return NextResponse.json({
      success: true,
      jobs,
      status,
      fromCache,
      hasPreviousCV: skills.length > 0,
      detectedSkills: skills,
    });

  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
