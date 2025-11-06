import { TradingItemCard } from "@/components/trading-item-card"

export default function DemoCardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
      <div className="max-w-7xl w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Trading Card Demo</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TradingItemCard
            name="Turky"
            rarity="Epic"
            demand="4/10"
            value={1200}
            image="/adoptme-card/turkey.png"
            lastUpdated="99 Hours Ago"
          />

          <TradingItemCard
            name="Unicorn"
            rarity="Legendary"
            demand="8/10"
            value={2500}
            image="/unicorn.jpg"
            lastUpdated="2 Hours Ago"
          />

          <TradingItemCard
            name="Dragon"
            rarity="Legendary"
            demand="9/10"
            value={3000}
            image="/placeholder.svg?height=400&width=400"
            lastUpdated="1 Hour Ago"
          />
        </div>
      </div>
    </main>
  )
}
