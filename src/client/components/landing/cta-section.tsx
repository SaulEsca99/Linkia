import Link from "next/link"
import Image from "next/image"
import { Button } from "@/client/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 px-6 bg-primary">
      <div className="max-w-3xl mx-auto text-center">
        <Image
          src="/branding/linkia-brand.png"
          alt="Linkia"
          width={160}
          height={48}
          className="h-12 w-auto mx-auto mb-8 brightness-0 invert"
        />
        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
          Deja de enviar el mismo CV a todas las vacantes
        </h2>
        <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
          Únete a miles de profesionales que ya están usando Linkia para encontrar mejores oportunidades en México y LATAM.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 px-8" asChild>
            <Link href="/sign-up">
              Comenzar gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8" asChild>
            <Link href="#como-funciona">Ver cómo funciona</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
