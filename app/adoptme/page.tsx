import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { ScrollParallax } from "@/components/scroll-parallax"
import { AdoptMeContent } from "@/components/adoptme-content"
import { BackButton } from "@/components/back-button"
import { ItemsProvider } from "@/lib/contexts/items-context"

export const metadata = {
  title: "Adopt Me Values - Real-Time Pet Trading Values",
  description:
    "Real-time trading values for Adopt Me pets. View all pet values, rarities, demand, and make better trades.",
}

export const revalidate = 3600

export default function AdoptMePage() {
  return (
    <main className="relative min-h-dvh bg-background">
      <PageBackground />
      <ScrollParallax />
      <div className="relative z-[2] mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
        <SiteHeader />

        <div className="mb-6 md:mb-8">
          <BackButton fallbackHref="/" label="Home" />
        </div>

        <div className="mt-8">
          <ItemsProvider>
            <AdoptMeContent />
          </ItemsProvider>
        </div>
        <SiteFooter />
      </div>
    </main>
  )
}
