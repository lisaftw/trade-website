import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { verifySitePassword } from "./actions"

export default function SiteAccessPage() {
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
