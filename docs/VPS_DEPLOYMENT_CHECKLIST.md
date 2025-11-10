# VPS Deployment Checklist

Complete guide for deploying your trading website to VPS.

## ✅ Phase 1: VPS Setup (COMPLETED)

- [x] Connected to VPS via SSH
- [x] Updated system packages
- [x] Installed Node.js 20
- [x] Installed PostgreSQL
- [x] Created database and user
- [x] Optimized PostgreSQL for high traffic
- [x] Installed Nginx
- [x] Installed PM2
- [x] Configured firewall (UFW)
- [x] Optimized system limits
- [x] Created deploy user
- [x] Cloned repository

## 📋 Phase 2: Data Migration (CURRENT)

- [ ] Review MIGRATION_GUIDE.md
- [ ] Set up environment variables with MongoDB URI
- [ ] Run migration preparation script
- [ ] Execute migration from MongoDB to PostgreSQL
- [ ] Verify migrated data
- [ ] Test database queries

## 🚀 Phase 3: Application Deployment (NEXT)

- [ ] Install dependencies (`npm install`)
- [ ] Build application (`npm run build`)
- [ ] Start with PM2
- [ ] Configure PM2 auto-restart
- [ ] Set up Nginx reverse proxy
- [ ] Test application on VPS IP

## 🔒 Phase 4: Domain & SSL (OPTIONAL)

- [ ] Point domain to VPS IP
- [ ] Update Nginx config with domain
- [ ] Install SSL certificate with Certbot
- [ ] Update Discord OAuth redirect URI
- [ ] Test HTTPS

## 📊 Phase 5: Monitoring & Optimization

- [ ] Set up PM2 monitoring
- [ ] Configure log rotation
- [ ] Set up automated backups
- [ ] Monitor resource usage
- [ ] Optimize based on traffic patterns

---

## Current Status

**You are here:** Phase 2 - Data Migration

**Next steps:**
1. Follow MIGRATION_GUIDE.md to migrate your data
2. Verify the migration was successful
3. Continue to Phase 3 for application deployment
