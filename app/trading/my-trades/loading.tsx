import { Card } from "@/components/ui/card"

export default function MyTradesLoading() {
  return (
    <main className="relative min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <div className="h-10 w-48 animate-pulse rounded-lg bg-foreground/10" />
            <div className="h-4 w-96 animate-pulse rounded-lg bg-foreground/10" />
          </div>

          {/* Trade Cards Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="card-neo space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-foreground/10" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-foreground/10" />
                      <div className="h-3 w-16 animate-pulse rounded bg-foreground/10" />
                    </div>
                  </div>
                  <div className="h-10 w-20 animate-pulse rounded-lg bg-foreground/10" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
