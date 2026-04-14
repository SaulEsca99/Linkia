"use client"

import { useState } from "react"
import { Card, CardContent } from "@/client/components/ui/card"
import { Button } from "@/client/components/ui/button"
import {
  Target, MapPin, Clock, DollarSign, ExternalLink, FileText, Sparkles,
  TrendingUp, CheckCircle2, XCircle, Eye, RefreshCw, Download, Loader2,
} from "lucide-react"
import { cn } from "@/client/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import Link from "next/link"

interface Match {
  id: number; title: string; company: string; location: string; type: string
  salary: string; score: number; status: "new" | "viewed" | "applied" | "saved"; logo: string
  matchedSkills: string[]; missingSkills: string[]; postedDate: string; deadline?: string
}

const mockMatches: Match[] = [
  { id: 1, title: "Senior React Developer", company: "TechCorp MX", location: "Remoto", type: "Tiempo completo", salary: "$45,000 - $60,000 MXN", score: 94, status: "new", logo: "T", matchedSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Git"], missingSkills: ["GraphQL"], postedDate: "Hace 2 horas", deadline: "15 días restantes" },
  { id: 2, title: "Full Stack Engineer", company: "StartupAI", location: "CDMX (Híbrido)", type: "Tiempo completo", salary: "$50,000 - $70,000 MXN", score: 91, status: "viewed", logo: "S", matchedSkills: ["React", "Python", "AWS", "Docker"], missingSkills: ["Kubernetes", "Terraform"], postedDate: "Hace 5 horas" },
  { id: 3, title: "Frontend Lead", company: "FinTech Plus", location: "Guadalajara", type: "Tiempo completo", salary: "$55,000 - $75,000 MXN", score: 88, status: "applied", logo: "F", matchedSkills: ["React", "TypeScript", "Team Lead"], missingSkills: ["Vue.js", "Angular"], postedDate: "Hace 1 día" },
  { id: 4, title: "React Native Developer", company: "AppMasters", location: "Remoto LATAM", type: "Tiempo completo", salary: "$40,000 - $55,000 MXN", score: 85, status: "saved", logo: "A", matchedSkills: ["React", "JavaScript", "Mobile"], missingSkills: ["React Native", "iOS", "Android"], postedDate: "Hace 2 días" },
]

const statusConfig = {
  new: { label: "Nuevo", color: "bg-emerald-100 text-emerald-700", icon: Sparkles },
  viewed: { label: "Visto", color: "bg-blue-100 text-blue-700", icon: Eye },
  applied: { label: "Aplicado", color: "bg-violet-100 text-violet-700", icon: CheckCircle2 },
  saved: { label: "Guardado", color: "bg-amber-100 text-amber-700", icon: Target },
}

export default function MatchesPage() {
  const [matches] = useState(mockMatches)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(matches[0])
  const [generatingCV, setGeneratingCV] = useState(false)
  const [cvGenerated, setCvGenerated] = useState(false)

  const handleGenerateCV = async () => {
    setGeneratingCV(true)
    await new Promise(r => setTimeout(r, 2500))
    setGeneratingCV(false)
    setCvGenerated(true)
  }

  const stats = [
    { label: "Matches totales", value: matches.length, icon: Target, color: "text-primary" },
    { label: "Score promedio", value: "89%", icon: TrendingUp, color: "text-emerald-500" },
    { label: "Nuevos hoy", value: 2, icon: Sparkles, color: "text-amber-500" },
  ]

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-muted/30 backdrop-blur-sm border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">Matches</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Vacantes que coinciden con tu perfil</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm bg-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Matches List */}
          <div className="lg:col-span-2 space-y-3">
            <Tabs defaultValue="all">
              <TabsList className="w-full bg-card border border-border p-1">
                <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Todos</TabsTrigger>
                <TabsTrigger value="new" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Nuevos</TabsTrigger>
                <TabsTrigger value="applied" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Aplicados</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              {matches.map((match) => {
                const StatusIcon = statusConfig[match.status].icon
                return (
                  <Card key={match.id} onClick={() => { setSelectedMatch(match); setCvGenerated(false) }}
                    className={cn("border-0 shadow-sm bg-card cursor-pointer transition-all hover:shadow-md", selectedMatch?.id === match.id && "ring-2 ring-primary")}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                          {match.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-foreground truncate">{match.title}</h3>
                            <div className={cn("px-2 py-0.5 rounded text-xs font-bold shrink-0", match.score >= 90 ? "bg-emerald-100 text-emerald-700" : match.score >= 85 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700")}>
                              {match.score}%
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{match.company}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{match.location}</span>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full flex items-center gap-1", statusConfig[match.status].color)}>
                              <StatusIcon className="h-3 w-3" />{statusConfig[match.status].label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Match Detail */}
          <div className="lg:col-span-3">
            {selectedMatch ? (
              <Card className="border-0 shadow-sm bg-card sticky top-24">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl font-bold text-primary">
                      {selectedMatch.logo}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-foreground">{selectedMatch.title}</h2>
                      <p className="text-primary font-medium">{selectedMatch.company}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{selectedMatch.location}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{selectedMatch.type}</span>
                        <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />{selectedMatch.salary}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-foreground">Match Score</span>
                      <span className={cn("text-2xl font-bold", selectedMatch.score >= 90 ? "text-emerald-600" : "text-blue-600")}>{selectedMatch.score}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", selectedMatch.score >= 90 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-blue-500 to-blue-400")} style={{ width: `${selectedMatch.score}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Tu perfil coincide muy bien con los requisitos de esta vacante</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <h4 className="font-semibold text-emerald-800 flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-4 w-4" /> Skills que tienes ({selectedMatch.matchedSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMatch.matchedSkills.map((skill, i) => (
                          <span key={i} className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-md">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                      <h4 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
                        <XCircle className="h-4 w-4" /> Por mejorar ({selectedMatch.missingSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMatch.missingSkills.map((skill, i) => (
                          <span key={i} className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-md">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Recomendación de IA</h4>
                        <p className="text-sm text-muted-foreground">
                          Tu experiencia en React y Node.js son un excelente match. Te sugerimos destacar tus proyectos de arquitectura de microservicios en tu aplicación para aumentar tus chances.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CV Generated Banner */}
                  {cvGenerated && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 mb-4 flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-emerald-800">¡CV Adaptado generado!</p>
                        <p className="text-sm text-emerald-600">Optimizado para {selectedMatch.title} en {selectedMatch.company}</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 gap-2">
                        <Download className="h-4 w-4" /> Descargar
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1 gap-2" onClick={handleGenerateCV} disabled={generatingCV}>
                      {generatingCV ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Generando CV...</>
                      ) : (
                        <><FileText className="h-4 w-4" /> Generar CV Adaptado</>
                      )}
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2" asChild>
                      <Link href="/dashboard/vacantes">
                        <ExternalLink className="h-4 w-4" /> Ver Vacante Original
                      </Link>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border text-sm text-muted-foreground">
                    <span>Publicada {selectedMatch.postedDate}</span>
                    {selectedMatch.deadline && <span className="text-amber-600 font-medium">{selectedMatch.deadline}</span>}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm bg-card">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Target className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Selecciona un match</h3>
                  <p className="text-sm text-muted-foreground">Haz clic en cualquier vacante para ver los detalles</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
