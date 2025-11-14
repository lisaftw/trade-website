import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { ScrollParallax } from "@/components/scroll-parallax"
import { TradeCalculator } from "@/components/trade-calculator"
import { CalculatorSkin } from "@/components/calculator-skin"
import { RobloxDecos } from "@/components/roblox-decos"
import { ItemsProvider } from "@/lib/contexts/items-context"
import { ItemsLoadingOverlay } from "@/components/items-loading-overlay"

export default function TradeCalculatorPage() {
  return (
    <ItemsProvider>
      <main className="relative min-h-dvh bg-background">
        <PageBackground />
        <ScrollParallax />
        <div className="relative z-[2] mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
          <SiteHeader />
          <div className="relative">
            <RobloxDecos />
            <div className="relative z-[1]">
              <CalculatorSkin>
                <TradeCalculator />
              </CalculatorSkin>
            </div>
          </div>
          <SiteFooter />
        </div>
        <ItemsLoadingOverlay />
      </main>
    </ItemsProvider>
  )
}
