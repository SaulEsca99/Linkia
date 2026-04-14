"use client"

import { useState } from "react"
import { Card, CardContent } from "@/client/components/ui/card"
import { Button } from "@/client/components/ui/button"
import {
  Sparkles, Check, Zap, Target, FileText, TrendingUp, Shield, Clock,
  Star, ArrowRight, Crown, Infinity,
} from "lucide-react"
import { cn } from "@/client/lib/utils"
import Link from "next/link"

const features = [
  { icon: Infinity, title: "Búsquedas ilimitadas", description: "Sin límite de vacantes que puedes explorar cada mes", free: "5/mes", pro: "Ilimitadas" },
  { icon: FileText, title: "CVs adaptados", description: "Genera CVs personalizados para cada vacante", free: "3/mes", pro: "Ilimitados" },
  { icon: Target, title: "Match avanzado", description: "Algoritmo mejorado con más precisión", free: "Básico", pro: "Avanzado" },
  { icon: Sparkles, title: "Tips de IA", description: "Recomendaciones personalizadas para mejorar", free: "Limitados", pro: "Completos" },
  { icon: TrendingUp, title: "Estadísticas detalladas", description: "Análisis profundo de tu perfil y mercado", free: "Básicas", pro: "Completas" },
  { icon: Shield, title: "Soporte prioritario", description: "Respuesta rápida del equipo de soporte", free: "Standard", pro: "Prioritario" },
]

const testimonials = [
  { name: "Carlos M.", role: "Ing. de Software", text: "Conseguí trabajo en 2 semanas con el plan Pro. Los CVs adaptados marcaron la diferencia.", avatar: "C" },
  { name: "Ana R.", role: "Product Manager", text: "Las búsquedas ilimitadas me permitieron explorar más opciones y encontrar el trabajo perfecto.", avatar: "A" },
]

export default function ProPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly")

  const monthlyPrice = 149
  const yearlyPrice = 99
  const currentPrice = billingCycle === "yearly" ? yearlyPrice : monthlyPrice
  const savings = billingCycle === "yearly" ? (monthlyPrice - yearlyPrice) * 12 : 0

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-muted/30 backdrop-blur-sm border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-amber-500" />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">Linkia Pro</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Desbloquea todo el potencial</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Oferta especial: Ahorra {savings > 0 ? `$${savings} MXN` : "33%"} al año
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Encuentra trabajo más rápido con Pro
          </h2>
          <p className="text-lg text-muted-foreground">
            Accede a herramientas avanzadas de IA que triplican tus chances de conseguir entrevistas
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button onClick={() => setBillingCycle("monthly")}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", billingCycle === "monthly" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
            Mensual
          </button>
          <button onClick={() => setBillingCycle("yearly")}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2", billingCycle === "yearly" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
            Anual
            <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700">-33%</span>
          </button>
        </div>

        {/* Pricing Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5 max-w-md mx-auto mb-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 text-white text-xs font-bold">MÁS POPULAR</div>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Plan Pro</h3>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-bold text-foreground">${currentPrice}</span>
              <span className="text-muted-foreground">MXN/mes</span>
            </div>
            {billingCycle === "yearly" && (
              <p className="text-sm text-muted-foreground mb-6">Facturado anualmente (${yearlyPrice * 12} MXN)</p>
            )}
            <Button size="lg" className="w-full gap-2 mb-6" asChild>
              <Link href="/dashboard/pago">
                Comenzar ahora <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="h-4 w-4" />7 días de prueba</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Cancela cuando quieras</span>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="max-w-3xl mx-auto mb-12">
          <h3 className="text-xl font-bold text-foreground text-center mb-8">Qué incluye Pro</h3>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-center hidden sm:block">
                        <p className="text-xs text-muted-foreground mb-1">Gratis</p>
                        <p className="text-sm text-muted-foreground">{feature.free}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-primary mb-1 hidden sm:block">Pro</p>
                        <p className="text-sm font-semibold text-primary flex items-center gap-1">
                          <Check className="h-4 w-4" />{feature.pro}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-foreground text-center mb-8">Lo que dicen nuestros usuarios</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {testimonials.map((t, index) => (
              <Card key={index} className="border-0 shadow-sm bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-foreground mb-4">{`"${t.text}"`}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">{t.avatar}</div>
                    <div>
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/dashboard/pago">
              <Crown className="h-4 w-4" /> Actualizar a Pro
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
