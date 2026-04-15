/**
 * Servicio de Vacantes — agrega empleos de múltiples portales:
 * 1. JSearch (RapidAPI) → LinkedIn, Indeed, Glassdoor (requiere RAPIDAPI_KEY)
 * 2. Adzuna → empleos México/LATAM (requiere ADZUNA_APP_ID + ADZUNA_APP_KEY)
 * 3. RemoteOK → trabajos remotos (sin API key)
 */

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string; // "Tiempo completo" | "Medio tiempo" | "Becario" | "Remoto"
  salary?: string;
  description: string;
  tags: string[]; // skills / keywords
  url: string;
  source: "JSearch" | "Adzuna" | "RemoteOK";
  postedAt: string;
  logo?: string;
}

// ─── JSearch (RapidAPI) ────────────────────────────────────────────────────
async function fetchJSearch(query: string, country = "mx"): Promise<JobListing[]> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return [];

  try {
    const params = new URLSearchParams({
      query: `${query} Mexico OR LATAM OR Remoto`,
      page: "1",
      num_pages: "2",
      country,
      language: "es",
    });

    const res = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, {
      headers: {
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
      next: { revalidate: 1800 }, // Cache 30 min
    });

    if (!res.ok) return [];
    const data = await res.json();

    return (data.data ?? []).slice(0, 15).map((job: any) => ({
      id: `jsearch-${job.job_id}`,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city ? `${job.job_city}, ${job.job_country}` : (job.job_is_remote ? "Remoto" : job.job_country),
      type: job.job_employment_type === "FULLTIME" ? "Tiempo completo"
        : job.job_employment_type === "PARTTIME" ? "Medio tiempo"
        : job.job_employment_type === "INTERN" ? "Becario"
        : "Remoto",
      salary: job.job_min_salary
        ? `$${Math.round(job.job_min_salary / 1000)}k - $${Math.round(job.job_max_salary / 1000)}k ${job.job_salary_currency ?? "MXN"}`
        : undefined,
      description: (job.job_description ?? "").slice(0, 800),
      tags: job.job_required_skills?.slice(0, 6) ?? [],
      url: job.job_apply_link,
      source: "JSearch" as const,
      postedAt: job.job_posted_at_datetime_utc ?? new Date().toISOString(),
      logo: job.employer_logo ?? undefined,
    }));
  } catch {
    return [];
  }
}

// ─── Adzuna (México + LATAM) ───────────────────────────────────────────────
async function fetchAdzuna(query: string): Promise<JobListing[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  try {
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      results_per_page: "15",
      what: query,
      sort_by: "date",
    });

    const res = await fetch(`https://api.adzuna.com/v1/api/jobs/mx/search/1?${params}`, {
      next: { revalidate: 1800 },
    });

    if (!res.ok) return [];
    const data = await res.json();

    return (data.results ?? []).map((job: any) => ({
      id: `adzuna-${job.id}`,
      title: job.title,
      company: job.company?.display_name ?? "Empresa",
      location: job.location?.display_name ?? "México",
      type: job.contract_time === "full_time" ? "Tiempo completo"
        : job.contract_time === "part_time" ? "Medio tiempo" : "Tiempo completo",
      salary: job.salary_min
        ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k MXN`
        : undefined,
      description: (job.description ?? "").slice(0, 800),
      tags: (job.category?.tag ? [job.category.tag] : []),
      url: job.redirect_url,
      source: "Adzuna" as const,
      postedAt: job.created ?? new Date().toISOString(),
      logo: undefined,
    }));
  } catch {
    return [];
  }
}

// ─── RemoteOK (sin API key, trabajos remotos) ─────────────────────────────
async function fetchRemoteOK(tags: string[]): Promise<JobListing[]> {
  try {
    // RemoteOK accepts comma-separated tags as URL path
    const tagParam = tags.slice(0, 3).map(t => t.toLowerCase().replace(/[^a-z0-9]/g, "-")).join(",");
    const url = tagParam
      ? `https://remoteok.com/api?tags=${tagParam}`
      : "https://remoteok.com/api";

    const res = await fetch(url, {
      headers: { "User-Agent": "Linkia/1.0 Job Aggregator" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    const data = await res.json();

    // First item is a legal notice object, skip it
    return (Array.isArray(data) ? data.slice(1, 16) : []).map((job: any) => ({
      id: `remoteok-${job.id}`,
      title: job.position,
      company: job.company,
      location: "100% Remoto",
      type: "Remoto",
      salary: job.salary ? `$${job.salary} USD` : undefined,
      description: (job.description ?? "").replace(/<[^>]*>/g, "").slice(0, 800),
      tags: (job.tags ?? []).slice(0, 6),
      url: job.url,
      source: "RemoteOK" as const,
      postedAt: job.date ?? new Date().toISOString(),
      logo: job.company_logo ?? undefined,
    }));
  } catch {
    return [];
  }
}

// ─── Algoritmo de Match ────────────────────────────────────────────────────
export function calculateMatch(jobTags: string[], profileSkills: string[]): number {
  if (!jobTags.length || !profileSkills.length) return 50;

  const normalizedProfile = profileSkills.map(s => s.toLowerCase());
  const normalizedJob = jobTags.map(t => t.toLowerCase());

  let score = 0;
  let matched = 0;

  for (const tag of normalizedJob) {
    for (const skill of normalizedProfile) {
      if (skill.includes(tag) || tag.includes(skill)) {
        matched++;
        break;
      }
    }
  }

  score = normalizedJob.length > 0 ? (matched / normalizedJob.length) * 100 : 50;

  // Normalize to 60-98 range (avoid 0% and 100%)
  return Math.round(60 + (score / 100) * 38);
}

// ─── Función principal: agrega todas las fuentes ──────────────────────────
export async function fetchJobs(query: string, profileSkills: string[] = []): Promise<JobListing[]> {
  // Fetch all sources in parallel
  const [jsearchJobs, adzunaJobs, remoteOKJobs] = await Promise.allSettled([
    fetchJSearch(query),
    fetchAdzuna(query),
    fetchRemoteOK(profileSkills.slice(0, 3)),
  ]);

  const all: JobListing[] = [
    ...(jsearchJobs.status === "fulfilled" ? jsearchJobs.value : []),
    ...(adzunaJobs.status === "fulfilled" ? adzunaJobs.value : []),
    ...(remoteOKJobs.status === "fulfilled" ? remoteOKJobs.value : []),
  ];

  // Deduplicate by title+company
  const seen = new Set<string>();
  return all.filter(job => {
    const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
