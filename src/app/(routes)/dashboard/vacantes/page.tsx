"use client"

import { useState } from "react"
import { Card, CardContent } from "@/client/components/ui/card"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import {
  Search,
  MapPin,
  Building2,
  Clock,
  FileText,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Users,
  Sparkles,
  ChevronDown,
  X,
  Filter,
} from "lucide-react"
import { cn } from "@/client/lib/utils"
import Link from "next/link"

interface Vacancy {
  id: number; title: string; company: string; location: string; type: string
  salary: string; match: number; posted: string; logo: string; tags: string[]
  saved: boolean; applicants: number; description: string
}

const mockVacancies: Vacancy[] = [
  { id: 1, title: "Senior React Developer", company: "TechCorp MX", location: "Remoto", type: "Tiempo completo", salary: "$45,000 - $60,000 MXN", match: 94, posted: "Hace 2 horas", logo: "T", tags: ["React", "TypeScript", "Node.js"], saved: true, applicants: 23, description: "Buscamos desarrollador senior con experiencia en React y ecosistema moderno de JavaScript." },
  { id: 2, title: "Full Stack Engineer", company: "StartupAI", location: "CDMX (Híbrido)", type: "Tiempo completo", salary: "$50,000 - $70,000 MXN", match: 91, posted: "Hace 5 horas", logo: "S", tags: ["React", "Python", "AWS"], saved: false, applicants: 45, description: "Únete a nuestro equipo de IA para construir productos innovadores." },
  { id: 3, title: "Frontend Lead", company: "FinTech Plus", location: "Guadalajara (Presencial)", type: "Tiempo completo", salary: "$55,000 - $75,000 MXN", match: 88, posted: "Hace 1 día", logo: "F", tags: ["React", "Vue", "Team Lead"], saved: false, applicants: 67, description: "Lidera nuestro equipo de frontend en el desarrollo de plataforma financiera." },
  { id: 4, title: "React Native Developer", company: "AppMasters", location: "Remoto LATAM", type: "Tiempo completo", salary: "$40,000 - $55,000 MXN", match: 85, posted: "Hace 2 días", logo: "A", tags: ["React Native", "iOS", "Android"], saved: false, applicants: 34, description: "Desarrolla apps móviles de alto rendimiento para clientes globales." },
  { id: 5, title: "Backend Engineer (Node.js)", company: "CloudScale", location: "Remoto", type: "Medio tiempo", salary: "$25,000 - $35,000 MXN", match: 82, posted: "Hace 3 días", logo: "C", tags: ["Node.js", "PostgreSQL", "Docker"], saved: false, applicants: 28, description: "Construye APIs robustas y escalables para nuestra plataforma cloud." },
]

const filters = [
  { label: "Remoto" }, { label: "Híbrido" }, { label: "Presencial" },
  { label: "Tiempo completo", active: true }, { label: "Medio tiempo" },
]

export default function VacantesPage() {
  const [vacancies, setVacancies] = useState(mockVacancies)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>(["Tiempo completo"])
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null)

  const toggleSaved = (id: number) => {
    setVacancies(vacancies.map(v => v.id === id ? { ...v, saved: !v.saved } : v))
  }

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter])
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-muted/30 backdrop-blur-sm border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">Vacantes</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{vacancies.length} oportunidades encontradas</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Recomendadas</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por título, empresa o habilidad..." className="pl-10 bg-card border-border h-11" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="relative sm:w-48">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Ciudad o remoto" className="pl-10 bg-card border-border h-11" />
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11 shrink-0 sm:hidden" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
            </Button>
            <Button className="h-11 gap-2 hidden sm:flex">
              <Search className="h-4 w-4" /> Buscar
            </Button>
          </div>

          <div className={cn("flex flex-wrap gap-2 mt-4 overflow-hidden transition-all", showFilters ? "max-h-40" : "max-h-0 sm:max-h-40 mt-0 sm:mt-4")}>
            {filters.map((filter, index) => (
              <button key={index} onClick={() => toggleFilter(filter.label)}
                className={cn("px-3 py-1.5 text-sm font-medium rounded-full transition-all", activeFilters.includes(filter.label) ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/50")}>
                {filter.label}
              </button>
            ))}
            {activeFilters.length > 0 && (
              <button onClick={() => setActiveFilters([])} className="px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-full transition-all flex items-center gap-1">
                <X className="h-3 w-3" /> Limpiar
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: TrendingUp, label: "Match promedio", value: "88%", color: "text-emerald-500" },
            { icon: Building2, label: "Empresas", value: "156", color: "text-blue-500" },
            { icon: MapPin, label: "Ciudades", value: "12", color: "text-violet-500" },
            { icon: DollarSign, label: "Salario prom.", value: "$52k", color: "text-amber-500" },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm bg-card">
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

        <div className="space-y-4">
          {vacancies.map((vacancy) => (
            <Card key={vacancy.id} className="border-0 shadow-sm bg-card hover:shadow-md transition-all group">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                      {vacancy.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{vacancy.title}</h3>
                          <p className="text-sm text-muted-foreground">{vacancy.company}</p>
                        </div>
                        <button onClick={() => toggleSaved(vacancy.id)}
                          className={cn("p-2 rounded-lg transition-colors shrink-0", vacancy.saved ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground")}>
                          {vacancy.saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{vacancy.location}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{vacancy.type}</span>
                        <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{vacancy.salary}</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{vacancy.applicants} aplicantes</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{vacancy.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {vacancy.tags.map((tag, i) => (
                          <span key={i} className="px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-md">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-border lg:pl-6">
                    <div className="text-center lg:text-right">
                      <div className={cn("inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-lg font-bold",
                        vacancy.match >= 90 ? "bg-emerald-100 text-emerald-700" : vacancy.match >= 85 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700")}>
                        {vacancy.match}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">match</p>
                    </div>
                    <div className="flex lg:flex-col gap-2">
                      <Button size="sm" className="gap-2" asChild>
                        <Link href={`/dashboard/vacantes/${vacancy.id}/aplicar`}>
                          Aplicar <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedVacancy(vacancy)}>
                        Ver más
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">Publicada {vacancy.posted}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Button variant="outline" size="lg" className="gap-2">
            Cargar más vacantes <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modal: Ver más */}
      {selectedVacancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedVacancy(null)}>
          <Card className="w-full max-w-2xl border-0 shadow-2xl bg-card max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {selectedVacancy.logo}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">{selectedVacancy.title}</h2>
                  <p className="text-primary font-medium">{selectedVacancy.company}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{selectedVacancy.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{selectedVacancy.type}</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />{selectedVacancy.salary}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedVacancy(null)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">Match Score</span>
                  <span className="text-2xl font-bold text-primary">{selectedVacancy.match}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${selectedVacancy.match}%` }} />
                </div>
              </div>

              <h3 className="font-semibold text-foreground mb-2">Descripción del puesto</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{selectedVacancy.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedVacancy.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-lg">{tag}</span>
                ))}
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 gap-2" asChild>
                  <Link href={`/dashboard/vacantes/${selectedVacancy.id}/aplicar`}>
                    <ExternalLink className="h-4 w-4" /> Aplicar ahora
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1 gap-2" asChild>
                  <Link href="/dashboard/matches">
                    <FileText className="h-4 w-4" /> Generar CV Adaptado
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
