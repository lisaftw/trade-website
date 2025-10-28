import { AdoptMeCalculator } from "@/components/adoptme-calculator"
import { BackButton } from "@/components/back-button"

export default function AdoptMeCalculatorPage() {
  return (
    <div className="min-h-screen bg-black py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6">
          <BackButton fallbackHref="/calculator" label="Back to Calculators" variant="ghost" />
        </div>

        <AdoptMeCalculator />
      </div>
    </div>
  )
}
