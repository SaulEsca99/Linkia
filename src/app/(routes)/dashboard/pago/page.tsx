"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/client/components/ui/card"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { CreditCard, Lock, Check, ArrowLeft, Shield, Crown } from "lucide-react"
import { cn } from "@/client/lib/utils"
import { useRouter } from "next/navigation"

export default function PagoPage() {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [name, setName] = useState("")

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const parts = []
    for (let i = 0, len = v.length; i < len; i += 4) parts.push(v.substring(i, i + 4))
    return parts.length ? parts.join(" ") : value
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    return v.length >= 2 ? v.slice(0, 2) + "/" + v.slice(2, 4) : v
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setIsSuccess(true)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Check className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">¡Pago exitoso!</h2>
          <p className="text-muted-foreground mb-2">Bienvenida a <strong>Linkia Pro</strong></p>
          <p className="text-sm text-muted-foreground mb-8">Ya tienes acceso a todas las funciones premium. ¡Encuentra tu trabajo ideal!</p>
          <Button size="lg" className="w-full gap-2" asChild>
            <Link href="/dashboard">Ir al Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/pro"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Finalizar compra</h1>
              <p className="text-sm text-muted-foreground">Pago seguro con encriptación SSL</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-5 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Method */}
            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-6">
                <h2 className="font-semibold text-foreground mb-4">Método de pago</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPaymentMethod("card")}
                    className={cn("p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3", paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50")}>
                    <CreditCard className={cn("h-5 w-5", paymentMethod === "card" ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("font-medium", paymentMethod === "card" ? "text-primary" : "text-foreground")}>Tarjeta</span>
                  </button>
                  <button onClick={() => setPaymentMethod("paypal")}
                    className={cn("p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3", paymentMethod === "paypal" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50")}>
                    <div className={cn("font-bold text-lg", paymentMethod === "paypal" ? "text-[#003087]" : "text-muted-foreground")}>
                      Pay<span className="text-[#009cde]">Pal</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Card Details */}
            {paymentMethod === "card" && (
              <Card className="border-0 shadow-sm bg-card">
                <CardContent className="p-6">
                  <h2 className="font-semibold text-foreground mb-4">Datos de la tarjeta</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre en la tarjeta</label>
                      <Input placeholder="Maria Garcia Lopez" value={name} onChange={(e) => setName(e.target.value)} className="bg-muted/50" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Número de tarjeta</label>
                      <div className="relative">
                        <Input placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} maxLength={19} className="bg-muted/50 pr-20" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <div className="w-8 h-5 rounded bg-[#1a1f71] flex items-center justify-center text-white text-[8px] font-bold">VISA</div>
                          <div className="w-8 h-5 rounded bg-gradient-to-r from-[#eb001b] to-[#f79e1b] flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-[#eb001b] opacity-80" />
                            <div className="w-3 h-3 rounded-full bg-[#f79e1b] -ml-1.5 opacity-80" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha de expiración</label>
                        <Input placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} maxLength={5} className="bg-muted/50" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">CVC</label>
                        <div className="relative">
                          <Input placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4} type="password" className="bg-muted/50" />
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {paymentMethod === "paypal" && (
              <Card className="border-0 shadow-sm bg-card">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#003087]/10 flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold text-xl text-[#003087]">P</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Pagar con PayPal</h3>
                  <p className="text-sm text-muted-foreground mb-6">Serás redirigido a PayPal para completar tu pago de forma segura</p>
                  <Button className="w-full bg-[#0070ba] hover:bg-[#003087] gap-2" onClick={handleSubmit} disabled={isProcessing}>
                    {isProcessing ? "Procesando..." : "Continuar con PayPal"}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <Shield className="h-5 w-5 text-emerald-600 shrink-0" />
              <p className="text-sm text-emerald-700">Tu información está protegida con encriptación SSL de 256 bits. Nunca almacenamos los datos completos de tu tarjeta.</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm bg-card sticky top-24">
              <CardContent className="p-6">
                <h2 className="font-semibold text-foreground mb-6">Resumen del pedido</h2>
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Plan Pro Anual</h3>
                      <p className="text-sm text-muted-foreground">Facturación anual</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {["Búsquedas ilimitadas", "CVs adaptados ilimitados", "Match avanzado con IA"].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary" />{feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">$1,788 MXN</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Descuento anual (33%)</span>
                    <span className="text-emerald-600">-$600 MXN</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-foreground">$1,188 MXN</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">Equivale a $99 MXN/mes</p>
                </div>

                {paymentMethod === "card" && (
                  <Button className="w-full gap-2" size="lg" onClick={handleSubmit} disabled={isProcessing || !cardNumber || !expiry || !cvc || !name}>
                    {isProcessing ? (
                      <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
                    ) : (
                      <><Lock className="h-4 w-4" /> Pagar $1,188 MXN</>
                    )}
                  </Button>
                )}

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Al completar tu compra aceptas nuestros{" "}
                  <Link href="#" className="text-primary hover:underline">Términos de servicio</Link>
                  {" "}y{" "}
                  <Link href="#" className="text-primary hover:underline">Política de privacidad</Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
