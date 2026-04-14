import { Upload, Search, FileCheck } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      step: "1",
      title: "Sube tu CV",
      description: "Arrastra tu PDF y nuestra IA extrae tu experiencia, habilidades y educación automáticamente.",
    },
    {
      icon: Search,
      step: "2",
      title: "Encuentra vacantes",
      description: "Buscamos en OCC, Indeed y LinkedIn las vacantes que mejor coinciden con tu perfil.",
    },
    {
      icon: FileCheck,
      step: "3",
      title: "Obtén tu CV adaptado",
      description: "La IA optimiza tu CV para cada vacante específica, aumentando tus posibilidades de éxito.",
    },
  ]

  return (
    <section id="como-funciona" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">Cómo funciona</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            De CV a oferta adaptada en 3 simples pasos. Sin complicaciones.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, i) => (
            <div key={i} className="relative">
              <div className="bg-card rounded-2xl border border-border p-8 h-full hover:border-primary/30 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-xs font-medium text-primary mb-2">Paso {item.step}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
