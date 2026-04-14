"use client"

import { useState } from "react"
import { Card, CardContent } from "@/client/components/ui/card"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Switch } from "@/client/components/ui/switch"
import {
  User, Mail, Phone, MapPin, Bell, Shield, Globe, Moon,
  CreditCard, LogOut, ChevronRight, Camera, Save, Trash2,
} from "lucide-react"
import Link from "next/link"

export default function ConfiguracionPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-muted/30 backdrop-blur-sm border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Configuración</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Administra tu cuenta y preferencias</p>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-6 max-w-3xl">
        {/* Profile Section */}
        <Card className="border-0 shadow-sm bg-card mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Perfil
            </h2>
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
                  MG
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre</label>
                    <Input placeholder="Tu nombre" className="bg-muted/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Apellido</label>
                    <Input defaultValue="Lopez" className="bg-muted/50" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="tu@email.com" className="pl-10 bg-muted/50" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input defaultValue="+52 55 1234 5678" className="pl-10 bg-muted/50" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Ubicación</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input defaultValue="CDMX, México" className="pl-10 bg-muted/50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button className="gap-2">
                <Save className="h-4 w-4" /> Guardar cambios
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-0 shadow-sm bg-card mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Notificaciones
            </h2>
            <div className="space-y-4">
              {[
                { label: "Notificaciones por email", desc: "Recibe alertas de nuevas vacantes", checked: emailNotifications, onChange: setEmailNotifications },
                { label: "Notificaciones push", desc: "Alertas instantáneas en tu navegador", checked: pushNotifications, onChange: setPushNotifications },
                { label: "Resumen semanal", desc: "Reporte de actividad cada lunes", checked: weeklyDigest, onChange: setWeeklyDigest },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.checked} onCheckedChange={item.onChange} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="border-0 shadow-sm bg-card mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Preferencias
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Modo oscuro</p>
                    <p className="text-sm text-muted-foreground">Cambia la apariencia de la app</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Idioma</p>
                    <p className="text-sm text-muted-foreground">Español (México)</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="border-0 shadow-sm bg-card mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Cuenta
            </h2>
            <div className="space-y-2">
              <Link href="/dashboard/pago" className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Suscripción y facturación</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Cambiar contraseña</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <Link href="/sign-in" className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors text-red-500">
                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Cerrar sesión</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-6">
            <h2 className="font-semibold text-red-700 mb-2">Zona de peligro</h2>
            <p className="text-sm text-red-600 mb-4">Una vez eliminada tu cuenta, no podrás recuperarla.</p>
            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100 gap-2">
              <Trash2 className="h-4 w-4" /> Eliminar cuenta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
