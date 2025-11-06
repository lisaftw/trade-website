import { Suspense } from "react"
import { PageBackground } from "@/components/page-background"
import { ScrollParallax } from "@/components/scroll-parallax"
import { BulkImageMigration } from "@/components/bulk-image-migration"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminAuthGate } from "@/components/admin-auth-gate"

export default function MigrateImagesPage() {
  return (
    <>
      <PageBackground />
      <ScrollParallax />
      <main className="relative z-10 min-h-screen px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Panel
          </Link>
          <h1 className="mb-2 text-balance text-4xl font-bold tracking-tight md:text-5xl">Bulk Image Migration</h1>
          <p className="mb-8 text-pretty text-muted-foreground">
            Upload new images for items with expired Discord CDN URLs
          </p>
          <Suspense
            fallback={
              <div className="rounded-lg border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">Loading migration tool...</p>
              </div>
            }
          >
            <AdminAuthGate>
              <BulkImageMigration />
            </AdminAuthGate>
          </Suspense>
        </div>
      </main>
    </>
  )
}
