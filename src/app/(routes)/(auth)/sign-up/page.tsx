"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { ArrowRight, Sparkles, TrendingUp, Users, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate auth — replace with Better Auth call
    await new Promise(r => setTimeout(r, 1000))
    setIsLoading(false)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/">
            <Image
              src="/branding/linkia-brand.png"
              alt="Linkia"
              width={120}
              height={36}
              className="h-8 w-auto brightness-0 invert"
            />
          </Link>

          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white leading-tight">
                Empieza gratis y encuentra tu próximo trabajo
              </h1>
              <p className="text-xl text-white/70 leading-relaxed">
                Miles de profesionales ya encontraron oportunidades mejores con Linkia.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Sparkles, text: "CV optimizado con IA para cada vacante" },
                { icon: TrendingUp, text: "Match score inteligente con ofertas" },
                { icon: Users, text: "+10,000 profesionales ya confían en nosotros" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/90">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-white/90 italic mb-4">
              &ldquo;En mi primera semana ya tenía 3 entrevistas agendadas gracias a los CVs adaptados.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm font-medium text-white">CL</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Carlos López</p>
                <p className="text-white/60 text-sm">Senior Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background">
        {/* Mobile Logo */}
        <div className="lg:hidden p-6 border-b border-border">
          <Link href="/">
            <Image
              src="/branding/linkia-brand.png"
              alt="Linkia"
              width={100}
              height={30}
              className="h-7 w-auto"
            />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Tab Toggle */}
            <div className="flex p-1 bg-muted rounded-xl">
              <Link
                href="/sign-in"
                className="flex-1 py-3 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                Iniciar sesión
              </Link>
              <div className="flex-1 py-3 px-4 rounded-lg text-sm font-medium bg-background text-foreground shadow-sm text-center">
                Crear cuenta
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Comienza gratis</h2>
              <p className="text-muted-foreground">Crea tu cuenta y encuentra tu trabajo ideal</p>
            </div>

            {/* Social Auth */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full h-12 text-base font-medium">
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar con Google
              </Button>
              <Button variant="outline" className="w-full h-12 text-base font-medium">
                <svg className="h-5 w-5 mr-3" fill="#0A66C2" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                Continuar con LinkedIn
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-sm text-muted-foreground">o con tu correo</span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                  Nombre completo
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  className="h-12"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="h-12"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 pr-11"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Al crear tu cuenta aceptas nuestros{" "}
                  <Link href="#" className="text-primary hover:underline">términos</Link>
                  {" "}y{" "}
                  <Link href="#" className="text-primary hover:underline">política de privacidad</Link>
                </p>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-medium gap-2" disabled={isLoading}>
                {isLoading ? (
                  <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando cuenta...</>
                ) : (
                  <>Crear mi cuenta <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/sign-in" className="text-primary hover:text-primary/80 font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/dashboard/ayuda" className="hover:text-foreground transition-colors">Ayuda</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
