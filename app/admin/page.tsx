import { Suspense } from "react"
import { PageBackground } from "@/components/page-background"
import { ScrollParallax } from "@/components/scroll-parallax"
import { AdminContent } from "@/components/admin-content"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminAuthGate } from "@/components/admin-auth-gate"

export default function AdminPage() {
  return (
    <>
      <PageBackground />
      <ScrollParallax />
      <main className="relative z-10 min-h-screen px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Home
          </Link>
          <h1 className="mb-2 text-balance text-4xl font-bold tracking-tight md:text-5xl">Admin Panel</h1>
          <p className="mb-8 text-pretty text-muted-foreground">Manage trade items and values</p>
          <Suspense
            fallback={
              <div className="rounded-lg border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">Loading admin panel...</p>
              </div>
            }
          >
            <AdminAuthGate>
              <AdminContent />
            </AdminAuthGate>
          </Suspense>
        </div>
      </main>
    </>
  )
}
