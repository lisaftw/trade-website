"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { User, Mail, Eye, EyeOff, Activity, Save, RotateCcw } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ProfileForm() {
  const { data, isLoading, mutate } = useSWR<{ profile: any }>("/api/profile", fetcher)
  const { data: activityData } = useSWR<{ activities: any[] }>("/api/activity", fetcher)
  const p = data?.profile

  const [bio, setBio] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [showEmail, setShowEmail] = useState(false)
  const [showActivity, setShowActivity] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (p) {
      setBio(p.bio ?? "")
      setIsPublic(Boolean(p.is_public))
      setShowEmail(Boolean(p.show_email))
      setShowActivity(Boolean(p.show_activity))
    }
  }, [p])

  async function onSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          is_public: isPublic,
          show_email: showEmail,
          show_activity: showActivity,
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      await mutate()
      toast.success("Profile updated successfully!")
    } catch (e) {
      console.error("[v0] Save error", e)
      toast.error("Failed to save profile changes")
    } finally {
      setSaving(false)
    }
  }

  function onReset() {
    if (p) {
      setBio(p.bio ?? "")
      setIsPublic(Boolean(p.is_public))
      setShowEmail(Boolean(p.show_email))
      setShowActivity(Boolean(p.show_activity))
      toast.info("Changes reset")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!p) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Authentication Required</CardTitle>
          <CardDescription>You must be logged in to view your profile.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const hasChanges =
    bio !== (p.bio ?? "") ||
    isPublic !== Boolean(p.is_public) ||
    showEmail !== Boolean(p.show_email) ||
    showActivity !== Boolean(p.show_activity)

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-5">
              <Avatar className="h-24 w-24 ring-1 ring-border transition-shadow hover:ring-2">
                <AvatarImage src={p.avatar_url || "/placeholder.svg"} alt={p.global_name || p.username} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-2xl">{p.global_name || p.username || "Your Profile"}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {p.email && showEmail && (
                    <>
                      <Mail className="h-3 w-3" />
                      {p.email}
                    </>
                  )}
                </CardDescription>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {isPublic ? "Public" : "Private"}
                  </Badge>
                  {p.discord_id && (
                    <Badge variant="outline" className="text-xs">
                      Discord Connected
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Customize your profile and privacy preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bio Section */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell others about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 512))}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">{bio.length}/512 characters</p>
          </div>

          <Separator />

          {/* Privacy Settings */}
          <div className="space-y-4">
            <Label>Privacy Settings</Label>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  Public Profile
                </div>
                <p className="text-xs text-muted-foreground">Allow others to view your profile</p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4" />
                  Show Email
                </div>
                <p className="text-xs text-muted-foreground">Display your email on your profile</p>
              </div>
              <Switch checked={showEmail} onCheckedChange={setShowEmail} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Activity className="h-4 w-4" />
                  Show Activity
                </div>
                <p className="text-xs text-muted-foreground">Display your recent activity</p>
              </div>
              <Switch checked={showActivity} onCheckedChange={setShowActivity} />
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={onSave} disabled={saving || !hasChanges} className="gap-2 hover:opacity-90">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={onReset}
              disabled={!hasChanges}
              className="gap-2 bg-transparent hover:bg-secondary/50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Card */}
      {showActivity && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your recent actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {activityData?.activities && activityData.activities.length > 0 ? (
              <div className="space-y-3">
                {activityData.activities.slice(0, 10).map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">
                        {activity.type === "login" && "Logged in"}
                        {activity.type === "update_profile" && "Updated profile"}
                        {activity.type === "create_item" && `Created item: ${activity.meta?.item_name || "Unknown"}`}
                        {activity.type === "update_item" && "Updated an item"}
                        {!["login", "update_profile", "create_item", "update_item"].includes(activity.type) &&
                          activity.type}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(activity.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Last login: {p.last_login_at ? new Date(p.last_login_at).toLocaleString() : "Never"}
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Profile updated: {p.updated_at ? new Date(p.updated_at).toLocaleString() : "Never"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
