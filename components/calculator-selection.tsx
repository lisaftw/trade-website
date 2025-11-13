"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, Coins } from "lucide-react"
import Link from "next/link"

export function CalculatorSelection() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-balance text-3xl font-bold tracking-wide text-white md:text-4xl">Choose Calculator Type</h1>
        <p className="mt-2 text-sm text-gray-400 md:text-base">Select the calculator that fits your needs</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trade Calculator Card */}
        <Card className="group relative overflow-hidden border-2 border-gray-700/50 bg-gradient-to-b from-gray-900/40 to-black/60 p-8 transition-all hover:border-brand/50 hover:shadow-lg hover:shadow-brand/20">
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-brand/10 p-4">
              <Calculator className="h-12 w-12 text-brand" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-white">Trade Calculator</h2>
            <p className="mb-6 text-sm text-gray-400">
              Compare trades between you and another player. Calculate the value difference and make fair trades.
            </p>
            <Button asChild className="w-full" size="lg">
              <Link href="/calculator/trade">Start Trade Calculator</Link>
            </Button>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </Card>

        <Card className="group relative overflow-hidden border-2 border-gray-700/50 bg-gradient-to-b from-gray-900/40 to-black/60 p-8 transition-all hover:border-gray-600/70 hover:shadow-lg hover:shadow-gray-500/20">
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-gray-700/30 p-4">
              <Coins className="h-12 w-12 text-gray-300" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-white">In-game Calculator</h2>
            <p className="mb-6 text-sm text-gray-400">
              Calculate the total value of your items within a single game. Perfect for inventory management.
            </p>
            <Button asChild className="w-full" size="lg">
              <Link href="/calculator/ingame">Start In-game Calculator</Link>
            </Button>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </Card>
      </div>
    </div>
  )
}
