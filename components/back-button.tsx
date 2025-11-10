"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BackButtonProps {
  fallbackHref?: string
  label?: string
  variant?: "default" | "ghost" | "secondary"
  className?: string
}

export function BackButton({
  fallbackHref = "/",
  label = "Back",
  variant = "secondary",
  className = "",
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      router.back()
    } else {
      // Fallback to specified route if no history
      router.push(fallbackHref)
    }
  }

  return (
    <Button
      onClick={handleBack}
      variant={variant}
      size="sm"
      className={`group inline-flex items-center gap-2 rounded-full transition-all hover:gap-3 ${className}`}
      aria-label={`Navigate back to previous page or ${fallbackHref}`}
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  )
}
