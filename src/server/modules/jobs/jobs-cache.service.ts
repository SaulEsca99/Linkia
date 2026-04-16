import { db } from "@/server/db";
import { jobsCache } from "./jobs-cache.schema";
import { fetchJobs, calculateMatch } from "./jobs.service";
import { eq } from "drizzle-orm";
import type { JobListing } from "./jobs.service";

const MAX_DAILY_REFRESHES = 5;
const CACHE_TTL_HOURS = 12;

export type JobWithMatch = JobListing & { match: number };

export type CacheStatus = {
  canRefresh: boolean;
  refreshesLeft: number;
  nextRefreshIn?: number; // minutes until daily reset
  lastRefreshed?: Date;
  isStale: boolean;
  searchFailed: boolean; // true si la última búsqueda no devolvió resultados
};

// ─── Términos que NO sirven como query en portales de empleo ──────────────
const BLOCKED_QUERY_TERMS = new Set([
  "tcp/ip", "http", "https", "windows server", "windows", "unix",
  "linux", "microsoft active directory", "active directory",
  "power house", "powerhouse", "harvest", "endevor", "rtc", "a24",
  "maximo", "ibm maximo", "datapower", "aspel", "sap basis",
  "suse linux", "suse", "smtp", "ssl", "dns", "oauth",
]);

// Términos de alta demanda que SÍ funcionan bien como query
const HIGH_VALUE_TERMS = new Set([
  "react", "node", "python", "java", "typescript", "javascript",
  "php", "golang", "rust", "kotlin", "swift", "flutter",
  "vue", "angular", "next", "nest", "django", "fastapi", "spring",
  "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
  "machine learning", "deep learning", "ai", "llm", "nlp",
  "sql", "oracle", "sql server", "nosql",
  "devops", "backend", "frontend", "fullstack", "mobile",
  "sap", "salesforce", "servicenow", "jira",
]);

// Acortar una skill para usarla en un query de búsqueda
// "Oracle (Procedures, Triggers, Tablas, Vistas, Secuencias)" → "Oracle"
// "Linux (Suse Linux Server Enterprise 11)" → "Linux"
function sanitizeSkill(skill: string): string {
  return skill
    .replace(/\(.*\)/g, "")        // elimina paréntesis y su contenido
    .replace(/[^a-zA-Z0-9+#. ]/g, " ") // elimina caracteres especiales
    .trim()
    .split(/\s+/)
    .slice(0, 2)                   // máx 2 palabras
    .join(" ")
    .toLowerCase();
}

function buildSmartQuery(searchQuery: string, profileSkills: string[], profileTitle: string): string {
  if (searchQuery) return searchQuery;

  // Sanitizar todas las skills primero
  const sanitized = profileSkills.map(sanitizeSkill).filter(s => s.length >= 2 && s.length <= 20);

  // 1. Skills de alta demanda (las más buscadas en portales)
  const highValue = sanitized.filter(s =>
    HIGH_VALUE_TERMS.has(s) || [...HIGH_VALUE_TERMS].some(t => s.includes(t) || t.includes(s))
  );

  // 2. Skills limpias sin términos bloqueados
  const clean = sanitized.filter(s => !BLOCKED_QUERY_TERMS.has(s));

  // 3. Limpiar el título (solo primeras 3 palabras)
  const cleanTitle = profileTitle.split(" ").slice(0, 3).join(" ").trim();

  let queryTerms: string[];

  if (highValue.length >= 2) {
    // Tenemos skills de alta demanda — úsalas directamente
    queryTerms = highValue.slice(0, 3);
  } else if (highValue.length === 1) {
    // Solo 1 skill de alta demanda — complementar con título
    queryTerms = [cleanTitle, ...highValue].filter(Boolean).slice(0, 2);
  } else {
    // Sin skills de alta demanda — usar título + skills limpias
    queryTerms = [cleanTitle, ...clean.slice(0, 2)].filter(Boolean);
  }

  const query = queryTerms.join(" ").trim();
  return query || "desarrollador software mexico";
}

// ─── getCacheStatus ─────────────────────────────────────────────────────────
export function getCacheStatus(record: typeof jobsCache.$inferSelect | null): CacheStatus {
  if (!record) {
    return { canRefresh: true, refreshesLeft: MAX_DAILY_REFRESHES, isStale: true, searchFailed: false };
  }

  const now = new Date();

  // Reset daily count si pasaron 24h
  const dailyResetAt = record.dailyResetAt ?? record.createdAt;
  const hoursSinceReset = (now.getTime() - dailyResetAt.getTime()) / (1000 * 60 * 60);
  const effectiveCount = hoursSinceReset >= 24 ? 0 : record.refreshCount;
  const refreshesLeft = Math.max(0, MAX_DAILY_REFRESHES - effectiveCount);

  // isStale: caché mayor de 12h
  const lastUpdated = record.lastRefreshAt ?? record.createdAt;
  const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
  const isStale = hoursSinceUpdate >= CACHE_TTL_HOURS;

  // nextRefreshIn: cuántos minutos hasta que se resetea el límite diario
  const nextRefreshIn = refreshesLeft === 0
    ? Math.ceil((24 - hoursSinceReset) * 60)
    : undefined;

  const canRefresh = refreshesLeft > 0;

  return {
    canRefresh,
    refreshesLeft,
    nextRefreshIn,
    lastRefreshed: record.lastRefreshAt ?? undefined,
    isStale,
    searchFailed: record.lastSearchFailed ?? false,
  };
}

// ─── getCachedJobs ──────────────────────────────────────────────────────────
export async function getCachedJobs(
  userId: string,
  profileSkills: string[] = [],
  profileTitle = "",
): Promise<{ jobs: JobWithMatch[]; status: CacheStatus; fromCache: boolean }> {
  const records = await db.select().from(jobsCache).where(eq(jobsCache.userId, userId)).limit(1);
  const record = records[0] ?? null;
  const status = getCacheStatus(record);

  // Si no hay caché o está desactualizado → refetch automático (no cuenta contra el límite)
  if (!record || status.isStale) {
    const freshJobs = await refreshJobsCache(userId, "", profileSkills, profileTitle, false);
    const newRecords = await db.select().from(jobsCache).where(eq(jobsCache.userId, userId)).limit(1);
    return { jobs: freshJobs, status: getCacheStatus(newRecords[0] ?? null), fromCache: false };
  }

  const cachedList = (record.jobs as JobListing[]);

  // Si el caché tiene jobs[] vacío:
  // - Si fue actualizado hace menos de 30 min → ya se intentó, no re-intentar (evita loop)
  // - Si fue actualizado hace más de 30 min → re-intentar UNA vez con mejor query
  if (cachedList.length === 0) {
    const lastUpdated = record.lastRefreshAt ?? record.createdAt;
    const minsSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60);

    if (minsSinceUpdate < 30) {
      // Busqueda reciente fallida — no re-intentar, mostrar estado searchFailed
      const failedStatus = { ...status, searchFailed: true };
      return { jobs: [], status: failedStatus, fromCache: true };
    }

    // Más de 30 min desde el último intento — re-intentar con nuevo query
    const freshJobs = await refreshJobsCache(userId, "", profileSkills, profileTitle, false);
    const newRecords = await db.select().from(jobsCache).where(eq(jobsCache.userId, userId)).limit(1);
    return { jobs: freshJobs, status: getCacheStatus(newRecords[0] ?? null), fromCache: false };
  }

  const jobs = cachedList.map(job => ({
    ...job,
    match: calculateMatch([...job.tags, ...job.title.split(" ")], profileSkills),
  })).sort((a, b) => b.match - a.match);

  return { jobs, status, fromCache: true };
}

// ─── refreshJobsCache ───────────────────────────────────────────────────────
export async function refreshJobsCache(
  userId: string,
  searchQuery: string,
  profileSkills: string[],
  profileTitle: string,
  isManualRefresh: boolean,
): Promise<JobWithMatch[]> {
  const query = buildSmartQuery(searchQuery, profileSkills, profileTitle);
  const freshJobs = await fetchJobs(query, profileSkills);
  const searchFailed = freshJobs.length === 0;

  const now = new Date();
  const existing = await db.select().from(jobsCache).where(eq(jobsCache.userId, userId)).limit(1);
  const current = existing[0];

  // Calcular nuevo contador diario
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
      lastSearchFailed: searchFailed,
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
      lastSearchFailed: searchFailed,
      refreshCount: 0,
      dailyResetAt: now,
    });
  }

  return freshJobs.map(job => ({
    ...job,
    match: calculateMatch([...job.tags, ...job.title.split(" ")], profileSkills),
  })).sort((a, b) => b.match - a.match);
}
