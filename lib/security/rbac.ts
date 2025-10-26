import { getSession } from "@/lib/auth/session"

export type Role = "user" | "admin"
export type Permission = "read:trades" | "write:trades" | "delete:trades" | "admin:all"

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  user: ["read:trades", "write:trades"],
  admin: ["read:trades", "write:trades", "delete:trades", "admin:all"],
}

/**
 * Checks if the current user has a specific permission
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const session = await getSession()
  if (!session) return false

  const permissions = ROLE_PERMISSIONS[session.role] || []
  return permissions.includes(permission)
}

/**
 * Requires a specific permission or throws an error
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const allowed = await hasPermission(permission)
  if (!allowed) {
    throw new Error("Insufficient permissions")
  }
}

/**
 * Checks if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession()
  return session?.role === "admin"
}
