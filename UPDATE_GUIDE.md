# Quick Update Guide - VPS Deployment

This guide covers updating your deployed trading website on VPS (45.90.99.130) when you push new changes to GitHub.

---

## Prerequisites

- SSH access to your VPS
- Git repository: https://github.com/lisaftw/trade-website.git
- Website deployed at `/home/deploy/trading-website`

---

## Quick Update Steps

### 1. SSH into Your VPS

\`\`\`bash
ssh deploy@45.90.99.130
\`\`\`

Enter your password when prompted.

### 2. Navigate to Project Directory

\`\`\`bash
cd /home/deploy/trading-website
\`\`\`

### 3. Pull Latest Changes from GitHub

\`\`\`bash
git pull origin main
\`\`\`

If you get merge conflicts, you can force pull:
\`\`\`bash
git fetch origin
git reset --hard origin/main
\`\`\`

### 4. Install New Dependencies (if any)

\`\`\`bash
npm install
\`\`\`

This will install any new packages that were added to `package.json`.

### 5. Rebuild the Application

\`\`\`bash
npm run build
\`\`\`

This compiles the Next.js application for production.

### 6. Restart the Website

\`\`\`bash
pm2 restart trading-website
\`\`\`

To restart both website and Discord bot:
\`\`\`bash
pm2 restart all
\`\`\`

### 7. Verify the Update

Check if the processes are running:
\`\`\`bash
pm2 status
\`\`\`

View logs to ensure no errors:
\`\`\`bash
pm2 logs trading-website --lines 50
\`\`\`

Test the website in your browser to confirm changes are live.

---

## One-Line Update Command

For quick updates without database changes:

\`\`\`bash
cd /home/deploy/trading-website && git pull origin main && npm install && npm run build && pm2 restart trading-website
\`\`\`

---

## Update Discord Bot Only

If you only changed bot code:

\`\`\`bash
cd /home/deploy/trading-website
git pull origin main
npm install
pm2 restart discord-bot
pm2 logs discord-bot
\`\`\`

---

## Update with Database Changes

If your update includes database schema changes:

### 1. Pull Changes

\`\`\`bash
cd /home/deploy/trading-website
git pull origin main
npm install
\`\`\`

### 2. Run Migration Scripts

If you added new SQL scripts in `/scripts`:

\`\`\`bash
# Run the specific script
node scripts/your-migration-script.js
\`\`\`

Or use the migration command if available:
\`\`\`bash
npm run migrate
\`\`\`

### 3. Rebuild and Restart

\`\`\`bash
npm run build
pm2 restart all
\`\`\`

---

## Update Environment Variables

If your update requires new environment variables:

### 1. Edit Environment File

\`\`\`bash
nano .env.local
\`\`\`

Add or update the required variables, then save (Ctrl+X, Y, Enter).

### 2. Restart Services

\`\`\`bash
pm2 restart all
\`\`\`

---

## Rollback to Previous Version

If something breaks, you can rollback:

### 1. Find Previous Commit

\`\`\`bash
git log --oneline -10
\`\`\`

### 2. Rollback to Specific Commit

\`\`\`bash
git reset --hard <commit-hash>
npm install
npm run build
pm2 restart all
\`\`\`

### 3. Or Rollback One Commit

\`\`\`bash
git reset --hard HEAD~1
npm install
npm run build
pm2 restart all
\`\`\`

---

## Clear Cache After Update

If changes don't appear, clear the Nginx cache:

\`\`\`bash
sudo rm -rf /var/cache/nginx/trading/*
sudo systemctl restart nginx
\`\`\`

Clear PM2 logs if they're getting large:
\`\`\`bash
pm2 flush
\`\`\`

---

## Troubleshooting Common Issues

### Issue: Website Not Loading After Update

**Solution:**
\`\`\`bash
# Check PM2 status
pm2 status

# View error logs
pm2 logs trading-website --err

# Try restarting
pm2 restart trading-website

# If still not working, rebuild
npm run build
pm2 restart trading-website
\`\`\`

### Issue: Build Fails

**Solution:**
\`\`\`bash
# Clear node_modules and reinstall
rm -rf node_modules
rm -rf .next
npm install
npm run build
\`\`\`

### Issue: Database Connection Errors

**Solution:**
\`\`\`bash
# Verify environment variables
cat .env.local | grep DATABASE_URL
cat .env.local | grep SUPABASE

# Test database connection
npm run migrate:prepare-db
\`\`\`

### Issue: Discord Bot Not Responding

**Solution:**
\`\`\`bash
# Check bot status
pm2 logs discord-bot

# Restart bot
pm2 restart discord-bot

# Redeploy bot commands
npm run bot:deploy
pm2 restart discord-bot
\`\`\`

### Issue: Port Already in Use

**Solution:**
\`\`\`bash
# Kill process on port 3000
sudo kill -9 $(sudo lsof -t -i:3000)

# Restart PM2
pm2 restart trading-website
\`\`\`

### Issue: Permission Errors

**Solution:**
\`\`\`bash
# Fix ownership
sudo chown -R deploy:deploy /home/deploy/trading-website

# Fix permissions
chmod -R 755 /home/deploy/trading-website
\`\`\`

---

## Useful PM2 Commands

### View Status
\`\`\`bash
pm2 status
\`\`\`

### View Logs (Real-time)
\`\`\`bash
pm2 logs                    # All logs
pm2 logs trading-website    # Website only
pm2 logs discord-bot        # Bot only
\`\`\`

### View Last 50 Lines
\`\`\`bash
pm2 logs trading-website --lines 50
\`\`\`

### Monitor Resources
\`\`\`bash
pm2 monit
\`\`\`

### Restart Services
\`\`\`bash
pm2 restart all                 # Restart everything
pm2 restart trading-website     # Website only
pm2 restart discord-bot         # Bot only
\`\`\`

### Stop Services
\`\`\`bash
pm2 stop all
pm2 stop trading-website
\`\`\`

### View Process Info
\`\`\`bash
pm2 show trading-website
\`\`\`

---

## Automation: Setup Auto-Deploy (Optional)

You can set up a webhook or cron job to auto-pull and deploy changes:

### Create Update Script

\`\`\`bash
nano /home/deploy/update-website.sh
\`\`\`

Add:
\`\`\`bash
#!/bin/bash
cd /home/deploy/trading-website
git pull origin main
npm install
npm run build
pm2 restart trading-website
echo "Website updated at $(date)" >> /home/deploy/logs/update.log
\`\`\`

Make executable:
\`\`\`bash
chmod +x /home/deploy/update-website.sh
\`\`\`

Run manually:
\`\`\`bash
/home/deploy/update-website.sh
\`\`\`

### Setup as Cron Job (Auto-update every hour)

\`\`\`bash
crontab -e
\`\`\`

Add:
\`\`\`bash
0 * * * * /home/deploy/update-website.sh
\`\`\`

---

## Best Practices

1. **Always test locally first** - Test changes on your local machine before deploying
2. **Backup before major updates** - Run backup script before big changes
3. **Check logs after deployment** - Always verify logs for errors
4. **Update during low traffic** - Deploy updates during off-peak hours
5. **Keep dependencies updated** - Run `npm audit fix` regularly
6. **Monitor resource usage** - Use `pm2 monit` and `htop` to check performance
7. **Document breaking changes** - Keep track of environment variable changes

---

## Quick Reference Card

| Task | Command |
|------|---------|
| SSH to VPS | `ssh deploy@45.90.99.130` |
| Navigate to project | `cd /home/deploy/trading-website` |
| Pull changes | `git pull origin main` |
| Install deps | `npm install` |
| Build | `npm run build` |
| Restart website | `pm2 restart trading-website` |
| View logs | `pm2 logs trading-website` |
| Check status | `pm2 status` |
| Monitor | `pm2 monit` |

---

## Support

If you encounter issues:

1. Check PM2 logs: `pm2 logs trading-website --lines 100`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check system resources: `htop`
4. Review recent changes: `git log -5`
5. Check environment variables: `cat .env.local`

---

**Happy deploying!** Your updates should now be live on your VPS.
