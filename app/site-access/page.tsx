import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

async function verifySitePassword(formData: FormData) {
  "use server"

  const password = formData.get("password") as string
  const correctPassword = process.env.ADMIN_PASSWORD || "qsxcvbhjio987654"

  console.log("[v0] Server Action: Password verification attempt")
  console.log("[v0] Server Action: Password received:", password)
  console.log("[v0] Server Action: Expected password:", correctPassword)

  if (password === correctPassword) {
    console.log("[v0] Server Action: Password correct, setting cookie")

    const cookieStore = await cookies()

    cookieStore.set("site-access", "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    console.log("[v0] Server Action: Cookie set, redirecting")

    redirect("/")
  }

  console.log("[v0] Server Action: Password incorrect")
  return { error: "Invalid password" }
}

export default async function SiteAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Site Access Required</CardTitle>
          <CardDescription>
            This site is currently in development. Enter the access password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={verifySitePassword} className="space-y-4">
            <div className="space-y-2">
              <Input type="password" name="password" placeholder="Enter password" autoFocus required />
              {params.error && <p className="text-sm text-red-500">{params.error}</p>}
            </div>
            <Button type="submit" className="w-full">
              Access Site
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
