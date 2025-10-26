/**
 * Audit Logging System
 * Tracks security-relevant events for monitoring and compliance
 */

import { createServiceClient } from "@/lib/supabase/service"

export type AuditEventType =
  | "auth_login"
  | "auth_logout"
  | "auth_failed"
  | "admin_login"
  | "admin_action"
  | "api_key_access"
  | "rate_limit_exceeded"
  | "unauthorized_access"
  | "data_access"
  | "data_modification"
  | "suspicious_activity"

export type AuditEvent = {
  type: AuditEventType
  userId?: string
  ipAddress?: string
  userAgent?: string
  resource?: string
  action?: string
  metadata?: Record<string, unknown>
  severity: "low" | "medium" | "high" | "critical"
}

/**
 * Logs security-relevant events to the database
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    const supabase = await createServiceClient()

    await supabase.from("audit_logs").insert({
      event_type: event.type,
      user_id: event.userId || null,
      ip_address: event.ipAddress || null,
      user_agent: event.userAgent || null,
      resource: event.resource || null,
      action: event.action || null,
      metadata: event.metadata || null,
      severity: event.severity,
      created_at: new Date().toISOString(),
    })

    // For critical events, also log to console for immediate visibility
    if (event.severity === "critical") {
      console.error("CRITICAL SECURITY EVENT:", event)
    }
  } catch (error) {
    // Never let audit logging failures break the application
    console.error("Failed to log audit event:", error)
  }
}

/**
 * Extracts request metadata for audit logging
 */
export function getRequestMetadata(request: Request): {
  ipAddress: string
  userAgent: string
} {
  const forwarded = request.headers.get("x-forwarded-for")
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"

  return { ipAddress, userAgent }
}
