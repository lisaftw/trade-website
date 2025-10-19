"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"
import { Calculator } from "lucide-react"
import Image from "next/image"

export function SiteHeader() {
  return (
    <header className="mb-12 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
        <Image
          src="/home/mascot.png"
          alt="Trade"
          width={32}
          height={32}
          className="h-7 w-7 md:h-8 md:w-8 drop-shadow-sm"
          priority={false}
        />
        <span className="sr-only">TRADE Home</span>
      </Link>
      <div className="flex items-center gap-3">
        <Button
          asChild
          size="sm"
          className="h-9 rounded-full border border-border bg-secondary/40 px-5 text-sm text-secondary-foreground hover:bg-secondary/60"
          variant="secondary"
        >
          <Link href="/values">Our Values</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="h-9 rounded-full border border-border bg-secondary/40 px-5 text-sm text-secondary-foreground hover:bg-secondary/60"
          variant="secondary"
        >
          <Link href="/calculator">
            <Calculator className="mr-2 h-4 w-4" />
            Calculator
          </Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="h-9 rounded-full border border-border bg-secondary/40 px-5 text-sm text-secondary-foreground hover:bg-secondary/60"
          variant="secondary"
        >
          <Link href="/about">About</Link>
        </Button>
        <div className="h-6 w-px bg-border" aria-hidden="true" />
        <UserMenu />
      </div>
    </header>
  )
}
