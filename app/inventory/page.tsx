import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { ScrollParallax } from "@/components/scroll-parallax"
import { InventoryContent } from "@/components/inventory-content"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function InventoryPage() {
  return (
    <main className="relative min-h-dvh bg-background">
      <PageBackground />
      <ScrollParallax />
      <div className="relative z-[2] mx-auto w-full max-w-7xl px-4 py-12 md:py-16">
        <SiteHeader />
        <div className="mb-8">
          <Button variant="outline" size="sm" asChild className="gap-2 bg-transparent">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold md:text-4xl">My Inventory</h1>
          <p className="mt-2 text-muted-foreground">View and manage your saved items</p>
        </div>

        <InventoryContent />

        <div className="mt-12">
          <SiteFooter />
        </div>
      </div>
    </main>
  )
}
