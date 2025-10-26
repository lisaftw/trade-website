# Security Incident Response Guide

## If Someone Sends You an API Key

### 1. Identify the Key Type

**Supabase Anonymous Key:**
- Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Contains `"role": "anon"` in the JWT payload
- **Risk Level: LOW** - This key is meant to be public
- **Action: No immediate action needed** - Your RLS policies protect your data

**Supabase Service Role Key:**
- Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Contains `"role": "service_role"` in the JWT payload
- **Risk Level: CRITICAL** - This key bypasses all security
- **Action: ROTATE IMMEDIATELY** - See rotation steps below

**MongoDB Connection String:**
- Format: `mongodb+srv://username:password@cluster...`
- **Risk Level: CRITICAL** - Full database access
- **Action: ROTATE IMMEDIATELY** - Change password in MongoDB Atlas

**Discord Client Secret:**
- Format: Random alphanumeric string
- **Risk Level: HIGH** - Can impersonate your app
- **Action: ROTATE IMMEDIATELY** - Regenerate in Discord Developer Portal

### 2. Immediate Response Steps

#### For Anonymous Keys (Low Risk):
1. Run security check: `npm run security:check`
2. Verify RLS policies are active
3. Check audit logs: `npm run security:audit`
4. Monitor for unusual activity

#### For Service Role Keys (Critical):
1. **Immediately rotate the key** in Supabase dashboard
2. Update environment variables in Vercel
3. Redeploy your application
4. Check audit logs for unauthorized access
5. Review all recent database changes
6. Consider resetting user sessions

#### For MongoDB URI (Critical):
1. **Change password** in MongoDB Atlas
2. Update `MONGODB_URI` in environment variables
3. Redeploy application and Discord bot
4. Check database logs for unauthorized access
5. Review recent database modifications

#### For Discord Client Secret (High):
1. **Regenerate secret** in Discord Developer Portal
2. Update `DISCORD_CLIENT_SECRET` in environment variables
3. Redeploy application
4. Notify users they may need to re-authenticate

### 3. Investigation Checklist

- [ ] Check audit logs for suspicious activity
- [ ] Review recent database changes
- [ ] Check for unauthorized user accounts
- [ ] Review API rate limit logs
- [ ] Check for data exfiltration attempts
- [ ] Review recent deployments
- [ ] Check for modified environment variables
- [ ] Review access logs in Vercel/hosting platform

### 4. Prevention Measures

**Already Implemented:**
- ✅ Environment variables properly secured
- ✅ Service role keys only used server-side
- ✅ Rate limiting on API routes
- ✅ Audit logging for security events
- ✅ Row Level Security (RLS) on database
- ✅ Authentication checks on protected routes

**Additional Recommendations:**
- Enable 2FA on all admin accounts
- Regularly rotate service role keys (quarterly)
- Monitor audit logs weekly
- Set up alerts for critical security events
- Keep dependencies updated
- Regular security audits

### 5. Key Rotation Schedule

**Recommended Rotation Frequency:**
- Supabase Service Role Key: Every 90 days
- MongoDB Password: Every 90 days
- Discord Client Secret: Every 180 days
- Admin Passwords: Every 60 days

**How to Rotate:**

1. **Supabase Service Role Key:**
   - Go to Supabase Dashboard → Settings → API
   - Click "Reset service role key"
   - Update `SUPABASE_SERVICE_ROLE_KEY` in Vercel
   - Redeploy

2. **MongoDB Password:**
   - Go to MongoDB Atlas → Database Access
   - Edit user → Change password
   - Update `MONGODB_URI` in Vercel
   - Redeploy

3. **Discord Client Secret:**
   - Go to Discord Developer Portal → Your App → OAuth2
   - Click "Reset Secret"
   - Update `DISCORD_CLIENT_SECRET` in Vercel
   - Redeploy

### 6. Contact Information

**If you suspect a security breach:**
1. Run: `npm run security:audit`
2. Document all findings
3. Rotate compromised credentials immediately
4. Review this guide for next steps

**Emergency Contacts:**
- Supabase Support: https://supabase.com/support
- MongoDB Support: https://www.mongodb.com/support
- Discord Support: https://support.discord.com

## Remember

**The anonymous key being public is NORMAL and SAFE.** Your database is protected by Row Level Security policies, not by hiding the anonymous key. Focus on maintaining strong RLS policies and monitoring audit logs for suspicious activity.
