"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/client/components/ui/card"
import { Button } from "@/client/components/ui/button"
import {
  Target, MapPin, Clock, DollarSign, ExternalLink, Sparkles,
  TrendingUp, CheckCircle2, XCircle, Loader2, Globe, GraduationCap,
  Briefcase, RefreshCw, AlertCircle,
} from "lucide-react"
import { cn } from "@/client/lib/utils"
import { authClient } from "@/app/lib/auth-client"
import type { JobListing } from "@server/modules/jobs/jobs.service"
import Link from "next/link"

type JobWithMatch = JobListing & { match: number };

// Skills that match are computed by comparing job.tags with profile skills from the API
function getMatchedSkills(job: JobWithMatch, profileSkills: string[]): { matched: string[]; missing: string[] } {
  const normalized = profileSkills.map(s => s.toLowerCase())
  const matched: string[] = []
  const missing: string[] = []
  for (const tag of job.tags) {
    const tagLow = tag.toLowerCase()
    if (normalized.some(s => s.includes(tagLow) || tagLow.includes(s))) {
      matched.push(tag)
    } else {
      missing.push(tag)
    }
  }
  return { matched, missing }
}

const SOURCE_BADGES: Record<string, string> = {
  JSearch: "LinkedIn/Indeed",
  Adzuna: "Adzuna MX",
  RemoteOK: "RemoteOK",
}

export default function MatchesPage() {
  const { data: session } = authClient.useSession()
  const userId = session?.user?.id

  const [jobs, setJobs] = useState<JobWithMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<JobWithMatch | null>(null)
  const [profileSkills, setProfileSkills] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"top" | "all">("top")

  const loadMatches = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/jobs/search?userId=${userId}`)
      const data = await res.json()
      if (data.success) {
        setJobs(data.jobs)
        // Extract profile skills from jobs metadata (we get them back in match context)
      } else {
        setError(data.error || "Error al cargar matches")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { loadMatches() }, [loadMatches])
  useEffect(() => { if (jobs.length > 0) setSelectedJob(jobs[0]) }, [jobs])

  const topMatches = jobs.filter(j => j.match >= 80)
  const otherMatches = jobs.filter(j => j.match < 80)
  const displayJobs = activeTab === "top" ? topMatches : jobs

  const avgMatch = jobs.length ? Math.round(jobs.reduce((a, j) => a + j.match, 0) / jobs.length) : 0

  const { matched, missing } = selectedJob
    ? getMatchedSkills(selectedJob, profileSkills)
    : { matched: [], missing: [] }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-muted/30 backdrop-blur-sm border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">Matches</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {loading ? "Calculando compatibilidad..." : `${topMatches.length} empleos con +80% de match`}
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={loadMatches} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Matches totales", value: jobs.length, icon: Target, color: "text-primary" },
            { label: "Score promedio", value: `${avgMatch}%`, icon: TrendingUp, color: "text-emerald-500" },
            { label: "Match +80%", value: topMatches.length, icon: Sparkles, color: "text-amber-500" },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm bg-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{loading ? "..." : stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <Card className="border-amber-200 bg-amber-50 mb-6">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">Calculando tu compatibilidad con cada vacante...</p>
            </div>
          </div>
        )}

        {!loading && jobs.length === 0 && !error && (
          <Card className="border-dashed border-2 border-border bg-card/50">
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Primero sube tu CV</h3>
              <p className="text-sm text-muted-foreground mb-4">Para ver tus matches, sube tu CV en la sección "Mi CV" y Linkia buscará automáticamente empleos compatibles.</p>
              <Button asChild>
                <Link href="/dashboard/cv">Ir a Mi CV</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && jobs.length > 0 && (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Job List */}
            <div className="lg:col-span-2 space-y-3">
              {/* Tab selector */}
              <div className="flex gap-2 p-1 bg-card border border-border rounded-xl">
                <button onClick={() => setActiveTab("top")}
                  className={cn("flex-1 py-1.5 text-sm font-medium rounded-lg transition-all",
                    activeTab === "top" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                  Top Matches ({topMatches.length})
                </button>
                <button onClick={() => setActiveTab("all")}
                  className={cn("flex-1 py-1.5 text-sm font-medium rounded-lg transition-all",
                    activeTab === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                  Todos ({jobs.length})
                </button>
              </div>

              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {displayJobs.map(job => (
                  <Card key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={cn("border-0 shadow-sm bg-card cursor-pointer transition-all hover:shadow-md",
                      selectedJob?.id === job.id && "ring-2 ring-primary")}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-base font-bold text-primary shrink-0 overflow-hidden">
                          {job.logo
                            ? <img src={job.logo} alt="" className="w-full h-full object-contain p-0.5" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                            : job.company[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-foreground text-sm truncate">{job.title}</h3>
                            <div className={cn("px-2 py-0.5 rounded text-xs font-bold shrink-0",
                              job.match >= 85 ? "bg-emerald-100 text-emerald-700"
                                : job.match >= 70 ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700")}>
                              {job.match}%
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{job.company}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />{job.location}
                            </span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                              job.source === "JSearch" ? "bg-blue-100 text-blue-700"
                                : job.source === "Adzuna" ? "bg-violet-100 text-violet-700"
                                : "bg-emerald-100 text-emerald-700")}>
                              {SOURCE_BADGES[job.source]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Job Detail Panel */}
            <div className="lg:col-span-3">
              {selectedJob ? (
                <Card className="border-0 shadow-sm bg-card sticky top-24">
                  <CardContent className="p-6 max-h-[80vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0 overflow-hidden">
                        {selectedJob.logo
                          ? <img src={selectedJob.logo} alt="" className="w-full h-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                          : selectedJob.company[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-foreground leading-snug">{selectedJob.title}</h2>
                        <p className="text-primary font-medium text-sm">{selectedJob.company}</p>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{selectedJob.location}</span>
                          <span className="flex items-center gap-1">
                            {selectedJob.type === "Becario" ? <GraduationCap className="h-3.5 w-3.5" /> : selectedJob.type === "Remoto" ? <Globe className="h-3.5 w-3.5" /> : <Briefcase className="h-3.5 w-3.5" />}
                            {selectedJob.type}
                          </span>
                          {selectedJob.salary && <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{selectedJob.salary}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Match bar */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground text-sm">Compatibilidad con tu perfil</span>
                        <span className={cn("text-2xl font-bold", selectedJob.match >= 85 ? "text-emerald-600" : "text-blue-600")}>{selectedJob.match}%</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", selectedJob.match >= 85 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-blue-500 to-blue-400")}
                          style={{ width: `${selectedJob.match}%` }} />
                      </div>
                    </div>

                    {/* Skills match (shown only if we have tags) */}
                    {selectedJob.tags.length > 0 && (
                      <div className="grid sm:grid-cols-2 gap-3 mb-5">
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                          <h4 className="font-semibold text-emerald-800 text-xs flex items-center gap-1.5 mb-2">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Skills requeridas
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedJob.tags.map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                          <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5 mb-2">
                            <Sparkles className="h-3.5 w-3.5 text-primary" /> Recomendación IA
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {selectedJob.match >= 85
                              ? "¡Excelente match! Tu perfil encaja muy bien. Aplica destacando tus proyectos cuantificados."
                              : selectedJob.match >= 70
                              ? "Buen match. Menciona en tu carta de presentación cómo compensas las skills que aún no tienes."
                              : "Match moderado. Considera adquirir algunas skills antes de aplicar para aumentar tus chances."}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div className="mb-5">
                      <h3 className="font-semibold text-foreground text-sm mb-2">Descripción del puesto</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {selectedJob.description}
                      </p>
                      <a href={selectedJob.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline">
                        Ver descripción completa en {SOURCE_BADGES[selectedJob.source]} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {/* CTA */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button className="flex-1 gap-2" onClick={() => window.open(selectedJob.url, "_blank")}>
                        <ExternalLink className="h-4 w-4" /> Aplicar ahora
                      </Button>
                      <Button variant="outline" className="gap-2" asChild>
                        <Link href="/dashboard/vacantes">
                          Ver en Vacantes
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm bg-card">
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <Target className="h-8 w-8 text-muted-foreground mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">Selecciona un match</h3>
                    <p className="text-sm text-muted-foreground">Haz clic en cualquier vacante para ver los detalles</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
