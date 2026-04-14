"use client"

import Link from "next/link"
import { Button } from "@/client/components/ui/button"
import { Check } from "lucide-react"
import { useState } from "react"

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  const plans = [
    {
      name: "Gratis",
      price: "$0",
      period: "/mes",
      description: "Perfecto para empezar",
      features: ["3 búsquedas de vacantes/mes", "1 CV adaptado/mes", "Análisis básico de CV"],
      cta: "Comenzar gratis",
      href: "/sign-up",
      popular: false,
    },
    {
      name: "Pro",
      price: annual ? "$66" : "$99",
      period: "MXN/mes",
      description: "Para búsqueda activa",
      features: ["Búsquedas ilimitadas", "CVs adaptados ilimitados", "Análisis detallado con IA", "Score de compatibilidad", "Soporte prioritario"],
      cta: "Comenzar con Pro",
      href: "/sign-up",
      popular: true,
    },
    {
      name: "Empresas",
      price: "Contactar",
      period: "",
      description: "Para equipos de RRHH",
      features: ["Todo de Pro", "Dashboard de equipo", "Integraciones API", "Soporte dedicado"],
      cta: "Contactar ventas",
      href: "/sign-up",
      popular: false,
    },
  ]

  return (
    <section id="precios" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">Planes simples y accesibles</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Elige el plan que mejor se adapte a tu búsqueda
          </p>
          <div className="inline-flex items-center gap-2 p-1 bg-muted rounded-full">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!annual ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              Mensual
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${annual ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              Anual
              <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">-33%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div key={i} className={`rounded-2xl p-6 ${plan.popular ? "bg-primary text-white ring-2 ring-primary" : "bg-card border border-border"}`}>
              {plan.popular && (
                <div className="text-xs font-medium bg-white/20 text-white rounded-full px-3 py-1 inline-block mb-4">
                  Más popular
                </div>
              )}
              <h3 className={`text-xl font-semibold mb-1 ${plan.popular ? "text-white" : "text-foreground"}`}>{plan.name}</h3>
              <p className={`text-sm mb-4 ${plan.popular ? "text-white/70" : "text-muted-foreground"}`}>{plan.description}</p>
              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-foreground"}`}>{plan.price}</span>
                <span className={`text-sm ${plan.popular ? "text-white/70" : "text-muted-foreground"}`}>{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 ${plan.popular ? "text-white" : "text-primary"}`} />
                    <span className={plan.popular ? "text-white/90" : "text-foreground"}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${plan.popular ? "bg-white text-primary hover:bg-white/90" : ""}`}
                variant={plan.popular ? "default" : "outline"}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
