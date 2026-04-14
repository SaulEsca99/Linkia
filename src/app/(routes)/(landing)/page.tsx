import { Navbar } from "@/client/components/landing/navbar"
import { HeroSection } from "@/client/components/landing/hero-section"
import { StatsSection } from "@/client/components/landing/stats-section"
import { HowItWorksSection } from "@/client/components/landing/how-it-works-section"
import { FeaturesSection } from "@/client/components/landing/features-section"
import { PricingSection } from "@/client/components/landing/pricing-section"
import { TestimonialsSection } from "@/client/components/landing/testimonials-section"
import { CTASection } from "@/client/components/landing/cta-section"
import { Footer } from "@/client/components/landing/footer"

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
