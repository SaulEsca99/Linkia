"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/client/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-lg border-b border-border" : ""
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/branding/linkia-brand.png"
            alt="Linkia"
            width={100}
            height={30}
            className="h-7 w-auto"
            priority
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cómo funciona
          </Link>
          <Link href="#caracteristicas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Características
          </Link>
          <Link href="#precios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Precios
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sign-in">Iniciar sesión</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sign-up">Comenzar gratis</Link>
          </Button>
        </div>

        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 py-4 space-y-4">
          <Link href="#como-funciona" className="block text-sm text-muted-foreground" onClick={() => setIsMobileMenuOpen(false)}>
            Cómo funciona
          </Link>
          <Link href="#caracteristicas" className="block text-sm text-muted-foreground" onClick={() => setIsMobileMenuOpen(false)}>
            Características
          </Link>
          <Link href="#precios" className="block text-sm text-muted-foreground" onClick={() => setIsMobileMenuOpen(false)}>
            Precios
          </Link>
          <div className="pt-4 border-t border-border space-y-2">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/sign-in">Iniciar sesión</Link>
            </Button>
            <Button size="sm" className="w-full" asChild>
              <Link href="/sign-up">Comenzar gratis</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
