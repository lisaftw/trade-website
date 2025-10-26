# Key Rotation Guide

This guide explains how to safely rotate API keys and credentials for your application.

## Why Rotate Keys?

- **Security Best Practice**: Regular rotation limits exposure if keys are compromised
- **Compliance**: Many security standards require periodic key rotation
- **Incident Response**: Rotate immediately if you suspect a key has been exposed

## Rotation Schedule

**Recommended rotation frequency:**
- Supabase Service Role Key: Every 90 days
- MongoDB Credentials: Every 90 days
- Discord OAuth Secret: Every 180 days
- Admin Password: Every 30 days
- Supabase Anon Key: Only if compromised (it's meant to be public)

## Step-by-Step Rotation Process

### 1. Prepare for Rotation

\`\`\`bash
# Create a backup of current environment variables
vercel env pull .env.backup
\`\`\`

### 2. Generate New Keys

#### Supabase Keys:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Click "Generate new key" for the key you want to rotate
5. Copy the new key immediately

#### MongoDB URI:
1. Go to your MongoDB dashboard
2. Create a new database user with the same permissions
3. Generate a new connection string
4. Save the new URI

#### Discord OAuth:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to OAuth2 → General
4. Click "Reset Secret"
5. Copy the new secret immediately

### 3. Update Environment Variables

**In Vercel:**
\`\`\`bash
# Update each key one at a time
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add MONGODB_URI production
vercel env add DISCORD_CLIENT_SECRET production
\`\`\`

**Or via Vercel Dashboard:**
1. Go to your project settings
2. Navigate to Environment Variables
3. Edit each variable
4. Paste the new value
5. Save changes

### 4. Verify New Keys

\`\`\`bash
# Run the verification script
npm run verify:keys
\`\`\`

This script will test all connections and confirm the new keys work.

### 5. Deploy with New Keys

\`\`\`bash
# Trigger a new deployment
vercel --prod
\`\`\`

### 6. Test Thoroughly

**Test these critical flows:**
- [ ] User login via Discord
- [ ] Creating a trade
- [ ] Sending messages
- [ ] Admin login
- [ ] Database queries
- [ ] Real-time subscriptions

### 7. Revoke Old Keys

**Only after confirming everything works:**

#### Supabase:
- Old keys are automatically invalidated when you generate new ones

#### MongoDB:
1. Go to Database Access
2. Delete the old database user

#### Discord:
- Old secret is automatically invalidated when you reset it

## Emergency Rotation

**If you suspect a key has been compromised:**

1. **Immediately rotate the key** (follow steps above)
2. **Check audit logs** for suspicious activity:
   \`\`\`bash
   npm run security:audit
   \`\`\`
3. **Review recent database changes**
4. **Notify your team**
5. **Document the incident**

## Rollback Plan

**If new keys don't work:**

1. Keep old keys active during testing
2. Revert environment variables to old values:
   \`\`\`bash
   # Restore from backup
   vercel env pull .env.backup
   vercel --prod
   \`\`\`
3. Investigate the issue
4. Try rotation again when ready

## Automation (Optional)

You can automate key rotation reminders:

\`\`\`typescript
// Add to your monitoring system
const KEY_ROTATION_SCHEDULE = {
  SUPABASE_SERVICE_ROLE_KEY: 90, // days
  MONGODB_URI: 90,
  DISCORD_CLIENT_SECRET: 180,
  ADMIN_PASSWORD: 30,
}

// Send alerts when keys are due for rotation
\`\`\`

## Security Checklist

Before revoking old keys, verify:
- [ ] All new keys are saved securely
- [ ] Verification script passes all tests
- [ ] Application deployed with new keys
- [ ] All critical features tested and working
- [ ] Team members notified of rotation
- [ ] Audit logs show no errors
- [ ] Backup of old keys stored securely (temporarily)

## Support

If you encounter issues during rotation:
1. Check the verification script output
2. Review application logs in Vercel
3. Check Supabase logs for connection errors
4. Verify environment variables are set correctly
5. Ensure no typos in new keys

## Best Practices

- ✅ Rotate keys during low-traffic periods
- ✅ Test in staging environment first
- ✅ Keep old keys active until new ones are verified
- ✅ Document rotation dates
- ✅ Use a password manager for key storage
- ❌ Never commit keys to git
- ❌ Never share keys via email or chat
- ❌ Never reuse old keys
