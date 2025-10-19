import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  return (
    <main className="relative min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10 bg-[url('/login/pattern.png')] bg-repeat bg-[length:240px_auto] mix-blend-screen [mask-image:radial-gradient(80%_80%_at_50%_50%,black,transparent)]"
        />
        <div className="absolute -inset-[10px] opacity-50">
          <div
            aria-hidden="true"
            className="absolute top-0 -left-4 w-72 h-72 rounded-full bg-foreground/15 mix-blend-screen filter blur-xl opacity-70 animate-blob"
          />
          <div
            aria-hidden="true"
            className="absolute top-0 -right-4 w-72 h-72 rounded-full bg-foreground/12 mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-8 left-20 w-72 h-72 rounded-full bg-foreground/10 mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000"
          />
        </div>
      </div>

      <Card className="relative z-10 w-full max-w-md backdrop-blur-sm bg-card/95 border-2">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Welcome to TRADE</CardTitle>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <CardDescription>Sign in with Discord to access your profile and start trading</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full h-12 text-base" size="lg">
            <a href="/api/auth/discord">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.076.076 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.077.077 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Continue with Discord
            </a>
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
