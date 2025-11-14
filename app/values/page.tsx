import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { ScrollParallax } from "@/components/scroll-parallax"
import { ValuesContent } from "@/components/values-content"
import { BackButton } from "@/components/back-button"
import { ItemsProvider } from "@/lib/contexts/items-context"
import { ItemsLoadingOverlay } from "@/components/items-loading-overlay"

export const revalidate = 3600 // Revalidate every hour

export default function ValuesPage() {
  return (
    <ItemsProvider>
      <main className="relative min-h-dvh bg-background">
        <PageBackground />
        <ScrollParallax />
        <div className="relative z-[2] mx-auto w-full max-w-7xl px-4 py-6 md:py-8 lg:py-12">
          <SiteHeader />

          <div className="mb-4 md:mb-6">
            <BackButton fallbackHref="/" label="Home" />
          </div>

          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Trade Values</h1>
            <p className="mt-2 text-xs md:text-sm text-muted-foreground">
              Real-time trading values for MM2, SAB & Adopt Me
            </p>
          </div>

          <ValuesContent />

          <SiteFooter />
        </div>
        <ItemsLoadingOverlay />
      </main>
    </ItemsProvider>
  )
}
