"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/client/components/ui/card"
import { Button } from "@/client/components/ui/button"
import {
  MapPin, Bookmark, BookmarkCheck, ExternalLink, TrendingUp,
  DollarSign, Sparkles, X, Loader2, Globe, Briefcase,
  GraduationCap, Database, Timer, Upload, FileText, CheckCircle2,
  Star, Search,
} from "lucide-react"
import { cn } from "@/client/lib/utils"
import { authClient } from "@/app/lib/auth-client"
import type { JobListing } from "@server/modules/jobs/jobs.service"
import type { CacheStatus } from "@server/modules/jobs/jobs-cache.service"

type JobWithMatch = JobListing & { match: number };

const JOB_TYPES = ["Todos", "Tiempo completo", "Medio tiempo", "Becario", "Remoto"]

const SOURCE_BADGES: Record<string, { label: string; color: string }> = {
  JSearch:       { label: "LinkedIn/Indeed",  color: "bg-blue-100 text-blue-700" },
  Adzuna:        { label: "Adzuna MX",        color: "bg-violet-100 text-violet-700" },
  RemoteOK:      { label: "RemoteOK",         color: "bg-emerald-100 text-emerald-700" },
  OCC:           { label: "OCC Mundial",       color: "bg-red-100 text-red-700" },
  Computrabajo:  { label: "Computrabajo",     color: "bg-orange-100 text-orange-700" },
}

function formatTimeAgo(date?: Date | string): string {
  if (!date) return "nunca"
  const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000)
  if (mins < 1) return "justo ahora"
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.round(mins / 60)
  return hrs < 24 ? `hace ${hrs}h` : `hace ${Math.round(hrs / 24)} día(s)`
}

function formatCooldown(secs: number): string {
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60
  if (h > 0) return `${h}h ${m}m`
  return m > 0 ? `${m}m` : `${s}s`
}

// ─── Job Card ───────────────────────────────────────────────────────────────
function JobCard({ job, saved, onToggleSave, onViewDetail }: {
  job: JobWithMatch
  saved: boolean
  onToggleSave: () => void
  onViewDetail: () => void
}) {
  return (
    <Card
      className="border-0 shadow-sm bg-card hover:shadow-md transition-all group cursor-pointer"
      onClick={onViewDetail}
    >
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
                <button
                  onClick={e => { e.stopPropagation(); onToggleSave() }}
                  className={cn("p-2 rounded-lg transition-colors shrink-0", saved ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground")}
                >
                  {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
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
              <Button size="sm" className="gap-1.5" onClick={e => { e.stopPropagation(); window.open(job.url, "_blank") }}>
                Aplicar <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); onViewDetail() }}>
                Ver más
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function VacantesPage() {
  const { data: session } = authClient.useSession()
  const userId = session?.user?.id

  const [jobs, setJobs] = useState<JobWithMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeType, setActiveType] = useState("Todos")
  const [selectedJob, setSelectedJob] = useState<JobWithMatch | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null)
  const [fromCache, setFromCache] = useState(false)
  const [hasPreviousCV, setHasPreviousCV] = useState(false)
  const [detectedSkills, setDetectedSkills] = useState<string[]>([])
  const [detectedTitle, setDetectedTitle] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [searchFailed, setSearchFailed] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!cacheStatus?.nextRefreshIn) { setCooldown(0); return }
    setCooldown(cacheStatus.nextRefreshIn * 60)
    const interval = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(interval)
  }, [cacheStatus?.nextRefreshIn])

  const applyResult = useCallback((data: any) => {
    setJobs(data.jobs ?? [])
    setCacheStatus(data.status ?? null)
    setFromCache(data.fromCache ?? false)
    setHasPreviousCV(data.hasPreviousCV ?? false)
    setDetectedSkills(data.detectedSkills ?? [])
    setDetectedTitle(data.detectedTitle ?? "")
    setSearchFailed(data.status?.searchFailed ?? false)
    setError(null) // ← siempre limpiar el error cuando hay respuesta exitosa
  }, [])

  // Carga inicial desde caché
  const loadFromCache = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/jobs/extract-and-search?userId=${userId}`)
      const data = await res.json()
      setError(null) // doble limpieza
      if (data.success) {
        applyResult(data)
      } else {
        setError(data.error || "Error al cargar vacantes")
      }
    } catch {
      setError("Error de conexión. Verifica tu red.")
    } finally {
      setLoading(false)
    }
  }, [userId, applyResult])

  useEffect(() => { if (userId) loadFromCache() }, [userId, loadFromCache])

  // Upload PDF para buscar
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
      applyResult(data)
    } catch {
      setError("Error al subir el archivo")
    } finally {
      setUploadLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  // Derivar datos para render
  const sources = {
    jsearch: jobs.filter(j => j.source === "JSearch").length,
    adzuna: jobs.filter(j => j.source === "Adzuna").length,
    remoteok: jobs.filter(j => j.source === "RemoteOK").length,
  }
  const byType = activeType === "Todos" ? jobs : jobs.filter(j => j.type === activeType)
  const topMatches = byType.filter(j => j.match >= 80)
  const otherMatches = byType.filter(j => j.match < 80)
  const avgMatch = jobs.length ? Math.round(jobs.reduce((a, j) => a + j.match, 0) / jobs.length) : 0
  const showUpload = !loading && !uploadLoading && jobs.length === 0 && !searchFailed
  const showSearchFailed = !loading && jobs.length === 0 && searchFailed

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-muted/30 backdrop-blur-sm border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">Vacantes</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {loading || uploadLoading ? "Buscando empleos..."
                  : jobs.length > 0 ? `${jobs.length} empleos · LinkedIn, Indeed, Adzuna MX, RemoteOK`
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
                  {cacheStatus && ` · ${cacheStatus.refreshesLeft} búsquedas hoy`}
                </p>
                {/* hidden input para "Nuevo CV" button */}
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
              </div>
            )}
          </div>

          {/* Detected skills chips + type filters */}
          {jobs.length > 0 && (
            <>
              {detectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                    {detectedTitle ? `"${detectedTitle}"` : "Buscando por:"}
                  </span>
                  {detectedSkills.slice(0, 7).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">{s}</span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {JOB_TYPES.map(type => (
                  <button key={type} onClick={() => setActiveType(type)}
                    className={cn("px-3 py-1.5 text-xs font-medium rounded-full transition-all",
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

        {/* Error banner (siempre encima, nunca bloquea el contenido) */}
        {error && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
            <Timer className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 flex-1">{error}</p>
            <button onClick={() => setError(null)}><X className="h-4 w-4 text-amber-600" /></button>
          </div>
        )}

        {/* ── Upload zone ──────────────────────────────────── */}
        {showUpload && (
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
                  <p className="text-sm text-muted-foreground">Unos segundos...</p>
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
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Search failed state ───────────────────────────── */}
        {showSearchFailed && (
          <div className="max-w-xl mx-auto text-center py-10">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">No encontramos empleos para tu perfil</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Las APIs de empleo no devolvieron resultados para tus skills actuales. Intenta buscar con un término diferente.
            </p>
            <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
              <Upload className="h-4 w-4" /> Subir CV con diferentes skills
            </Button>
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
              onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
          </div>
        )}

        {/* ── Loading skeleton ───────────────────────────────── */}
        {(loading || uploadLoading) && (
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

        {/* ── Jobs loaded ────────────────────────────────────── */}
        {!loading && !uploadLoading && jobs.length > 0 && (
          <>
            {/* Stats */}
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

            {/* Detected info banner */}
            {(detectedTitle || uploadedFileName) && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-4">
                <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-emerald-800">
                    {uploadedFileName ? `CV procesado: ${uploadedFileName}` : "Perfil cargado desde tu CV anterior"}
                  </p>
                  {detectedTitle && <p className="text-xs text-emerald-700">Buscando como: <span className="font-semibold">{detectedTitle}</span></p>}
                </div>
              </div>
            )}

            {/* ─── SECCIÓN: Recomendados para ti (≥80%) ─── */}
            {topMatches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <h2 className="text-base font-bold text-foreground">Recomendados para ti</h2>
                  <span className="text-sm text-muted-foreground">({topMatches.length} empleos con +80% de match)</span>
                </div>
                <div className="space-y-4">
                  {topMatches.map(job => (
                    <JobCard
                      key={job.id} job={job}
                      saved={savedIds.has(job.id)}
                      onToggleSave={() => setSavedIds(prev => { const n = new Set(prev); n.has(job.id) ? n.delete(job.id) : n.add(job.id); return n })}
                      onViewDetail={() => setSelectedJob(job)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ─── SECCIÓN: Explorar más ─── */}
            {otherMatches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-base font-bold text-foreground">Explorar más</h2>
                  <span className="text-sm text-muted-foreground">({otherMatches.length} empleos adicionales)</span>
                </div>
                <div className="space-y-4">
                  {otherMatches.map(job => (
                    <JobCard
                      key={job.id} job={job}
                      saved={savedIds.has(job.id)}
                      onToggleSave={() => setSavedIds(prev => { const n = new Set(prev); n.has(job.id) ? n.delete(job.id) : n.add(job.id); return n })}
                      onViewDetail={() => setSelectedJob(job)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Job detail modal ──────────────────────────────────── */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedJob(null)}>
          <Card className="w-full max-w-2xl border-0 shadow-2xl bg-card max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6">
              {/* Header */}
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
                    <span className="flex items-center gap-1">{selectedJob.type}</span>
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
                  <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all" style={{ width: `${selectedJob.match}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedJob.match >= 85 ? "¡Excelente match! Aplica destacando tus proyectos cuantificados."
                    : selectedJob.match >= 70 ? "Buen match. Menciona en tu carta cómo compensas las skills que faltan."
                    : "Match moderado. Considera mejorar en las skills requeridas antes de aplicar."}
                </p>
              </div>

              {/* Skills */}
              {selectedJob.tags.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-foreground mb-2">Skills requeridas</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-lg">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-foreground mb-2">Descripción del puesto</p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                <a href={selectedJob.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline font-medium">
                  Ver descripción completa en {SOURCE_BADGES[selectedJob.source]?.label} <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* CTA */}
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
