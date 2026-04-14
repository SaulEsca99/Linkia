"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/client/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Target,
  Settings,
  LogOut,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Bell,
} from "lucide-react"
import { Button } from "@/client/components/ui/button"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Inicio", description: "Vista general" },
  { href: "/dashboard/cv", icon: FileText, label: "Mi CV", description: "Perfil profesional" },
  { href: "/dashboard/vacantes", icon: Briefcase, label: "Vacantes", description: "Ofertas de empleo" },
  { href: "/dashboard/matches", icon: Target, label: "Matches", description: "Compatibilidad" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-border bg-card hidden lg:flex flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/branding/linkia-brand.png"
            alt="Linkia"
            width={120}
            height={36}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* User Section */}
      <div className="px-4 py-4 border-b border-border">
        <Link href="/dashboard/configuracion">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm shrink-0">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Mi cuenta</p>
              <p className="text-xs text-muted-foreground truncate">Configurar perfil →</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
          Menu principal
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                isActive
                  ? "bg-white/20"
                  : "bg-muted group-hover:bg-background"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <span className="block">{item.label}</span>
                <span className={cn(
                  "text-xs",
                  isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {item.description}
                </span>
              </div>
            </Link>
          )
        })}

        <div className="pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
            Más
          </p>
          <Link
            href="/dashboard/notificaciones"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
              pathname === "/dashboard/notificaciones"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
              <Bell className="h-5 w-5" />
            </div>
            <span>Notificaciones</span>
          </Link>
        </div>
      </nav>

      {/* Pro Upgrade Card */}
      <div className="px-4 pb-2">
        <Link href="/dashboard/pro">
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Linkia Pro</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              CVs adaptados ilimitados y matches prioritarios.
            </p>
            <Button size="sm" className="w-full">
              Actualizar a Pro
            </Button>
          </div>
        </Link>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-border p-4 space-y-1">
        <Link
          href="/dashboard/configuracion"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="h-5 w-5" />
          Configuración
        </Link>
        <Link
          href="/dashboard/ayuda"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <HelpCircle className="h-5 w-5" />
          Ayuda
        </Link>
        <Link
          href="/sign-in"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </Link>
      </div>
    </aside>
  )
}
