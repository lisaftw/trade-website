import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { ScrollParallax } from "@/components/scroll-parallax"
import { DiscordMemberCount } from "@/components/discord-member-count"
import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="relative min-h-dvh bg-background">
      <PageBackground />
      <ScrollParallax />

      {/* ensure content layers above parallax for readability */}
      <div className="relative z-[2] mx-auto w-full max-w-5xl px-4 py-12 md:py-16">
        <SiteHeader />

        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-border bg-secondary/20 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/30"
            aria-label="Return to Home"
          >
            <span aria-hidden="true">←</span>
            <span className="ml-2">Home</span>
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-brand/30 via-transparent to-transparent">
          <div className="rounded-3xl border border-border bg-secondary/10 p-8 md:p-10">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <h1 className="text-balance text-3xl font-semibold md:text-4xl">About Trade</h1>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
                  Trade is your trusted source for accurate, up-to-date values across top Roblox titles. We combine
                  market telemetry with community expertise to keep your decisions fast, fair, and informed.
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                <p className="text-xs text-muted-foreground">Tracked Games</p>
                <p className="mt-1 text-xl font-semibold">3</p>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                <p className="text-xs text-muted-foreground">Daily Updates</p>
                <p className="mt-1 text-xl font-semibold">24/7</p>
              </div>
              <DiscordMemberCount />
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-secondary/10 p-6">
            <h2 className="text-lg font-semibold">Our Mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Everyone deserves access to reliable value data. We monitor market trends, verify trades, and maintain
              accurate lists for MM2, SAB & Adopt Me.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/10 p-6">
            <h2 className="text-lg font-semibold">What We Offer</h2>
            <ul className="mt-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                Real-time value updates backed by live market data
              </li>
              <li className="mt-2 flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                Community-verified trading information
              </li>
              <li className="mt-2 flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                Expert tips and market insights
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/10 p-6">
            <h2 className="text-lg font-semibold">Join Our Community</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Connect with thousands of traders. Get instant value updates, participate in giveaways, and learn from
              experienced players. Your next trade should be your best trade.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/10 p-6">
            <h2 className="text-lg font-semibold">Transparency & Safety</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We prioritize fair play. Our data is auditable, our methods transparent, and our community standards
              focused on safety and respect.
            </p>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  )
}
