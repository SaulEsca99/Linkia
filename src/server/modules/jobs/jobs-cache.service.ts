import { db } from "@/server/db";
import { jobsCache } from "./jobs-cache.schema";
import { fetchJobs, calculateMatch } from "./jobs.service";
import { eq } from "drizzle-orm";
import type { JobListing } from "./jobs.service";

const MAX_DAILY_REFRESHES = 5;      // Búsquedas manuales por día
const CACHE_TTL_HOURS = 12;         // Auto-refresh si es más viejo de 12h

export type JobWithMatch = JobListing & { match: number };

export type CacheStatus = {
  canRefresh: boolean;
  refreshesLeft: number;
  nextRefreshIn?: number; // minutes until cooldown lifts
  lastRefreshed?: Date;
  isStale: boolean;
};

// ─── Check if user can refresh ─────────────────────────────────────────────
export function getCacheStatus(record: typeof jobsCache.$inferSelect | null): CacheStatus {
  if (!record) {
    return { canRefresh: true, refreshesLeft: MAX_DAILY_REFRESHES, isStale: true };
  }

  const now = new Date();

  // Reset daily count if it's been more than 24h since last daily reset
  const dailyResetAt = record.dailyResetAt ?? record.createdAt;
  const hoursSinceReset = (now.getTime() - dailyResetAt.getTime()) / (1000 * 60 * 60);
  const effectiveCount = hoursSinceReset >= 24 ? 0 : record.refreshCount;
  const refreshesLeft = Math.max(0, MAX_DAILY_REFRESHES - effectiveCount);

  // Check if cache is stale (older than TTL)
  const lastUpdated = record.lastRefreshAt ?? record.createdAt;
  const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
  const isStale = hoursSinceUpdate >= CACHE_TTL_HOURS;

  // nextRefreshIn: only set when daily limit is reached
  const nextRefreshIn = refreshesLeft === 0
    ? Math.ceil((24 - hoursSinceReset) * 60) // minutes until daily reset
    : undefined;

  const canRefresh = refreshesLeft > 0;

  return { canRefresh, refreshesLeft, nextRefreshIn, lastRefreshed: record.lastRefreshAt ?? undefined, isStale };
}

// ─── Get cached jobs for a user ────────────────────────────────────────────
export async function getCachedJobs(userId: string, profileSkills: string[] = []): Promise<{
  jobs: JobWithMatch[];
  status: CacheStatus;
  fromCache: boolean;
}> {
  const records = await db.select().from(jobsCache).where(eq(jobsCache.userId, userId)).limit(1);
  const record = records[0] ?? null;
  const status = getCacheStatus(record);

  if (!record || status.isStale) {
    // Auto-fetch if no cache or stale (doesn't count against manual refresh limit)
    const freshJobs = await refreshJobsCache(userId, "", profileSkills, false);
    return { jobs: freshJobs, status: getCacheStatus(null), fromCache: false };
  }

  // Return from cache with match scores
  const cachedList = (record.jobs as JobListing[]);

  // If cache has 0 jobs (previous search returned nothing), re-fetch silently
  if (cachedList.length === 0) {
    const freshJobs = await refreshJobsCache(userId, "", profileSkills, false);
    return { jobs: freshJobs, status: getCacheStatus(null), fromCache: false };
  }

  const jobs = cachedList.map(job => ({
    ...job,
    match: calculateMatch([...job.tags, ...job.title.split(" ")], profileSkills),
  })).sort((a, b) => b.match - a.match);

  return { jobs, status, fromCache: true };
}

// ─── Refresh jobs cache ─────────────────────────────────────────────────────
export async function refreshJobsCache(
  userId: string,
  searchQuery: string,
  profileSkills: string[],
  isManualRefresh: boolean
): Promise<JobWithMatch[]> {
  // Build a clean, marketable query — ignore very specífic legacy terms
  const GENERIC_SKILLS = new Set(["tcp/ip", "windows server", "unix", "linux", "microsoft active directory", "power house", "harvest", "endevor", "rtc", "a24"]);
  const cleanSkills = profileSkills.filter(s => !GENERIC_SKILLS.has(s.toLowerCase())).slice(0, 3);
  const query = searchQuery || (cleanSkills.join(" ") || "desarrollador software mexico");

  const freshJobs = await fetchJobs(query, profileSkills);

  const now = new Date();

  // Get current record to update counters
  const existing = await db.select().from(jobsCache).where(eq(jobsCache.userId, userId)).limit(1);
  const current = existing[0];

  // Compute new daily count
  let newRefreshCount = 1;
  let newDailyResetAt = now;
  if (current && isManualRefresh) {
    const dailyResetAt = current.dailyResetAt ?? current.createdAt;
    const hoursSinceReset = (now.getTime() - dailyResetAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceReset < 24) {
      newRefreshCount = current.refreshCount + 1;
      newDailyResetAt = dailyResetAt;
    }
  }

  if (current) {
    await db.update(jobsCache).set({
      jobs: freshJobs as any,
      searchQuery: query,
      lastRefreshAt: now,
      refreshCount: isManualRefresh ? newRefreshCount : current.refreshCount,
      dailyResetAt: isManualRefresh ? newDailyResetAt : current.dailyResetAt,
      updatedAt: now,
    }).where(eq(jobsCache.userId, userId));
  } else {
    await db.insert(jobsCache).values({
      userId,
      jobs: freshJobs as any,
      searchQuery: query,
      lastRefreshAt: now,
      refreshCount: 0,
      dailyResetAt: now,
    });
  }

  return freshJobs.map(job => ({
    ...job,
    match: calculateMatch([...job.tags, ...job.title.split(" ")], profileSkills),
  })).sort((a, b) => b.match - a.match);
}
