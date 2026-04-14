"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
  {
    name: "Carlos López",
    handle: "@carlos_dev",
    role: "Senior Developer",
    avatar: "CL",
    color: "bg-blue-500",
    quote: "En 2 semanas de usar Linkia conseguí 3 entrevistas en empresas top. El CV adaptado para cada vacante hace toda la diferencia. La IA entiende perfectamente qué buscan los reclutadores."
  },
  {
    name: "Maria Rodríguez",
    handle: "@maria_pm",
    role: "Product Manager",
    avatar: "MR",
    color: "bg-violet-500",
    quote: "Conseguí trabajo en 2 semanas. Linkia adaptó mi CV perfectamente para cada aplicación. El match score me ayudó a priorizar las vacantes donde tenía más probabilidades."
  },
  {
    name: "Ana García",
    handle: "@ana_ux",
    role: "UX Designer",
    avatar: "AG",
    color: "bg-pink-500",
    quote: "Nunca pensé que encontrar trabajo pudiera ser tan eficiente. Linkia organizó mi búsqueda y con los CVs adaptados empecé a recibir respuestas que antes ignoraban mi perfil."
  },
  {
    name: "Roberto Méndez",
    handle: "@roberto_data",
    role: "Data Scientist",
    avatar: "RM",
    color: "bg-emerald-500",
    quote: "El análisis de mis habilidades vs lo que piden las empresas fue revelador. Supe exactamente qué mejorar. Conseguí una oferta 30% mejor gracias a las recomendaciones de la IA."
  },
  {
    name: "Sofia Herrera",
    handle: "@sofia_mktg",
    role: "Marketing Manager",
    avatar: "SH",
    color: "bg-amber-500",
    quote: "Venía de un año difícil buscando trabajo. Con Linkia en el primer mes tuve más entrevistas que en los 6 meses anteriores. La personalización del CV es increíble."
  },
  {
    name: "Diego Morales",
    handle: "@diego_backend",
    role: "Backend Engineer",
    avatar: "DM",
    color: "bg-cyan-500",
    quote: "Lo que más me gustó es que Linkia no solo adapta el CV, también me da tips específicos para cada empresa. Conseguí trabajo remoto con empresa de EEUU pagando en dólares."
  },
]

export function TestimonialsSection() {
  const [active, setActive] = useState(0)

  const prev = () => setActive((active - 1 + testimonials.length) % testimonials.length)
  const next = () => setActive((active + 1) % testimonials.length)

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">Lo que dicen nuestros usuarios</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Miles de profesionales ya encontraron su trabajo ideal con Linkia
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Featured Testimonial */}
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-full ${testimonials[active].color} flex items-center justify-center text-white font-semibold text-lg`}>
                {testimonials[active].avatar}
              </div>
              <div>
                <p className="font-semibold text-foreground">{testimonials[active].name}</p>
                <p className="text-sm text-muted-foreground">{testimonials[active].role}</p>
                <p className="text-xs text-primary">{testimonials[active].handle}</p>
              </div>
            </div>

            <p className="text-foreground text-lg leading-relaxed mb-6">
              &ldquo;{testimonials[active].quote}&rdquo;
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`h-2 rounded-full transition-all ${active === i ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2"}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={prev} className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={next} className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid of Mini Testimonials */}
          <div className="grid grid-cols-2 gap-3">
            {testimonials.map((t, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  active === i
                    ? "bg-primary/5 border-primary/30 scale-[1.02]"
                    : "bg-card border-border hover:border-primary/20 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-medium`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.handle}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {t.quote.substring(0, 70)}...
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
