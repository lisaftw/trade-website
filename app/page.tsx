import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { ScrollParallax } from "@/components/scroll-parallax"
import { CableIcon as CalcIcon, MessageSquare } from "lucide-react"

export const revalidate = 3600

const games = ["MM2", "SAB", "Adopt Me"]

function ReferenceHero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto mt-2 md:mt-4 grid w-full max-w-6xl grid-cols-1 items-center gap-4 md:gap-8 px-4 md:grid-cols-2"
    >
      {/* Left: character render */}
      <div className="relative order-2 mx-auto md:order-1 md:mx-0">
        <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-b from-white/10 to-transparent blur-2xl opacity-60" />
        <Image
          src="/home/hero-render.png"
          alt="Roblox trader character"
          width={720}
          height={900}
          priority
          className="relative z-[1] h-auto w-[85%] sm:w-[72%] md:w-[88%] lg:w-[92%] select-none drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)] transition-transform duration-500 hover:scale-[1.02]"
        />
      </div>

      {/* Right: logo, copy, CTAs */}
      <div className="relative order-1 md:order-2">
        <Image
          src="/home/logo-trader.png"
          alt="TRADER"
          width={860}
          height={300}
          priority
          className="mx-auto h-auto w-full max-w-[280px] sm:max-w-[400px] md:max-w-[720px] select-none drop-shadow-[0_4px_0_rgba(255,255,255,0.12)]"
        />
        <p
          id="hero-title"
          className="mx-auto mt-2 md:mt-3 max-w-xl text-center text-xs sm:text-sm text-muted-foreground md:text-left px-2 md:px-0"
        >
          Built by traders, for traders. Get the <span className="font-semibold">most reliable</span> Roblox value
          updates and make <span className="font-semibold">smarter</span> trades.
        </p>

        {/* Center hero CTAs on all breakpoints */}
        <div className="mt-4 md:mt-5 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 md:gap-3 px-2 md:px-0">
          <Button
            asChild
            variant="ghost"
            className="h-10 md:h-11 w-full sm:w-auto rounded-[14px] border border-white/20 bg-background/60 px-4 md:px-5 text-xs md:text-[13px] font-medium text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur transition-all duration-200 hover:scale-[1.03] hover:bg-background/75 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
          >
            <a href="/calculator" aria-label="Open trading calculator">
              <span className="flex items-center justify-center gap-2">
                <CalcIcon className="size-4 opacity-90" aria-hidden />
                <span>Calculator</span>
              </span>
            </a>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="h-10 md:h-11 w-full sm:w-auto rounded-[14px] border border-white/20 bg-background/60 px-4 md:px-5 text-xs md:text-[13px] font-medium text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur transition-all duration-200 hover:scale-[1.03] hover:bg-background/75 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
          >
            <a href="/trading" aria-label="Trade Ads - Browse and post trades">
              <span className="flex items-center justify-center gap-2">
                <MessageSquare className="size-4 opacity-90" aria-hidden />
                <span>Trade Ads</span>
              </span>
            </a>
          </Button>
        </div>

        {/* Games row */}
        <div className="pointer-events-none relative mt-4 md:mt-6 w-full px-2 md:px-0">
          <div className="absolute inset-0 rounded-3xl border border-white/8 shadow-[0_10px_40px_rgba(0,0,0,0.35)]" />
          <div className="rounded-3xl bg-background/40 p-3 backdrop-blur">
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src="/home/mm2-icon.png"
                  alt="MM2"
                  width={400}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src="/home/sab-icon.png"
                  alt="SAB"
                  width={400}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src="/home/adoptme-icon.png"
                  alt="Adopt Me"
                  width={400}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DiscordCTA() {
  return (
    <section
      aria-labelledby="discord-title"
      className="relative mt-6 md:mt-8 overflow-hidden rounded-2xl border border-border bg-secondary/20 transition-all duration-300 hover:border-brand/50 hover:shadow-2xl md:hover:scale-[1.02]"
    >
      <div className="absolute inset-0 opacity-5 [mask-image:radial-gradient(60%_70%_at_50%_0%,black,transparent)]">
        <div className="h-full w-full bg-[linear-gradient(0deg,transparent_0,transparent_92%,rgba(255,255,255,0.5)_92%),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:100%_40px,40px_100%]" />
      </div>
      <div className="relative grid grid-cols-1 items-center gap-3 md:gap-4 p-4 md:p-5 sm:grid-cols-[1fr_auto]">
        <div>
          <h3 id="discord-title" className="text-xs md:text-sm font-semibold">
            Trade Discord Server
          </h3>
          <p className="mt-1 text-[10px] md:text-xs text-muted-foreground">Daily updates • Values • Giveaways</p>
          <Button
            asChild
            className="mt-2 md:mt-3 h-7 md:h-8 w-full sm:w-auto rounded-md bg-brand px-3 md:px-4 text-[11px] md:text-[12px] text-brand-foreground hover:bg-brand/90 hover:scale-105 hover:shadow-lg transition-all duration-200"
            aria-label="Join Discord on discord.gg/values"
          >
            <a href="https://discord.gg/values" target="_blank" rel="noopener noreferrer">
              Join Now
            </a>
          </Button>
        </div>
        <div className="flex items-end gap-3"></div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section
      aria-labelledby="about-title"
      className="mt-4 md:mt-6 rounded-2xl border border-white/5 bg-secondary/10 p-4 md:p-5 transition-all duration-300 hover:border-white/10 hover:bg-secondary/15"
    >
      <h3 id="about-title" className="text-xs md:text-sm font-semibold">
        About Us
      </h3>
      <p className="mt-2 text-[11px] md:text-xs leading-5 md:leading-6 text-muted-foreground">
        Trade is a handheld, value-first project focused on giving players reliable, curated trading values for Adopt
        Me. We maintain a balanced, data-driven list so you can make smarter trades with confidence.
      </p>
    </section>
  )
}

export default function HomePage() {
  return (
    <main className="relative min-h-dvh bg-background">
      <PageBackground />
      <ScrollParallax />
      {/* ensure content layers above parallax for readability */}
      <div className="relative z-[2] mx-auto w-full max-w-6xl px-4 py-10 md:py-16">
        <SiteHeader />

        {/* Replace previous hero with the new reference-driven hero */}
        <ReferenceHero />

        {/* Keep existing DiscordCTA and About for depth */}
        <DiscordCTA />
        <About />

        <SiteFooter />
      </div>
    </main>
  )
}
