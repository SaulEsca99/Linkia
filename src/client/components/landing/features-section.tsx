import { Globe, Brain, BarChart3, Zap, Search, Shield } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "IA de última generación",
      description: "Utilizamos GPT-4o para analizar y optimizar tu perfil con precisión.",
    },
    {
      icon: Zap,
      title: "CV adaptado en segundos",
      description: "Genera versiones personalizadas de tu CV para cada oferta automáticamente.",
    },
    {
      icon: BarChart3,
      title: "Score de compatibilidad",
      description: "Conoce qué tan compatible eres con cada vacante antes de aplicar.",
    },
    {
      icon: Search,
      title: "Búsqueda centralizada",
      description: "Encuentra vacantes de OCC, Indeed y LinkedIn en un solo lugar.",
    },
    {
      icon: Globe,
      title: "Enfocado en LATAM",
      description: "Diseñado para el mercado laboral de México y Latinoamérica.",
    },
    {
      icon: Shield,
      title: "Privacidad garantizada",
      description: "Tu información está segura. No compartimos datos con terceros.",
    },
  ]

  return (
    <section id="caracteristicas" className="py-24 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">Por qué elegir Linkia</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Todo lo que necesitas para encontrar el trabajo ideal, en una sola plataforma.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
