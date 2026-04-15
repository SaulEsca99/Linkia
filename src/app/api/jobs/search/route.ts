import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { cvs } from "@server/modules/cv/infrastructure/db/cv.schema";
import { eq, desc } from "drizzle-orm";
import { getCachedJobs, refreshJobsCache, getCacheStatus } from "@server/modules/jobs/jobs-cache.service";
import { jobsCache } from "@server/modules/jobs/jobs-cache.schema";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const forceRefresh = searchParams.get("refresh") === "true";
  const searchQuery = searchParams.get("q") || "";

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // Get user's skills from their latest CV
    let profileSkills: string[] = [];
    const userCv = await db.select().from(cvs).where(eq(cvs.userId, userId)).orderBy(desc(cvs.createdAt)).limit(1);
    if (userCv[0]?.parsedProfile?.skills) {
      profileSkills = userCv[0].parsedProfile.skills;
    }

    if (forceRefresh) {
      // Check rate limit before refreshing
      const records = await db.select().from(jobsCache).where(eq(jobsCache.userId, userId)).limit(1);
      const status = getCacheStatus(records[0] ?? null);

      if (!status.canRefresh) {
        return NextResponse.json({
          error: `Límite de actualizaciones alcanzado. Vuelve en ${status.nextRefreshIn} minutos. (${status.refreshesLeft} de 3 disponibles hoy)`,
          rateLimited: true,
          nextRefreshIn: status.nextRefreshIn,
          refreshesLeft: status.refreshesLeft,
        }, { status: 429 });
      }

      const jobs = await refreshJobsCache(userId, searchQuery, profileSkills, "", true);
      const newRecords = await db.select().from(jobsCache).where(eq(jobsCache.userId, userId)).limit(1);
      const newStatus = getCacheStatus(newRecords[0] ?? null);

      return NextResponse.json({
        success: true,
        jobs,
        fromCache: false,
        status: newStatus,
        sources: {
          jsearch: jobs.filter(j => j.source === "JSearch").length,
          adzuna: jobs.filter(j => j.source === "Adzuna").length,
          remoteok: jobs.filter(j => j.source === "RemoteOK").length,
        }
      });
    }

    // Normal load: serve from cache (auto-refreshes if stale)
    const { jobs, status, fromCache } = await getCachedJobs(userId, profileSkills, "");

    return NextResponse.json({
      success: true,
      jobs,
      fromCache,
      status,
      sources: {
        jsearch: jobs.filter(j => j.source === "JSearch").length,
        adzuna: jobs.filter(j => j.source === "Adzuna").length,
        remoteok: jobs.filter(j => j.source === "RemoteOK").length,
      }
    });

  } catch (error) {
    console.error("[jobs/search] Error:", error);
    return NextResponse.json({ success: false, error: "Error al buscar vacantes" }, { status: 500 });
  }
}
