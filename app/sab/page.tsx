import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { ScrollParallax } from "@/components/scroll-parallax"
import { SABContent } from "@/components/sab-content"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "SAB Values - Steal a Brainrot Trading Values",
  description:
    "Real-time trading values for Steal a Brainrot (SAB) brainrots. View all brainrot values, rarities, and demand.",
}

export default function SABPage() {
  return (
    <main className="relative min-h-dvh bg-background">
      <PageBackground />
      <ScrollParallax />
      <div className="relative z-[2] mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
        <SiteHeader />
        <div className="mb-6 md:mb-8">
          <Button variant="outline" size="sm" asChild className="gap-2 bg-transparent">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        <div className="mt-8">
          <SABContent />
        </div>
        <SiteFooter />
      </div>
    </main>
  )
}
