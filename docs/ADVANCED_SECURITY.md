# Advanced Security Implementation

## Overview
This document describes the advanced security measures implemented to protect against sophisticated attacks.

## Security Features

### 1. CSRF Protection
**What it prevents:** Cross-Site Request Forgery attacks where malicious sites make requests on behalf of authenticated users.

**How it works:**
- CSRF tokens are generated and stored in HTTP-only cookies
- All state-changing requests (POST, PUT, PATCH, DELETE) must include a valid CSRF token in the `x-csrf-token` header
- Tokens are validated using constant-time comparison to prevent timing attacks

**Usage:**
\`\`\`typescript
// Client-side: Include CSRF token in requests
const csrfToken = getCookie('csrf_token')
fetch('/api/profile', {
  method: 'PATCH',
  headers: {
    'x-csrf-token': csrfToken
  }
})
\`\`\`

### 2. Request Signing
**What it prevents:** Request tampering and replay attacks.

**How it works:**
- Critical operations require HMAC-SHA256 signatures
- Signatures include timestamp to prevent replay attacks (5-minute window)
- Server verifies signature matches expected value

**Usage:**
\`\`\`typescript
const timestamp = Date.now()
const signature = signRequest(payload, timestamp)

fetch('/api/trades', {
  method: 'POST',
  headers: {
    'x-request-signature': signature,
    'x-request-timestamp': timestamp.toString()
  },
  body: JSON.stringify(payload)
})
\`\`\`

### 3. Session Fingerprinting
**What it prevents:** Session hijacking and cookie theft.

**How it works:**
- Each session has a unique fingerprint stored in a separate HTTP-only cookie
- Fingerprint hash is stored in the database
- Both session ID and fingerprint must match for authentication

### 4. Role-Based Access Control (RBAC)
**What it prevents:** Privilege escalation and unauthorized access.

**How it works:**
- Users have roles (user, admin)
- Each role has specific permissions
- API routes check permissions before allowing operations

**Usage:**
\`\`\`typescript
import { requirePermission } from '@/lib/security/rbac'

// In API route
await requirePermission('admin:all')
\`\`\`

### 5. Security Headers
**What it prevents:** Various client-side attacks (XSS, clickjacking, MIME sniffing).

**Headers set:**
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Enables XSS filter
- `Content-Security-Policy` - Restricts resource loading
- `Referrer-Policy` - Controls referrer information

## Attack Scenarios Prevented

### 1. Session Fixation
**Attack:** Attacker sets a known session ID for victim
**Prevention:** Sessions are regenerated after login with new fingerprint

### 2. Race Conditions
**Attack:** Multiple simultaneous requests bypass validation
**Prevention:** Rate limiting and database constraints

### 3. Mass Assignment
**Attack:** User sets unauthorized fields (e.g., role: 'admin')
**Prevention:** Explicit field whitelisting in all update operations

### 4. Timing Attacks
**Attack:** Determine valid values based on response time
**Prevention:** Constant-time comparison for all security-sensitive operations

### 5. Replay Attacks
**Attack:** Reuse captured requests to perform unauthorized actions
**Prevention:** Request signatures include timestamps with 5-minute expiry

## Environment Variables Required

Add these to your `.env` file:

\`\`\`bash
# CSRF Protection
CSRF_SECRET=your-random-secret-here

# Request Signing
REQUEST_SIGNING_SECRET=your-random-secret-here
\`\`\`

Generate secrets with:
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

## Monitoring

Check audit logs regularly:
\`\`\`bash
npm run security:audit
\`\`\`

Look for:
- Failed CSRF validations
- Invalid request signatures
- Multiple failed authentication attempts
- Unusual access patterns

## Incident Response

If you detect a security breach:

1. **Immediate Actions:**
   - Rotate all secrets (CSRF_SECRET, REQUEST_SIGNING_SECRET)
   - Invalidate all sessions: `DELETE FROM sessions;`
   - Review audit logs for affected users

2. **Investigation:**
   - Check `request_signatures` table for replay attempts
   - Review `audit_logs` for suspicious activity
   - Analyze rate limit violations

3. **Recovery:**
   - Force all users to re-authenticate
   - Update security measures as needed
   - Document the incident

## Testing Security

Run security checks:
\`\`\`bash
npm run security:check
\`\`\`

This will verify:
- RLS policies are enabled
- Required indexes exist
- Security headers are set
- Rate limiting is working
