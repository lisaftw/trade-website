# Security Guidelines

## Overview
This document outlines the security measures implemented in the application to protect sensitive data, prevent unauthorized access, and ensure secure API operations.

## Environment Variables

### Required Variables
All sensitive credentials MUST be stored as environment variables and NEVER committed to version control.

**Required Environment Variables:**
- `POSTGRES_URL` - PostgreSQL database connection string
- `MONGODB_URI` - MongoDB connection string
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key (server-side only)
- `DISCORD_CLIENT_SECRET` - Discord OAuth secret
- `ADMIN_PASSWORD` - Admin panel password

### Best Practices
1. **Never use `NEXT_PUBLIC_` prefix for sensitive keys** - These are exposed to the client
2. **Rotate credentials regularly** - Change passwords and API keys every 90 days
3. **Use strong, unique values** - Minimum 32 characters for secrets
4. **Validate on startup** - Run `validateEnvironment()` to check configuration

## API Security

### Authentication
All protected API routes use session-based authentication:

\`\`\`typescript
import { requireAuth } from "@/lib/security/api-auth"

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return authResult.response
  }
  
  const { session } = authResult
  // Proceed with authenticated request
}
\`\`\`

### Rate Limiting
Rate limits prevent API abuse:

- **Authentication endpoints**: 5 requests per 15 minutes
- **Write operations**: 30 requests per minute
- **Read operations**: 100 requests per minute
- **Admin operations**: 10 requests per minute

\`\`\`typescript
import { applyRateLimit, RATE_LIMITS } from "@/lib/security/api-auth"

const rateLimitResult = applyRateLimit(request, RATE_LIMITS.write, session.discordId)
if (!rateLimitResult.success) {
  return rateLimitResult.response
}
\`\`\`

### Input Validation
Always validate and sanitize user input:

\`\`\`typescript
import { sanitizeInput, validateRequestBody } from "@/lib/security/api-auth"

const body = await request.json()
const sanitized = {
  ...body,
  notes: sanitizeInput(body.notes),
}
\`\`\`

### Authorization
Check resource ownership before modifications:

\`\`\`typescript
import { requireOwnership } from "@/lib/security/api-auth"

const ownershipResult = requireOwnership(session, resource.discord_id)
if (!ownershipResult.success) {
  return ownershipResult.response
}
\`\`\`

## Audit Logging

All security-relevant events are logged for monitoring:

\`\`\`typescript
import { logAuditEvent, getRequestMetadata } from "@/lib/security/audit-logger"

await logAuditEvent({
  type: "data_modification",
  userId: session.discordId,
  ...getRequestMetadata(request),
  resource: "trades",
  action: "delete",
  severity: "medium",
})
\`\`\`

### Monitored Events
- Authentication attempts (success/failure)
- Admin actions
- Rate limit violations
- Unauthorized access attempts
- Data modifications
- Suspicious activity patterns

## Database Security

### Row Level Security (RLS)
Supabase RLS policies enforce data access controls at the database level.

### Service Role Key Usage
The service role key bypasses RLS and should ONLY be used:
- In server-side API routes
- For admin operations
- Never in client-side code

### Connection Security
- Use connection pooling for PostgreSQL
- Enable SSL/TLS for all database connections
- Limit database user permissions

## Session Management

### Secure Cookies
Sessions use HttpOnly, Secure, SameSite cookies:

\`\`\`typescript
cookies().set(SESSION_COOKIE_NAME, sessionId, {
  httpOnly: true,  // Prevents XSS attacks
  secure: process.env.NODE_ENV === "production",  // HTTPS only
  sameSite: "lax",  // CSRF protection
  path: "/",
  maxAge: 30 * 24 * 60 * 60,  // 30 days
})
\`\`\`

### Token Refresh
Discord OAuth tokens are automatically refreshed before expiration.

### Session Cleanup
Expired sessions are automatically deleted to prevent buildup.

## API Key Rotation

### Rotation Schedule
- **Production keys**: Rotate every 90 days
- **Development keys**: Rotate every 180 days
- **Compromised keys**: Rotate immediately

### Rotation Process
1. Generate new credentials in service dashboard
2. Update environment variables in Vercel
3. Deploy application
4. Verify functionality
5. Revoke old credentials
6. Log rotation event

## Monitoring & Alerts

### What to Monitor
- Failed authentication attempts (>5 per IP per hour)
- Rate limit violations (>10 per IP per hour)
- Unusual API access patterns
- Database query errors
- Session anomalies

### Alert Thresholds
- **Critical**: Unauthorized admin access attempts
- **High**: Multiple failed auth attempts from same IP
- **Medium**: Rate limit violations
- **Low**: Normal security events

## Incident Response

### If API Keys Are Compromised
1. **Immediately** rotate all affected credentials
2. Review audit logs for unauthorized access
3. Check for data breaches
4. Notify affected users if necessary
5. Document incident and response

### If Suspicious Activity Detected
1. Review audit logs for patterns
2. Block offending IPs if necessary
3. Increase monitoring temporarily
4. Investigate root cause
5. Implement additional controls if needed

## Security Checklist

### Before Deployment
- [ ] All environment variables configured
- [ ] No secrets in source code
- [ ] Rate limiting enabled
- [ ] Audit logging active
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] Authentication on protected routes
- [ ] RLS policies enabled

### Regular Maintenance
- [ ] Review audit logs weekly
- [ ] Rotate credentials quarterly
- [ ] Update dependencies monthly
- [ ] Security audit annually
- [ ] Penetration testing annually

## Contact

For security concerns or to report vulnerabilities, contact the development team immediately.
