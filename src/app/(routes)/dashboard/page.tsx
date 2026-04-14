"use client"

import Link from "next/link"
import { Card, CardContent } from "@/client/components/ui/card"
import { Button } from "@/client/components/ui/button"
import {
  FileText,
  Search,
  Target,
  TrendingUp,
  Upload,
  ArrowRight,
  Sparkles,
  Bell,
  Zap,
  ChevronRight,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react"

export default function DashboardPage() {
  const stats = [
    { title: "CV Analizado", value: "1", change: "+1 esta semana", icon: FileText, gradient: "from-blue-500 to-blue-600" },
    { title: "Vacantes Vistas", value: "24", change: "+12 hoy", icon: Search, gradient: "from-violet-500 to-violet-600" },
    { title: "Matches", value: "8", change: "85% promedio", icon: Target, gradient: "from-emerald-500 to-emerald-600" },
    { title: "Score Promedio", value: "87%", change: "+5% vs anterior", icon: TrendingUp, gradient: "from-amber-500 to-orange-500" },
  ]

  const recentActivity = [
    { type: "match", title: "Nuevo match: Senior Developer", company: "TechCorp MX", time: "Hace 2 horas", score: 92 },
    { type: "cv", title: "CV actualizado exitosamente", company: null, time: "Hace 5 horas", score: null },
    { type: "match", title: "Nuevo match: Full Stack Engineer", company: "StartupAI", time: "Ayer", score: 88 },
  ]

  const quickActions = [
    { href: "/dashboard/cv", icon: Upload, title: "Subir/Actualizar CV", description: "Analiza tu perfil con IA", color: "bg-blue-500" },
    { href: "/dashboard/vacantes", icon: Search, title: "Buscar Vacantes", description: "Explora oportunidades", color: "bg-violet-500" },
    { href: "/dashboard/matches", icon: Target, title: "Ver Matches", description: "8 vacantes compatibles", color: "bg-emerald-500" },
  ]

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-muted/30 backdrop-blur-sm border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">¡Bienvenido!</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Tu copiloto de empleo está listo para ayudarte</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link href="/dashboard/notificaciones">
                  <Bell className="h-4 w-4" />
                  <span className="hidden lg:inline">Notificaciones</span>
                </Link>
              </Button>
              <Button size="sm" className="gap-2" asChild>
                <Link href="/dashboard/pro">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden lg:inline">Pro</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm bg-card overflow-hidden">
              <CardContent className="p-4 lg:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
                <p className="text-xs text-primary mt-2 font-medium">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Acciones rápidas</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <Card className="border-0 shadow-sm bg-card hover:shadow-md transition-all group h-full">
                      <CardContent className="p-5">
                        <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 via-card to-accent/5 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shrink-0">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">Recomendación de la IA</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Basado en tu perfil, hay 3 vacantes nuevas de <strong>Full Stack Developer</strong> en empresas de tecnología que coinciden con tus habilidades en React y Node.js.
                    </p>
                    <Button size="sm" className="gap-2" asChild>
                      <Link href="/dashboard/vacantes">
                        Ver vacantes recomendadas
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Matches Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Top Matches</h2>
                <Link href="/dashboard/matches" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                  Ver todos <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Senior React Developer", company: "TechCorp MX", location: "Remoto", salary: "$45k - $60k MXN", score: 92 },
                  { title: "Full Stack Engineer", company: "StartupAI", location: "CDMX", salary: "$50k - $70k MXN", score: 88 },
                  { title: "Frontend Lead", company: "FinTech Plus", location: "Híbrido", salary: "$55k - $75k MXN", score: 85 },
                ].map((job, index) => (
                  <Link key={index} href="/dashboard/matches">
                    <Card className="border-0 shadow-sm bg-card hover:shadow-md transition-all">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                          {job.company.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground truncate">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                          <p className="text-xs text-primary font-medium mt-1">{job.salary}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${job.score >= 90 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                            {job.score}%
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">match</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Tu perfil</h3>
                  <span className="text-sm font-bold text-primary">75%</span>
                </div>
                <div className="h-2 bg-muted rounded-full mb-4 overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full" />
                </div>
                <div className="space-y-2">
                  {[
                    { label: "CV subido", done: true },
                    { label: "Habilidades verificadas", done: true },
                    { label: "Experiencia completa", done: true },
                    { label: "Foto de perfil", done: false },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {item.done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className={item.done ? "text-muted-foreground" : "text-foreground"}>{item.label}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link href="/dashboard/cv">Completar perfil</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-4">Actividad reciente</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activity.type === "match" ? "bg-emerald-100" : "bg-blue-100"}`}>
                        {activity.type === "match" ? (
                          <Target className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                        {activity.company && <p className="text-xs text-muted-foreground">{activity.company}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                          {activity.score && <span className="text-xs font-medium text-emerald-600">{activity.score}% match</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Tip del día</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Personaliza tu CV para cada vacante. Nuestra IA puede adaptarlo automáticamente para aumentar tu compatibilidad hasta un 40%.
                </p>
                <Button variant="link" size="sm" className="px-0 mt-2 gap-1" asChild>
                  <Link href="/dashboard/ayuda">
                    Aprender más <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
