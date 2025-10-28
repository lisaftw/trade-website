import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { ScrollParallax } from "@/components/scroll-parallax"
import { SABCalculator } from "@/components/sab-calculator"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SABCalculatorPage() {
  return (
    <main className="relative min-h-dvh bg-background">
      <PageBackground />
      <ScrollParallax />
      <div className="relative z-[2] mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
        <SiteHeader />
        <div className="mb-6 md:mb-8">
          <Button variant="outline" size="sm" asChild className="gap-2 bg-transparent">
            <Link href="/calculator">
              <ArrowLeft className="h-4 w-4" />
              Back to Calculator Selection
            </Link>
          </Button>
        </div>
        <div className="mt-8">
          <SABCalculator />
        </div>
        <SiteFooter />
      </div>
    </main>
  )
}
