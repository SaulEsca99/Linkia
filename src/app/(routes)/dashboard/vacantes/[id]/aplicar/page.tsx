"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/client/components/ui/card"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import {
  ArrowLeft, MapPin, DollarSign, Clock, Users, Building2,
  FileText, Sparkles, CheckCircle2, Loader2, Send,
} from "lucide-react"
import { useParams } from "next/navigation"

const vacancyData = {
  "1": { title: "Senior React Developer", company: "TechCorp MX", location: "Remoto", type: "Tiempo completo", salary: "$45,000 - $60,000 MXN", applicants: 23, match: 94, logo: "T", description: "Buscamos un Senior React Developer para unirse a nuestro equipo de producto. Trabajarás en el desarrollo de nuevas funcionalidades para nuestra plataforma SaaS con más de 50,000 usuarios activos en LATAM.", requirements: ["5+ años de experiencia con React", "TypeScript avanzado", "Experiencia con Node.js", "Conocimiento de bases de datos SQL", "Experiencia con metodologías ágiles"], benefits: ["Trabajo 100% remoto", "Salario competitivo en MXN", "Seguro médico", "Días de vacaciones adicionales", "Budget para capacitación anual"] },
}

type ApplicationStep = "form" | "submitting" | "success"

export default function AplicarPage() {
  const { id } = useParams<{ id: string }>()
  const vacancy = vacancyData[id as keyof typeof vacancyData] ?? vacancyData["1"]
  const [step, setStep] = useState<ApplicationStep>("form")
  const [useCVAdapted, setUseCVAdapted] = useState(true)
  const [coverLetter, setCoverLetter] = useState("")

  const handleApply = async () => {
    setStep("submitting")
    await new Promise(r => setTimeout(r, 2500))
    setStep("success")
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">¡Aplicación enviada!</h2>
          <p className="text-muted-foreground mb-1">Tu aplicación para <strong>{vacancy.title}</strong></p>
          <p className="text-muted-foreground mb-8">en <strong>{vacancy.company}</strong> fue enviada exitosamente.</p>
          <div className="p-4 rounded-xl bg-muted/50 mb-8 text-sm text-muted-foreground">
            Recibirás una notificación cuando la empresa revise tu perfil. El proceso suele tomar 3-5 días hábiles.
          </div>
          <div className="flex flex-col gap-3">
            <Button size="lg" asChild>
              <Link href="/dashboard/matches">Ver mis matches</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard/vacantes">Seguir buscando</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (step === "submitting") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Enviando tu aplicación...</h3>
          <p className="text-muted-foreground">Estamos preparando tu perfil y carta de presentación</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-muted/30 backdrop-blur-sm border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/vacantes"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Aplicar a vacante</h1>
              <p className="text-sm text-muted-foreground">{vacancy.title} — {vacancy.company}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-5 gap-8">
          {/* Application Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* CV Selection */}
            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> CV a enviar
                </h2>
                <div className="space-y-3">
                  <button onClick={() => setUseCVAdapted(true)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${useCVAdapted ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className={`font-semibold ${useCVAdapted ? "text-primary" : "text-foreground"}`}>CV Adaptado para esta vacante</p>
                        <p className="text-sm text-muted-foreground">Optimizado por IA para maximizar tu match con {vacancy.company}</p>
                        <p className="text-xs text-emerald-600 font-medium mt-1">+15% de probabilidad de éxito</p>
                      </div>
                    </div>
                  </button>
                  <button onClick={() => setUseCVAdapted(false)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${!useCVAdapted ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className={`font-semibold ${!useCVAdapted ? "text-primary" : "text-foreground"}`}>Mi CV original</p>
                        <p className="text-sm text-muted-foreground">Senior Full Stack Developer — Maria Garcia</p>
                      </div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Cover Letter */}
            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-6">
                <h2 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" /> Carta de presentación
                  <span className="text-xs text-muted-foreground font-normal ml-1">(opcional)</span>
                </h2>
                <p className="text-sm text-muted-foreground mb-4">Personaliza tu mensaje para destacar ante {vacancy.company}</p>
                <textarea
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder={`Estimado equipo de ${vacancy.company},\n\nEscribo con mucho entusiasmo para expresar mi interés en la posición de ${vacancy.title}...`}
                  className="w-full h-40 p-4 rounded-xl bg-muted/50 border border-border text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">{coverLetter.length}/500 caracteres</span>
                  <Button size="sm" variant="outline" className="gap-2 text-xs">
                    <Sparkles className="h-3 w-3" /> Generar con IA
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button size="lg" className="w-full gap-2" onClick={handleApply}>
              <Send className="h-5 w-5" /> Enviar aplicación
            </Button>
          </div>

          {/* Vacancy Summary */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm bg-card sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-xl font-bold text-primary">
                    {vacancy.logo}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{vacancy.title}</h3>
                    <p className="text-primary">{vacancy.company}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{vacancy.location}</div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{vacancy.type}</div>
                  <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" />{vacancy.salary}</div>
                  <div className="flex items-center gap-2"><Users className="h-4 w-4" />{vacancy.applicants} aplicantes</div>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Tu match</span>
                    <span className="text-lg font-bold text-emerald-600">{vacancy.match}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${vacancy.match}%` }} />
                  </div>
                </div>

                <h4 className="font-semibold text-foreground mb-2 text-sm">Requisitos</h4>
                <ul className="space-y-1 mb-4">
                  {vacancy.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />{req}
                    </li>
                  ))}
                </ul>

                <h4 className="font-semibold text-foreground mb-2 text-sm">Beneficios</h4>
                <ul className="space-y-1">
                  {vacancy.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />{b}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
