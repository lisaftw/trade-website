import Link from "next/link"
import { ProfileForm } from "@/components/profile-form"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageBackground } from "@/components/page-background"
import { ScrollParallax } from "@/components/scroll-parallax"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  return (
    <main className="relative min-h-dvh bg-background">
      <PageBackground />
      <ScrollParallax />
      <div className="relative z-[2] mx-auto w-full max-w-5xl px-4 py-12 md:py-16">
        <SiteHeader />
        <div className="mb-8">
          <Button variant="outline" size="sm" asChild className="gap-2 bg-transparent">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold md:text-4xl">Your Profile</h1>
          <p className="mt-2 text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <ProfileForm />
        <div className="mt-12">
          <SiteFooter />
        </div>
      </div>
    </main>
  )
}
