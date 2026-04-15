"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/client/components/ui/card"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import {
  Search, MapPin, Bookmark, BookmarkCheck, ExternalLink, TrendingUp,
  DollarSign, Sparkles, ChevronDown, X, Loader2, Globe, Briefcase,
  GraduationCap, RefreshCw, Database, Timer, Upload, FileText, CheckCircle2,
} from "lucide-react"
import { cn } from "@/client/lib/utils"
import { authClient } from "@/app/lib/auth-client"
import type { JobListing } from "@server/modules/jobs/jobs.service"
import type { CacheStatus } from "@server/modules/jobs/jobs-cache.service"

type JobWithMatch = JobListing & { match: number };

const JOB_TYPES = ["Todos", "Tiempo completo", "Medio tiempo", "Becario", "Remoto"]
const SOURCE_BADGES: Record<string, { label: string; color: string }> = {
  JSearch:  { label: "LinkedIn/Indeed", color: "bg-blue-100 text-blue-700" },
  Adzuna:   { label: "Adzuna MX",       color: "bg-violet-100 text-violet-700" },
  RemoteOK: { label: "RemoteOK",        color: "bg-emerald-100 text-emerald-700" },
}

function formatTimeAgo(date?: Date | string): string {
  if (!date) return "nunca"
  const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000)
  if (mins < 1) return "justo ahora"
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.round(mins / 60)
  return hrs < 24 ? `hace ${hrs}h` : `hace ${Math.round(hrs / 24)} día(s)`
}

export default function VacantesPage() {
  const { data: session } = authClient.useSession()
  const userId = session?.user?.id

  const [jobs, setJobs] = useState<JobWithMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeType, setActiveType] = useState("Todos")
  const [selectedJob, setSelectedJob] = useState<JobWithMatch | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null)
  const [fromCache, setFromCache] = useState(false)
  const [sources, setSources] = useState({ jsearch: 0, adzuna: 0, remoteok: 0 })
  const [hasPreviousCV, setHasPreviousCV] = useState(false)
  const [detectedSkills, setDetectedSkills] = useState<string[]>([])
  const [detectedTitle, setDetectedTitle] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("")

  // Cooldown timer
  const [cooldown, setCooldown] = useState(0)
  useEffect(() => {
    if (!cacheStatus?.nextRefreshIn) { setCooldown(0); return }
    setCooldown(cacheStatus.nextRefreshIn * 60)
    const interval = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(interval)
  }, [cacheStatus?.nextRefreshIn])

  const formatCooldown = (secs: number) => {
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60
    if (h > 0) return `${h}h ${m}m`
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load from cache on mount (uses previous CV if exists, no upload needed)
  const loadFromCache = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/jobs/extract-and-search?userId=${userId}`)
      const data = await res.json()
      if (data.success) {
        setJobs(data.jobs)
        setCacheStatus(data.status)
        setFromCache(data.fromCache)
        setHasPreviousCV(data.hasPreviousCV)
        setDetectedSkills(data.detectedSkills ?? [])
        setSources({
          jsearch: data.jobs.filter((j: JobWithMatch) => j.source === "JSearch").length,
          adzuna: data.jobs.filter((j: JobWithMatch) => j.source === "Adzuna").length,
          remoteok: data.jobs.filter((j: JobWithMatch) => j.source === "RemoteOK").length,
        })
      }
    } catch { setError("Error de conexión") }
    finally { setLoading(false) }
  }, [userId])

  useEffect(() => { if (userId) loadFromCache() }, [userId, loadFromCache])

  // Upload PDF and search
  const handleFileUpload = async (file: File) => {
    if (!userId || !file) return
    if (file.type !== "application/pdf") { setError("Solo se aceptan archivos PDF"); return }
    if (file.size > 10 * 1024 * 1024) { setError("El PDF no puede ser mayor a 10MB"); return }

    setUploadLoading(true)
    setError(null)
    setUploadedFileName(file.name)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("userId", userId)

    try {
      const res = await fetch("/api/jobs/extract-and-search", { method: "POST", body: formData })
      const data = await res.json()

      if (res.status === 429) { setError(data.error); return }
      if (!data.success) { setError(data.error || "Error al procesar el PDF"); return }

      setJobs(data.jobs)
      setCacheStatus(data.status)
      setDetectedTitle(data.detectedTitle ?? "")
      setDetectedSkills(data.detectedSkills ?? [])
      setHasPreviousCV(true)
      setFromCache(false)
      setSources(data.sources)
    } catch { setError("Error al subir el archivo") }
    finally { setUploadLoading(false) }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const filteredJobs = activeType === "Todos" ? jobs : jobs.filter(j => j.type === activeType)
  const avgMatch = jobs.length ? Math.round(jobs.reduce((a, j) => a + j.match, 0) / jobs.length) : 0
  const canRefresh = cacheStatus?.canRefresh && cooldown === 0

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-muted/30 backdrop-blur-sm border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">Vacantes</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {loading || uploadLoading ? "Buscando empleos..." : jobs.length > 0
                  ? `${filteredJobs.length} empleos encontrados · LinkedIn, Indeed, Adzuna MX, RemoteOK`
                  : "Sube tu CV para ver empleos personalizados"}
              </p>
            </div>

            {jobs.length > 0 && (
              <div className="flex flex-col items-end gap-1">
                <Button variant="outline" size="sm" className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLoading || loading}>
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Nuevo CV</span>
                </Button>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  {fromCache
                    ? <><Database className="h-3 w-3" />Actualizado {formatTimeAgo(cacheStatus?.lastRefreshed)}</>
                    : <><CheckCircle2 className="h-3 w-3 text-emerald-500" />Recién buscado</>}
                  {cacheStatus && ` · ${cacheStatus.refreshesLeft} búsquedas restantes hoy`}
                </p>
              </div>
            )}
          </div>

          {/* Filters — only show when jobs loaded */}
          {jobs.length > 0 && (
            <>
              {/* Detected skills chips */}
              {detectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2 mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
                    <Sparkles className="h-3 w-3 text-primary" /> Buscando por:
                  </span>
                  {detectedSkills.slice(0, 8).map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Type filters */}
              <div className="flex flex-wrap gap-2 mt-2">
                {JOB_TYPES.map(type => (
                  <button key={type} onClick={() => setActiveType(type)}
                    className={cn("px-3 py-1.5 text-sm font-medium rounded-full transition-all",
                      activeType === type ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/50")}>
                    {type}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      <div className="px-4 lg:px-8 py-6">

        {/* ── UPLOAD ZONE (shown only when no jobs yet) ── */}
        {!loading && jobs.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
                isDragging ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
              )}>
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />

              {uploadLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <p className="font-semibold text-foreground">Extrayendo tu perfil y buscando empleos...</p>
                  <p className="text-sm text-muted-foreground">Esto tarda unos segundos</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Sube tu CV para buscar empleos</h3>
                  <p className="text-sm text-muted-foreground mb-1">Arrastra tu PDF aquí o haz clic para seleccionarlo</p>
                  <p className="text-xs text-muted-foreground">Solo se usa para buscar empleos — <span className="font-medium text-primary">no se analiza ni se guarda</span></p>
                  <div className="mt-6 p-3 rounded-xl bg-muted/60 flex items-start gap-3 text-left">
                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">¿Quieres mejorar tu CV y descargarlo en formato Harvard?</span> Ve a <span className="font-medium text-primary">Mi CV</span> para eso.
                      Aquí solo buscamos empleos basados en tus habilidades.
                    </p>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <Timer className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 flex-1">{error}</p>
                <button onClick={() => setError(null)}><X className="h-4 w-4 text-amber-600" /></button>
              </div>
            )}
          </div>
        )}

        {/* Detected info banner (shown after upload) */}
        {!loading && jobs.length > 0 && detectedTitle && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-5">
            <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-800">
                {uploadedFileName ? `CV procesado: ${uploadedFileName}` : "Perfil cargado desde tu CV anterior"}
              </p>
              <p className="text-xs text-emerald-700">Buscando como: <span className="font-semibold">{detectedTitle}</span></p>
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
              onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
          </div>
        )}

        {/* Stats */}
        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { icon: TrendingUp, label: "Match promedio",  value: `${avgMatch}%`,        color: "text-emerald-500" },
              { icon: Globe,      label: "LinkedIn/Indeed", value: `${sources.jsearch}`,  color: "text-blue-500" },
              { icon: MapPin,     label: "Adzuna México",   value: `${sources.adzuna}`,   color: "text-violet-500" },
              { icon: DollarSign, label: "RemoteOK",        value: `${sources.remoteok}`, color: "text-amber-500" },
            ].map((stat, i) => (
              <Card key={i} className="border-0 shadow-sm bg-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error rate limit banner */}
        {error && jobs.length > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
            <Timer className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 flex-1">{error}</p>
            <button onClick={() => setError(null)}><X className="h-4 w-4 text-amber-600" /></button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-0 shadow-sm bg-card">
                <CardContent className="p-5">
                  <div className="flex gap-4 animate-pulse">
                    <div className="w-14 h-14 rounded-xl bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Job cards */}
        {!loading && filteredJobs.length > 0 && (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <Card key={job.id} className="border-0 shadow-sm bg-card hover:shadow-md transition-all group cursor-pointer"
                onClick={() => setSelectedJob(job)}>
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-xl font-bold text-primary shrink-0 overflow-hidden">
                        {job.logo
                          ? <img src={job.logo} alt="" className="w-full h-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                          : job.company[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                          </div>
                          <button onClick={e => { e.stopPropagation(); setSavedIds(prev => { const n = new Set(prev); n.has(job.id) ? n.delete(job.id) : n.add(job.id); return n }) }}
                            className={cn("p-2 rounded-lg transition-colors shrink-0", savedIds.has(job.id) ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground")}>
                            {savedIds.has(job.id) ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                          <span className="flex items-center gap-1">
                            {job.type === "Becario" ? <GraduationCap className="h-3.5 w-3.5" /> : job.type === "Remoto" ? <Globe className="h-3.5 w-3.5" /> : <Briefcase className="h-3.5 w-3.5" />}
                            {job.type}
                          </span>
                          {job.salary && <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{job.salary}</span>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3 items-center">
                          {job.tags.slice(0, 5).map((tag, i) => (
                            <span key={i} className="px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-md">{tag}</span>
                          ))}
                          <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-full ml-auto", SOURCE_BADGES[job.source]?.color)}>
                            {SOURCE_BADGES[job.source]?.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-border lg:pl-6">
                      <div className="text-center">
                        <div className={cn("inline-flex items-center px-3 py-1.5 rounded-full text-lg font-bold",
                          job.match >= 85 ? "bg-emerald-100 text-emerald-700" : job.match >= 70 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700")}>
                          {job.match}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">match</p>
                      </div>
                      <div className="flex lg:flex-col gap-2">
                        <Button size="sm" className="gap-2" onClick={e => { e.stopPropagation(); window.open(job.url, "_blank") }}>
                          Aplicar <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setSelectedJob(job) }}>
                          Ver más
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Job detail modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedJob(null)}>
          <Card className="w-full max-w-2xl border-0 shadow-2xl bg-card max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden shrink-0">
                  {selectedJob.logo
                    ? <img src={selectedJob.logo} alt="" className="w-full h-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                    : selectedJob.company[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground leading-snug">{selectedJob.title}</h2>
                  <p className="text-primary font-medium">{selectedJob.company}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{selectedJob.location}</span>
                    {selectedJob.salary && <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />{selectedJob.salary}</span>}
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground shrink-0">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Match bar */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground text-sm">Match con tu perfil</span>
                  <span className="text-2xl font-bold text-primary">{selectedJob.match}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${selectedJob.match}%` }} />
                </div>
              </div>

              {/* Skills */}
              {selectedJob.tags.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-foreground mb-2">Habilidades requeridas</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-lg">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full description */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-foreground mb-2">Descripción del puesto</p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                <a href={selectedJob.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline font-medium">
                  Ver descripción completa en {SOURCE_BADGES[selectedJob.source]?.label} <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button className="flex-1 gap-2" onClick={() => window.open(selectedJob.url, "_blank")}>
                  <ExternalLink className="h-4 w-4" /> Aplicar ahora
                </Button>
                <Button variant="outline" onClick={() => setSelectedJob(null)}>Cerrar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
