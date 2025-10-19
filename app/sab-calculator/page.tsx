import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { ScrollParallax } from "@/components/scroll-parallax"
import { SABCalculator } from "@/components/sab-calculator"

export default function SABCalculatorPage() {
  return (
    <main className="relative min-h-dvh bg-background">
      <PageBackground />
      <ScrollParallax />
      <div className="relative z-[2] mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
        <SiteHeader />
        <div className="mt-8">
          <SABCalculator />
        </div>
        <SiteFooter />
      </div>
    </main>
  )
}
