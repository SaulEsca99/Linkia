"use client"

import { useState } from "react"
import { Card, CardContent } from "@/client/components/ui/card"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import {
  Search, HelpCircle, FileText, MessageCircle, Mail, ChevronDown,
  Upload, Target, CreditCard, Sparkles,
} from "lucide-react"
import { cn } from "@/client/lib/utils"

const faqs = [
  {
    category: "Empezar", icon: Upload,
    questions: [
      { q: "¿Cómo subo mi CV?", a: "Ve a la sección 'Mi CV' y arrastra tu archivo PDF o haz clic para seleccionarlo. Nuestra IA analizará automáticamente tu CV y extraerá toda la información relevante." },
      { q: "¿Qué formatos acepta Linkia?", a: "Actualmente aceptamos archivos PDF. Asegúrate de que tu CV tenga texto seleccionable (no escaneos de imágenes) para mejores resultados." },
      { q: "¿Puedo editar la información que extrae la IA?", a: "Sí, después de subir tu CV puedes editar cualquier campo. Ve a la sección 'Mi CV' y haz clic en el ícono de editar junto a cada sección." },
    ]
  },
  {
    category: "Matches y Vacantes", icon: Target,
    questions: [
      { q: "¿Cómo funciona el match score?", a: "Nuestro algoritmo compara tus habilidades, experiencia y preferencias con los requisitos de cada vacante. Un score alto indica mayor compatibilidad." },
      { q: "¿Por qué no veo muchas vacantes?", a: "Asegúrate de tener tu CV completo y actualizado. También verifica tus preferencias de ubicación y modalidad de trabajo en la configuración." },
      { q: "¿Puedo aplicar directamente desde Linkia?", a: "Algunas vacantes permiten aplicación directa. Otras te redirigirán a la página de la empresa. Siempre te indicaremos el método disponible." },
    ]
  },
  {
    category: "CV Adaptado", icon: Sparkles,
    questions: [
      { q: "¿Qué es un CV adaptado?", a: "Es una versión de tu CV optimizada para una vacante específica. La IA reorganiza y destaca la información más relevante para cada oportunidad." },
      { q: "¿Cuántos CVs adaptados puedo generar?", a: "Con el plan gratuito puedes generar 3 CVs adaptados por mes. Con el plan Pro, tienes generaciones ilimitadas." },
    ]
  },
  {
    category: "Planes y Pagos", icon: CreditCard,
    questions: [
      { q: "¿Qué incluye el plan gratuito?", a: "5 búsquedas de vacantes por mes, 3 CVs adaptados, y acceso básico al dashboard. Ideal para probar la plataforma." },
      { q: "¿Puedo cancelar mi suscripción?", a: "Sí, puedes cancelar en cualquier momento desde Configuración > Suscripción. Tu acceso continuará hasta el final del periodo pagado." },
      { q: "¿Qué métodos de pago aceptan?", a: "Aceptamos tarjetas de crédito/débito (Visa, Mastercard, Amex) y PayPal. Todos los pagos son procesados de forma segura." },
    ]
  },
]

export default function AyudaPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-muted/30 backdrop-blur-sm border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Centro de Ayuda</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Encuentra respuestas a tus preguntas</p>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto">
        <Card className="border-0 shadow-sm bg-card mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Busca tu pregunta..." className="pl-12 h-12 text-lg bg-muted/50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: FileText, title: "Guías", desc: "Tutoriales paso a paso" },
            { icon: MessageCircle, title: "Chat", desc: "Habla con soporte" },
            { icon: Mail, title: "Email", desc: "soporte@linkia.io" },
          ].map((item, i) => (
            <Card key={i} className="border-0 shadow-sm bg-card hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <item.icon className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          {faqs.map((category, catIndex) => (
            <Card key={catIndex} className="border-0 shadow-sm bg-card">
              <CardContent className="p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <category.icon className="h-5 w-5 text-primary" />
                  {category.category}
                </h2>
                <div className="space-y-2">
                  {category.questions.map((faq, faqIndex) => {
                    const faqId = `${catIndex}-${faqIndex}`
                    const isOpen = openFaq === faqId
                    return (
                      <div key={faqIndex} className="border-b border-border last:border-0">
                        <button onClick={() => setOpenFaq(isOpen ? null : faqId)} className="w-full flex items-center justify-between py-4 text-left">
                          <span className="font-medium text-foreground pr-4">{faq.q}</span>
                          <ChevronDown className={cn("h-5 w-5 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                        </button>
                        <div className={cn("overflow-hidden transition-all", isOpen ? "max-h-48 pb-4" : "max-h-0")}>
                          <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-sm bg-gradient-to-r from-primary to-accent mt-8">
          <CardContent className="p-8 text-center">
            <HelpCircle className="h-12 w-12 text-white/80 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">¿No encontraste lo que buscabas?</h2>
            <p className="text-white/80 mb-6">Nuestro equipo de soporte está listo para ayudarte</p>
            <Button variant="secondary" size="lg" className="gap-2">
              <MessageCircle className="h-4 w-4" /> Contactar soporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
