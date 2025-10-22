import { AdoptMeCalculator } from "@/components/adoptme-calculator"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdoptMeCalculatorPage() {
  return (
    <div className="min-h-screen bg-black py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/calculator">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Calculator Selection
            </Link>
          </Button>
        </div>

        <AdoptMeCalculator />
      </div>
    </div>
  )
}
