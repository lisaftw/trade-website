import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function viewAuditLogs() {
  console.log("📋 Fetching recent audit logs...\n")

  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("❌ Error fetching audit logs:", error.message)
    console.log("\n💡 Make sure you have run the audit logs SQL script:")
    console.log("   npm run sql:020_create_audit_logs")
    return
  }

  if (!logs || logs.length === 0) {
    console.log("✅ No audit logs found. Your system is clean!")
    return
  }

  console.log(`Found ${logs.length} recent events:\n`)

  // Group by severity
  const critical = logs.filter((l) => l.severity === "critical")
  const high = logs.filter((l) => l.severity === "high")
  const medium = logs.filter((l) => l.severity === "medium")
  const low = logs.filter((l) => l.severity === "low")

  if (critical.length > 0) {
    console.log("🚨 CRITICAL EVENTS:")
    critical.forEach((log) => {
      console.log(`   ${log.created_at} - ${log.event_type}`)
      console.log(`   User: ${log.user_id || "Anonymous"}`)
      console.log(`   IP: ${log.ip_address}`)
      console.log(`   Details: ${JSON.stringify(log.metadata)}\n`)
    })
  }

  if (high.length > 0) {
    console.log("⚠️  HIGH SEVERITY EVENTS:")
    high.forEach((log) => {
      console.log(`   ${log.created_at} - ${log.event_type}`)
      console.log(`   User: ${log.user_id || "Anonymous"}`)
      console.log(`   IP: ${log.ip_address}\n`)
    })
  }

  if (medium.length > 0) {
    console.log("📊 MEDIUM SEVERITY EVENTS:")
    medium.slice(0, 10).forEach((log) => {
      console.log(`   ${log.created_at} - ${log.event_type} (${log.user_id || "Anonymous"})`)
    })
    if (medium.length > 10) {
      console.log(`   ... and ${medium.length - 10} more\n`)
    }
  }

  console.log("\n📈 Summary:")
  console.log(`   Critical: ${critical.length}`)
  console.log(`   High: ${high.length}`)
  console.log(`   Medium: ${medium.length}`)
  console.log(`   Low: ${low.length}`)

  // Check for suspicious patterns
  console.log("\n🔍 Suspicious Activity Check:")

  const failedLogins = logs.filter((l) => l.event_type === "auth.login.failed")
  if (failedLogins.length > 5) {
    console.log(`   ⚠️  ${failedLogins.length} failed login attempts detected`)
  }

  const rateLimitHits = logs.filter((l) => l.event_type === "rate_limit.exceeded")
  if (rateLimitHits.length > 0) {
    console.log(`   ⚠️  ${rateLimitHits.length} rate limit violations`)
  }

  const unauthorizedAccess = logs.filter((l) => l.event_type === "auth.unauthorized")
  if (unauthorizedAccess.length > 0) {
    console.log(`   ⚠️  ${unauthorizedAccess.length} unauthorized access attempts`)
  }

  if (failedLogins.length <= 5 && rateLimitHits.length === 0 && unauthorizedAccess.length === 0) {
    console.log("   ✅ No suspicious patterns detected")
  }
}

viewAuditLogs().catch(console.error)
