import Link from "next/link";
import {
  FileText,
  Search,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-white">
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">
              Job<span className="text-indigo-400">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition hover:text-white"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[128px]" />
        <div className="pointer-events-none absolute -top-20 left-1/4 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 text-center lg:pt-32">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
            <Zap className="h-3.5 w-3.5" />
            Impulsado por IA • GPT-4o
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight lg:text-7xl">
            Tu copiloto para{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              encontrar trabajo
            </span>{" "}
            en LATAM
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
            Sube tu CV, encuentra vacantes compatibles en OCC, Indeed y LinkedIn,
            y obtén un CV adaptado para cada oferta.{" "}
            <strong className="text-gray-300">Todo en minutos.</strong>
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 hover:shadow-indigo-500/40"
            >
              Empezar gratis
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <span className="text-sm text-gray-500">
              Sin tarjeta de crédito • Plan gratuito disponible
            </span>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-8 border-t border-white/5 pt-10 sm:grid-cols-4">
            {[
              { value: "4M+", label: "Universitarios buscando empleo" },
              { value: "70%", label: "CVs nunca leídos por humanos" },
              { value: "$99", label: "MXN/mes plan Pro" },
              { value: "6 sem", label: "Para lanzar el MVP" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white lg:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-gray-900/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold lg:text-4xl">
              Cómo funciona
            </h2>
            <p className="mt-3 text-gray-400">
              De CV a oferta adaptada en 3 simples pasos
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: FileText,
                step: "01",
                title: "Sube tu CV",
                description:
                  "Arrastra tu PDF y nuestra IA extrae tu perfil completo: skills, experiencia, educación y más.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Search,
                step: "02",
                title: "Encuentra vacantes",
                description:
                  "Buscamos en OCC, Indeed y LinkedIn vacantes compatibles con tu perfil y te mostramos un score de compatibilidad.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Target,
                step: "03",
                title: "CV adaptado",
                description:
                  "La IA reescribe tu CV optimizado para cada vacante, destacando las keywords que busca el reclutador.",
                gradient: "from-orange-500 to-red-500",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative rounded-2xl border border-white/5 bg-gray-900 p-8 transition hover:border-white/10 hover:bg-gray-800/50"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}
                >
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="mt-2 text-xs font-semibold text-gray-600">
                  PASO {item.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold lg:text-4xl">
              ¿Por qué JobAI?
            </h2>
            <p className="mt-3 text-gray-400">
              Diseñado para el mercado laboral de México y LATAM
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Globe,
                title: "Enfocado en LATAM",
                description:
                  "Buscamos en OCC México, Indeed y LinkedIn en español. Entendemos el contexto local.",
              },
              {
                icon: Sparkles,
                title: "IA de última generación",
                description:
                  "GPT-4o-mini analiza tu CV y genera versiones adaptadas con las keywords correctas.",
              },
              {
                icon: Target,
                title: "Score de compatibilidad",
                description:
                  "Cada vacante tiene un porcentaje de match para que apliques donde más probabilidades tienes.",
              },
              {
                icon: FileText,
                title: "CV adaptado en segundos",
                description:
                  "Descarga un PDF listo para enviar, optimizado para pasar filtros de ATS.",
              },
              {
                icon: Search,
                title: "Búsqueda centralizada",
                description:
                  "Olvídate de visitar 5 portales. Todo en un solo dashboard.",
              },
              {
                icon: CheckCircle2,
                title: "Feedback inteligente",
                description:
                  "Análisis detallado con puntuación y sugerencias accionables para mejorar tu CV.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-white/5 bg-gray-900/50 p-6 transition hover:border-indigo-500/20 hover:bg-gray-900"
              >
                <feature.icon className="h-5 w-5 text-indigo-400" />
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-gray-900/50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold lg:text-4xl">
              Planes simples y accesibles
            </h2>
            <p className="mt-3 text-gray-400">
              Empieza gratis, escala cuando lo necesites
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Free */}
            <div className="rounded-2xl border border-white/5 bg-gray-900 p-8">
              <h3 className="text-lg font-semibold">Gratis</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500"> /mes</span>
              </div>
              <ul className="mt-8 space-y-3">
                {[
                  "3 búsquedas / mes",
                  "1 CV adaptado",
                  "Feedback básico",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-gray-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="mt-8 block w-full rounded-lg border border-white/10 py-2.5 text-center text-sm font-medium transition hover:bg-white/5"
              >
                Empezar gratis
              </Link>
            </div>

            {/* Pro Monthly */}
            <div className="relative rounded-2xl border-2 border-indigo-500 bg-gray-900 p-8 shadow-xl shadow-indigo-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold">
                Popular
              </div>
              <h3 className="text-lg font-semibold">Pro</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-gray-500"> MXN/mes</span>
              </div>
              <ul className="mt-8 space-y-3">
                {[
                  "Búsquedas ilimitadas",
                  "CVs adaptados ilimitados",
                  "Feedback detallado",
                  "Consejos de LinkedIn",
                  "Historial de aplicaciones",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="mt-8 block w-full rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-semibold transition hover:bg-indigo-500"
              >
                Suscribirse
              </Link>
            </div>

            {/* Pro Annual */}
            <div className="rounded-2xl border border-white/5 bg-gray-900 p-8">
              <h3 className="text-lg font-semibold">Pro Anual</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">$799</span>
                <span className="text-gray-500"> MXN/año</span>
              </div>
              <div className="mt-1 text-sm text-emerald-400">Ahorras 33%</div>
              <ul className="mt-8 space-y-3">
                {[
                  "Todo lo de Pro",
                  "Soporte prioritario",
                  "Ahorro de $389/año",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="mt-8 block w-full rounded-lg border border-white/10 py-2.5 text-center text-sm font-medium transition hover:bg-white/5"
              >
                Suscribirse anual
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold lg:text-4xl">
            Deja de enviar el mismo CV a todas las vacantes
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Únete a JobAI y empieza a aplicar con CVs personalizados que
            realmente llaman la atención de los reclutadores.
          </p>
          <Link
            href="/sign-up"
            className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
          >
            Crear mi cuenta gratis
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Sparkles className="h-4 w-4" />
            JobAI © 2026
          </div>
          <div className="text-sm text-gray-600">
            Proyecto Startup • LATAM
          </div>
        </div>
      </footer>
    </div>
  );
}
