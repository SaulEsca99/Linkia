"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/client/lib/utils"
import { LayoutDashboard, FileText, Briefcase, Target, Bell } from "lucide-react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { href: "/dashboard/cv", icon: FileText, label: "Mi CV" },
  { href: "/dashboard/vacantes", icon: Briefcase, label: "Vacantes" },
  { href: "/dashboard/matches", icon: Target, label: "Matches" },
  { href: "/dashboard/notificaciones", icon: Bell, label: "Alertas" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
