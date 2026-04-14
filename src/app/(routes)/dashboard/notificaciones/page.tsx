"use client"

import { useState } from "react"
import { Card, CardContent } from "@/client/components/ui/card"
import { Button } from "@/client/components/ui/button"
import {
  Bell, BellOff, Target, FileText, Sparkles, Settings,
  Trash2, Check, Clock,
} from "lucide-react"
import { cn } from "@/client/lib/utils"
import Link from "next/link"

interface Notification {
  id: number; type: "match" | "cv" | "tip" | "system"; title: string
  message: string; time: string; read: boolean; action?: { label: string; href: string }
}

const mockNotifications: Notification[] = [
  { id: 1, type: "match", title: "Nuevo match 94%", message: "Senior React Developer en TechCorp MX coincide con tu perfil", time: "Hace 5 min", read: false, action: { label: "Ver vacante", href: "/dashboard/matches" } },
  { id: 2, type: "tip", title: "Tip para tu CV", message: "Agregar certificaciones puede aumentar tu match score en un 15%", time: "Hace 1 hora", read: false, action: { label: "Mejorar CV", href: "/dashboard/cv" } },
  { id: 3, type: "match", title: "3 nuevas vacantes", message: "Encontramos vacantes que coinciden con tus preferencias", time: "Hace 3 horas", read: true, action: { label: "Explorar", href: "/dashboard/vacantes" } },
  { id: 4, type: "cv", title: "CV analizado exitosamente", message: "Tu perfil profesional ha sido creado. Score: 92/100", time: "Ayer", read: true },
  { id: 5, type: "system", title: "¡Bienvenido a Linkia!", message: "Comienza subiendo tu CV para encontrar las mejores oportunidades", time: "Hace 2 días", read: true },
  { id: 6, type: "match", title: "Vacante guardada por vencer", message: "La vacante en StartupAI cierra aplicaciones en 2 días", time: "Hace 2 días", read: true, action: { label: "Aplicar ahora", href: "/dashboard/vacantes" } },
]

const typeConfig = {
  match: { icon: Target, color: "bg-emerald-100 text-emerald-600" },
  cv: { icon: FileText, color: "bg-blue-100 text-blue-600" },
  tip: { icon: Sparkles, color: "bg-amber-100 text-amber-600" },
  system: { icon: Bell, color: "bg-violet-100 text-violet-600" },
}

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const unreadCount = notifications.filter(n => !n.read).length
  const filtered = filter === "unread" ? notifications.filter(n => !n.read) : notifications

  const markAsRead = (id: number) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllAsRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })))
  const deleteNotification = (id: number) => setNotifications(notifications.filter(n => n.id !== id))
  const clearAll = () => setNotifications([])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-muted/30 backdrop-blur-sm border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">Notificaciones</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">{unreadCount}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" className="gap-2" onClick={markAllAsRead}>
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">Marcar leídas</span>
                </Button>
              )}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/configuracion"><Settings className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>Todas</Button>
          <Button variant={filter === "unread" ? "default" : "outline"} size="sm" onClick={() => setFilter("unread")}>No leídas ({unreadCount})</Button>
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((notification) => {
              const config = typeConfig[notification.type]
              return (
                <Card key={notification.id} className={cn("border-0 shadow-sm transition-all", !notification.read && "bg-primary/5 border-l-4 border-l-primary")}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", config.color)}>
                        <config.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className={cn("font-semibold text-foreground", !notification.read && "text-primary")}>{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                            <Clock className="h-3 w-3" />{notification.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          {notification.action && (
                            <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                              <Link href={notification.action.href}>{notification.action.label}</Link>
                            </Button>
                          )}
                          {!notification.read && (
                            <Button size="sm" variant="ghost" className="h-8 text-xs gap-1" onClick={() => markAsRead(notification.id)}>
                              <Check className="h-3 w-3" /> Marcar leída
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-red-500 ml-auto" onClick={() => deleteNotification(notification.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <BellOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No tienes notificaciones</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {filter === "unread" ? "Has leído todas tus notificaciones" : "Las notificaciones aparecerán aquí"}
              </p>
            </CardContent>
          </Card>
        )}

        {notifications.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button variant="ghost" className="text-muted-foreground gap-2" onClick={clearAll}>
              <Trash2 className="h-4 w-4" /> Borrar todas las notificaciones
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
