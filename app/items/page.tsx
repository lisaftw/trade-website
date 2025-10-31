import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { ItemValueCard } from "@/components/item-value-card"

export default function ItemsPage() {
  const sampleItems = [
    {
      itemName: "Pony",
      itemImage:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Value%20Display_Item%20Image%20Holder_pony-Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0.png",
      rarity: "Epic",
      demand: "High",
      value: "1200",
      lastUpdated: "99 Hours Ago",
    },
    {
      itemName: "Turky",
      itemImage:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Value%20Display_Item%20Image%20Holder_Layer%202-zHgGJV6EUCWqGPYiKjN1xGWn3zDBhx.png",
      rarity: "Epic",
      demand: "High",
      value: "1200",
      lastUpdated: "99 Hours Ago",
    },
  ]

  return (
    <main className="relative min-h-dvh bg-background">
      <PageBackground />
      <div className="relative z-[2] mx-auto w-full max-w-6xl px-4 py-10 md:py-16">
        <SiteHeader />

        <div className="mt-8">
          <h1 className="text-3xl font-bold text-center mb-8">Item Values</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleItems.map((item, index) => (
              <ItemValueCard key={index} {...item} />
            ))}
          </div>
        </div>

        <SiteFooter />
      </div>
    </main>
  )
}
