"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"
import { Calculator, Menu, MessageSquare, Users } from 'lucide-react'
import Image from "next/image"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="mb-8 md:mb-12 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
        <Image
          src="/logo-white.png"
          alt="Trade"
          width={32}
          height={32}
          className="h-8 w-8 md:h-10 md:w-10 drop-shadow-sm"
          priority={false}
        />
        <span className="sr-only">TRADE Home</span>
      </Link>

      <div className="hidden md:flex items-center gap-3">
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
          <Link href="/trading">
            <Users className="mr-2 h-4 w-4" />
            Trade Ads
          </Link>
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
          <Link href="/messages">
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
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

      <div className="flex md:hidden items-center gap-2">
        <UserMenu />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[320px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Link
                href="/values"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary/60"
              >
                Our Values
              </Link>
              <Link
                href="/trading"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary/60"
              >
                <Users className="h-4 w-4" />
                Trade Ads
              </Link>
              <Link
                href="/calculator"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary/60"
              >
                <Calculator className="h-4 w-4" />
                Calculator
              </Link>
              <Link
                href="/messages"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary/60"
              >
                <MessageSquare className="h-4 w-4" />
                Messages
              </Link>
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary/60"
              >
                About
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
