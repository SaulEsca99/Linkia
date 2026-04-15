"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/client/components/ui/card"
import { Button } from "@/client/components/ui/button"
import {
  MapPin, ExternalLink, Briefcase, Globe, DollarSign,
  Sparkles, CheckCircle2, AlertCircle, Star, TrendingUp,
  ChevronRight, Loader2,
} from "lucide-react"
import { cn } from "@/client/lib/utils"
import { authClient } from "@/app/lib/auth-client"
import type { JobListing } from "@server/modules/jobs/jobs.service"

type JobWithMatch = JobListing & { match: number }

function computeSkillGap(jobTags: string[], profileSkills: string[]) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")
  const normalizedProfile = profileSkills.map(norm)

  const matched: string[] = []
  const missing: string[] = []

  for (const tag of jobTags) {
    const tagNorm = norm(tag)
    const hasIt = normalizedProfile.some(skill =>
      skill.includes(tagNorm) || tagNorm.includes(skill) || skill === tagNorm
    )
    hasIt ? matched.push(tag) : missing.push(tag)
  }

  return { matched, missing }
}

function matchColor(match: number) {
  if (match >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200"
  if (match >= 70) return "text-blue-600 bg-blue-50 border-blue-200"
  return "text-amber-600 bg-amber-50 border-amber-200"
}

function matchBarColor(match: number) {
  if (match >= 85) return "from-emerald-400 to-emerald-600"
  if (match >= 70) return "from-blue-400 to-blue-600"
  return "from-amber-400 to-amber-600"
}

function aiRecommendation(match: number, missing: string[]): string {
  if (match >= 85) return "¡Excelente match! Aplica hoy y destaca tus logros cuantificados (%, valores, usuarios)."
  if (match >= 75) return missing.length > 0
    ? `Buen match. En tu carta de presentación menciona cómo compensas: ${missing.slice(0, 2).join(", ")}.`
    : "Buen match. Personaliza tu carta de presentación con métricas específicas."
  if (match >= 65) return `Match moderado. Considera aprender ${missing.slice(0, 2).join(" y ")} antes de aplicar.`
  return `Aplica si te interesa la empresa, pero fortalece primero: ${missing.slice(0, 3).join(", ")}.`
}

export default function MatchesPage() {
  const { data: session } = authClient.useSession()
  const userId = session?.user?.id

  const [jobs, setJobs] = useState<JobWithMatch[]>([])
  const [profileSkills, setProfileSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<JobWithMatch | null>(null)
  const [activeTab, setActiveTab] = useState<"top" | "all">("top")

  const loadJobs = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      // Mismo endpoint que Vacantes → datos consistentes y desde caché
      const res = await fetch(`/api/jobs/extract-and-search?userId=${userId}`)
      const data = await res.json()
      if (data.success) {
        setJobs(data.jobs ?? [])
        setProfileSkills(data.detectedSkills ?? [])
        if (data.jobs?.length > 0) setSelectedJob(data.jobs[0])
      } else {
        setError("No se pudieron cargar los empleos")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { if (userId) loadJobs() }, [userId, loadJobs])

  const topMatches = jobs.filter(j => j.match >= 75).slice(0, 10)
  const displayList = activeTab === "top" ? topMatches : jobs.slice(0, 20)

  const { matched: selectedMatched, missing: selectedMissing } = selectedJob
    ? computeSkillGap(selectedJob.tags, profileSkills)
    : { matched: [], missing: [] }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground">Cargando tus mejores matches...</p>
      </div>
    )
  }

  // ── Sin empleos ──
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-5 p-8">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <TrendingUp className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Aún no tienes matches</h2>
          <p className="text-muted-foreground max-w-sm">{error || "Ve a Vacantes para buscar empleos con tu CV y luego regresa aquí a ver tus mejores coincidencias."}</p>
        </div>
        <Button onClick={() => window.location.href = "/dashboard/vacantes"} className="gap-2">
          <Briefcase className="h-4 w-4" /> Ir a Vacantes
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-muted/30 backdrop-blur-sm border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">Mis Matches</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {topMatches.length} empleos con +75% de compatibilidad · {jobs.length} analizados
              </p>
            </div>
            {/* Tab switcher */}
            <div className="flex rounded-xl border border-border overflow-hidden bg-card">
              <button className={cn("px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5",
                activeTab === "top" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
                onClick={() => setActiveTab("top")}>
                <Star className="h-4 w-4" /> Top Matches
              </button>
              <button className={cn("px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5",
                activeTab === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
                onClick={() => setActiveTab("all")}>
                <Globe className="h-4 w-4" /> Todos
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-6">
        <div className="flex gap-6 max-h-[calc(100vh-130px)]">
          {/* ── Lista ──────────────────────────────────── */}
          <div className="w-full lg:w-96 shrink-0 space-y-3 overflow-y-auto pr-1">
            {displayList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hay empleos con +75% de match. Cambia a "Todos" para ver más.
              </div>
            ) : displayList.map(job => {
              const isSelected = selectedJob?.id === job.id
              return (
                <Card key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={cn("border shadow-sm cursor-pointer transition-all",
                    isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card hover:border-primary/40")}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0 overflow-hidden">
                        {job.logo
                          ? <img src={job.logo} alt="" className="w-full h-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                          : job.company[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm leading-snug">{job.title}</h3>
                        <p className="text-xs text-muted-foreground">{job.company}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            {job.type === "Remoto" ? <Globe className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                            {job.location}
                          </span>
                          <span className={cn("text-sm font-bold px-2 py-0.5 rounded-lg border", matchColor(job.match))}>
                            {job.match}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* ── Panel de Detalle ─────────────────────────── */}
          {selectedJob && (
            <div className="flex-1 min-w-0 overflow-y-auto">
              <Card className="border-0 shadow-lg bg-card h-full">
                <CardContent className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-18 h-18 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden shrink-0">
                      {selectedJob.logo
                        ? <img src={selectedJob.logo} alt="" className="w-full h-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                        : selectedJob.company[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-foreground leading-snug">{selectedJob.title}</h2>
                      <p className="text-primary font-semibold">{selectedJob.company}</p>
                      <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{selectedJob.location}</span>
                        <span className="flex items-center gap-1">
                          {selectedJob.type === "Remoto" ? <Globe className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                          {selectedJob.type}
                        </span>
                        {selectedJob.salary && <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />{selectedJob.salary}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Match bar */}
                  <div className={cn("p-4 rounded-2xl border", matchColor(selectedJob.match).replace("text-", "border-").replace(" bg-", " bg-"))}>
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-foreground">Compatibilidad con tu perfil</span>
                        <span className={cn("text-3xl font-extrabold", matchColor(selectedJob.match).split(" ")[0])}>{selectedJob.match}%</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full bg-gradient-to-r transition-all", matchBarColor(selectedJob.match))}
                          style={{ width: `${selectedJob.match}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Skill gap */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> Skills que tienes
                      </p>
                      {selectedMatched.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedMatched.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-lg">{s}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-700">No hay skills exactas, pero tu experiencia puede compensar.</p>
                      )}
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" /> Skills que pide y no tienes
                      </p>
                      {selectedMissing.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedMissing.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-lg">{s}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-amber-700">¡Tienes todas las skills requeridas! 🎉</p>
                      )}
                    </div>
                  </div>

                  {/* AI recommendation */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-primary mb-1">Recomendación IA</p>
                      <p className="text-sm text-foreground leading-relaxed">{aiRecommendation(selectedJob.match, selectedMissing)}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm font-bold text-foreground mb-2">Descripción del puesto</p>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">{selectedJob.description}</p>
                    <a href={selectedJob.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline font-medium">
                      Ver descripción completa <ChevronRight className="h-3 w-3" />
                    </a>
                  </div>

                  {/* CTAs */}
                  <div className="flex gap-3 pt-2">
                    <Button className="flex-1 gap-2" onClick={() => window.open(selectedJob.url, "_blank")}>
                      <ExternalLink className="h-4 w-4" /> Aplicar ahora
                    </Button>
                    <Button variant="outline" className="gap-2" disabled title="Próximamente en Pro">
                      <Sparkles className="h-4 w-4" /> CV adaptado · Pro
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
