import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { ScrollParallax } from "@/components/scroll-parallax"
import { ValuesContent } from "@/components/values-content"
import { AuthGate } from "@/components/auth-gate"
import Link from "next/link"

export default function ValuesPage() {
  return (
    <main className="relative min-h-dvh bg-background">
      <PageBackground />
      <ScrollParallax />
      <div className="relative z-[2] mx-auto w-full max-w-7xl px-4 py-6 md:py-8 lg:py-12">
        <SiteHeader />

        <Link
          href="/"
          className="mb-4 md:mb-6 inline-flex items-center gap-2 rounded-full bg-secondary/40 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-foreground transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span aria-hidden="true">←</span>
          Home
        </Link>

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Trade Values</h1>
          <p className="mt-2 text-xs md:text-sm text-muted-foreground">
            Real-time trading values for MM2, SAB, GAG & Adopt Me
          </p>
        </div>

        <AuthGate feature="live trading values">
          <ValuesContent />
        </AuthGate>

        <SiteFooter />
      </div>
    </main>
  )
}
