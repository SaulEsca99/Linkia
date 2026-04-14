export function StatsSection() {
  const stats = [
    { value: "4M+", label: "Universitarios buscando empleo en México" },
    { value: "70%", label: "CVs nunca son leídos por reclutadores" },
    { value: "3 min", label: "Para optimizar tu CV con nuestra IA" },
    { value: "87%", label: "Tasa de entrevistas de nuestros usuarios" },
  ]

  return (
    <section className="py-16 px-6 bg-primary">
      <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
            <div className="text-sm text-white/70">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
