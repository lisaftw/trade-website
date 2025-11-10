"use client"
import { AdoptMeItemCard } from "@/components/adoptme-item-card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"

export default function AdoptMeCardDemoPage() {
  return (
    <main className="relative min-h-dvh bg-background">
      <PageBackground />
      <div className="relative z-[2] mx-auto w-full max-w-6xl px-4 py-10 md:py-16">
        <SiteHeader />

        <div className="mt-8">
          <h1 className="text-3xl font-bold text-center mb-2">Adopt Me Item Card Demo</h1>
          <p className="text-center text-muted-foreground mb-8">
            Pixel-perfect recreation using the provided PNG assets
          </p>

          <div className="flex flex-wrap gap-8 justify-center items-start">
            {/* Original design */}
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-4">Example 1: Turky</h2>
              <AdoptMeItemCard
                name="Turky"
                rarity="Epic"
                demand="4/10"
                value={1200}
                image="/unicorn.jpg"
                lastUpdated="99 Hours Ago"
                onAddToInventory={() => console.log("Added Turky to inventory")}
              />
            </div>

            {/* Another example */}
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-4">Example 2: Dragon</h2>
              <AdoptMeItemCard
                name="Dragon"
                rarity="Legendary"
                demand="8/10"
                value={2500}
                image="/adopt-me-pet.jpg"
                lastUpdated="2 Hours Ago"
                onAddToInventory={() => console.log("Added Dragon to inventory")}
              />
            </div>

            {/* Third example */}
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-4">Example 3: Unicorn</h2>
              <AdoptMeItemCard
                name="Unicorn"
                rarity="Legendary"
                demand="9/10"
                value={3000}
                image="/game-icon-pets.jpg"
                lastUpdated="5 Hours Ago"
                onAddToInventory={() => console.log("Added Unicorn to inventory")}
              />
            </div>
          </div>

          <div className="mt-12 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Component Usage</h2>
            <div className="bg-secondary/20 rounded-lg p-6 border border-border">
              <pre className="text-sm overflow-x-auto">
                <code>{`<AdoptMeItemCard
  name="Turky"
  rarity="Epic"
  demand="4/10"
  value={1200}
  image="/turkey.png"
  lastUpdated="99 Hours Ago"
  onAddToInventory={() => {
    // Custom handler
  }}
/>`}</code>
              </pre>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold">Features:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Pixel-perfect recreation using provided PNG assets</li>
                <li>Responsive hover effects on the button (1.05x scale)</li>
                <li>Active state with scale animation (0.95x on click)</li>
                <li>Console log on button click</li>
                <li>Customizable props for all content</li>
                <li>Last Updated overlay on item image</li>
                <li>Bold cartoonish text with proper shadows and outlines</li>
              </ul>
            </div>
          </div>
        </div>

        <SiteFooter />
      </div>
    </main>
  )
}
