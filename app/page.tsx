import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { ScrollParallax } from "@/components/scroll-parallax"
import { ArrowRight, CableIcon as CalcIcon } from "lucide-react"

const games = ["MM2", "SAB", "GAG", "Adopt Me"]

function ReferenceHero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto mt-4 grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-4 md:mt-8 md:grid-cols-2"
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
          className="relative z-[1] h-auto w-[72%] md:w-[88%] lg:w-[92%] select-none drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)] transition-transform duration-500 hover:scale-[1.02]"
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
          className="mx-auto h-auto w-[92%] max-w-[720px] select-none drop-shadow-[0_4px_0_rgba(255,255,255,0.12)]"
        />
        <p id="hero-title" className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground md:text-left">
          Built by traders, for traders. Get the <span className="font-semibold">most reliable</span> Roblox value
          updates and make <span className="font-semibold">smarter</span> trades.
        </p>

        {/* Center hero CTAs on all breakpoints */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            className="group h-11 rounded-[14px] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02))] px-5 text-[13px] font-medium text-background shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_30px_rgba(0,0,0,0.35)] backdrop-saturate-150 transition-all duration-200 hover:scale-[1.03] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_14px_40px_rgba(0,0,0,0.45)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))]"
          >
            <a href="/trading" aria-label="Start Trading">
              <span className="flex items-center gap-2">
                <span>Start Trading</span>
                <ArrowRight
                  className="size-4 translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </a>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="h-11 rounded-[14px] border border-white/20 bg-background/60 px-5 text-[13px] font-medium text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur transition-all duration-200 hover:scale-[1.03] hover:bg-background/75 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
          >
            <a href="/calculator" aria-label="Open trading calculator">
              <span className="flex items-center gap-2">
                <CalcIcon className="size-4 opacity-90" aria-hidden />
                <span>Calculator</span>
              </span>
            </a>
          </Button>
        </div>

        {/* Games row */}
        <div className="pointer-events-none relative mt-6 w-full">
          <div className="absolute inset-0 rounded-3xl border border-white/8 shadow-[0_10px_40px_rgba(0,0,0,0.35)]" />
          <div className="rounded-3xl bg-background/40 p-3 backdrop-blur">
            <Image
              src="/home/games-row.png"
              alt="Featured games"
              width={1600}
              height={380}
              className="h-auto w-full rounded-2xl"
            />
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
      className="relative mt-8 overflow-hidden rounded-2xl border border-border bg-secondary/20 transition-all duration-300 hover:border-brand/50 hover:shadow-2xl hover:scale-[1.02]"
    >
      <div className="absolute inset-0 opacity-5 [mask-image:radial-gradient(60%_70%_at_50%_0%,black,transparent)]">
        <div className="h-full w-full bg-[linear-gradient(0deg,transparent_0,transparent_92%,rgba(255,255,255,0.5)_92%),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:100%_40px,40px_100%]" />
      </div>
      <div className="relative grid grid-cols-1 items-center gap-4 p-5 sm:grid-cols-[1fr_auto]">
        <div>
          <h3 id="discord-title" className="text-sm font-semibold">
            Trade Discord Server
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">Daily updates • Values • Giveaways</p>
          <Button
            asChild
            className="mt-3 h-8 rounded-md bg-brand px-4 text-[12px] text-brand-foreground hover:bg-brand/90 hover:scale-105 hover:shadow-lg transition-all duration-200"
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
      className="mt-6 rounded-2xl border border-white/5 bg-secondary/10 p-5 transition-all duration-300 hover:border-white/10 hover:bg-secondary/15"
    >
      <h3 id="about-title" className="text-sm font-semibold">
        About Us
      </h3>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">
        Trade is a handheld, value-first project focused on giving players reliable, curated trading values for popular
        games including MM2, SAB, GAG, and Adopt Me. We maintain a balanced, data-driven list so you can make smarter
        trades with confidence.
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
