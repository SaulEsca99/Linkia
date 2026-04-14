import Link from "next/link"
import Image from "next/image"
import { Button } from "@/client/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center pt-16 pb-16 px-6 text-center bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Impulsado por IA
        </div>

        <div className="mb-12">
          <Image
            src="/branding/linkia-brand.png"
            alt="Linkia"
            width={500}
            height={140}
            className="h-28 md:h-40 lg:h-48 w-auto mx-auto"
            priority
          />
        </div>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-5 text-balance leading-tight max-w-3xl mx-auto">
          Tu copiloto inteligente para encontrar el trabajo ideal
        </h1>

        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-8 text-pretty">
          Sube tu CV, descubre vacantes que encajan contigo y genera un CV adaptado para cada oferta.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Button size="lg" className="px-8 h-12" asChild>
            <Link href="/sign-up">
              Comenzar gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="px-8 h-12" asChild>
            <Link href="#como-funciona">Ver cómo funciona</Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            Sin tarjeta
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            5 búsquedas gratis
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            Cancela cuando quieras
          </span>
        </div>
      </div>

      {/* App Preview */}
      <div className="mt-16 max-w-5xl mx-auto px-4 w-full">
        <div className="rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/10 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                app.linkia.io/dashboard
              </div>
            </div>
          </div>

          <div className="flex">
            <div className="hidden md:block w-52 border-r border-border/50 bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">Lk</span>
                </div>
                <span className="font-medium text-sm text-foreground">Linkia</span>
              </div>
              <nav className="space-y-1">
                <div className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">Dashboard</div>
                <div className="px-3 py-2 rounded-lg text-muted-foreground text-sm">Mi CV</div>
                <div className="px-3 py-2 rounded-lg text-muted-foreground text-sm">Vacantes</div>
                <div className="px-3 py-2 rounded-lg text-muted-foreground text-sm">Matches</div>
              </nav>
            </div>

            <div className="flex-1 p-4 md:p-6 bg-muted/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-foreground">Bienvenida, Maria</h3>
                  <p className="text-sm text-muted-foreground">Tu resumen de hoy</p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                  CV Analizado ✓
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Match prom.", value: "92%", accent: true },
                  { label: "Vacantes", value: "24" },
                  { label: "Aplicaciones", value: "8" },
                  { label: "Entrevistas", value: "3" },
                ].map((s, i) => (
                  <div key={i} className="bg-card rounded-xl p-4 border border-border/50">
                    <div className={`text-2xl font-bold mb-0.5 ${s.accent ? "text-primary" : "text-foreground"}`}>{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                  <span className="font-medium text-sm text-foreground">Top Matches</span>
                  <span className="text-xs text-primary">Ver todos</span>
                </div>
                <div className="divide-y divide-border/50">
                  {[
                    { name: "Software Engineer", company: "Google - CDMX", score: "95%", scoreColor: "text-green-500", logo: "G", logoColor: "bg-blue-500/10 text-blue-500" },
                    { name: "Full Stack Developer", company: "Nubank - Remoto", score: "91%", scoreColor: "text-green-500", logo: "N", logoColor: "bg-purple-500/10 text-purple-500" },
                    { name: "Backend Engineer", company: "Rappi - Bogotá", score: "87%", scoreColor: "text-yellow-500", logo: "R", logoColor: "bg-orange-500/10 text-orange-500" },
                  ].map((job, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${job.logoColor} flex items-center justify-center text-xs font-bold`}>{job.logo}</div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{job.name}</div>
                          <div className="text-xs text-muted-foreground">{job.company}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${job.scoreColor}`}>{job.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
