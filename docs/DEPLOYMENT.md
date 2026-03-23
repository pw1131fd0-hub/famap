# FamMap Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying FamMap to production environments. The application uses a modern cloud-native deployment architecture with Vercel (Frontend), Railway/Render (Backend), and managed PostgreSQL.

## Prerequisites

### Required Accounts
- ✓ GitHub account (with repository access)
- ✓ Vercel account (recommended for frontend)
- ✓ Railway or Render account (for backend)
- ✓ Supabase or managed PostgreSQL provider
- ✓ Domain registrar (optional, for custom domain)

### Required Tools
- ✓ Git CLI
- ✓ Node.js 18+ (for development)
- ✓ Python 3.10+ (for backend)
- ✓ Docker (optional, for local testing)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Users (Browser)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   ┌────▼─────────────┐    ┌─────▼──────────────┐
   │ Vercel CDN       │    │ Vercel Functions   │
   │ (Frontend PWA)   │    │ (Optional APIs)    │
   │ - React App      │    │                    │
   │ - Static Assets  │    └─────────────────────┘
   │ - Caching        │
   └────┬─────────────┘
        │
        │ HTTPS
        │
   ┌────▼──────────────────┐
   │ Railway/Render        │
   │ (Backend API)         │
   │ - FastAPI Service     │
   │ - Environment Config  │
   └────┬──────────────────┘
        │
        │ Private Network
        │
   ┌────▼──────────────────────┐
   │ Supabase PostgreSQL        │
   │ (Database)                 │
   │ - Locations Table          │
   │ - Users Table              │
   │ - Reviews/Favorites Tables │
   │ - PostGIS Extension        │
   └────────────────────────────┘
```

## 1. Frontend Deployment (Vercel)

### 1.1 Connect GitHub Repository

**Step 1: Link Vercel to GitHub**
```
1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Search for your FamMap repository
4. Click "Import"
```

**Step 2: Configure Project Settings**
```
Project Name: famap
Framework: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Environment Variables: (see 1.2 below)
```

### 1.2 Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
# API Configuration
VITE_API_URL=https://api.famap.com
VITE_MAP_TILE_URL=https://tiles.openstreetmap.org

# Optional: Analytics
VITE_SENTRY_DSN=https://your-sentry-url

# Optional: Feature Flags
VITE_ENABLE_DARK_MODE=true
```

### 1.3 Deploy

**Automatic (Recommended):**
- ✓ Every push to `main` branch triggers automatic build
- ✓ Preview deployments for pull requests
- ✓ Automatic rollback on failed builds

**Manual:**
```
1. Vercel Dashboard → Deployments
2. Click "Redeploy" on any previous deployment
3. Confirm deployment
```

### 1.4 Custom Domain (Optional)

```
1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain (e.g., famap.com)
3. Update DNS records with provider:
   - A record: 76.76.19.0 (Vercel IP)
   - CNAME record: cname.vercel-dns.com
4. Wait for DNS propagation (5-30 minutes)
```

### 1.5 SSL/HTTPS Certificate

- ✓ Automatic via Let's Encrypt
- ✓ Auto-renews every 60 days
- ✓ No manual configuration needed

### 1.6 Vercel Monitoring

**Access Logs:**
```
Vercel Dashboard → Deployments → Click Deployment → Logs
```

**Performance Analytics:**
```
Vercel Dashboard → Analytics (shows Web Vitals, response times)
```

## 2. Backend Deployment (Railway)

### 2.1 Prepare Environment

**Create `.env.production` file:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# CORS
ALLOWED_ORIGINS=https://famap.vercel.app,https://famap.com

# API Keys
SECRET_KEY=your-secret-key-here

# Logging
LOG_LEVEL=INFO
```

### 2.2 Create Railway Project

**Option A: Via Railway Dashboard**
```
1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Connect GitHub account
5. Select famap repository
6. Select `server` directory as root
```

**Option B: Via Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway init
railway link  # Link to existing project
railway up    # Deploy
```

### 2.3 Configure Environment Variables

In Railway Dashboard → Project → Variables:

```
DATABASE_URL=postgresql://...
ALLOWED_ORIGINS=https://famap.vercel.app
SECRET_KEY=<generate-random-string>
CORS_ENABLED=true
LOG_LEVEL=INFO
```

### 2.4 Deploy Backend

```bash
# From project root
cd server
git add .
git commit -m "chore: deploy to production"
git push origin main
```

Railway auto-deploys on push to main branch.

### 2.5 Verify Deployment

```bash
# Check API is running
curl -X GET https://your-api.railway.app/docs

# Test specific endpoint
curl -X GET "https://your-api.railway.app/api/locations?lat=25.01&lng=121.56&radius=5000"
```

## 3. Database Setup (Supabase/PostgreSQL)

### 3.1 Create Supabase Project

**Step 1: Create Account**
```
1. Go to https://supabase.com
2. Sign up with GitHub
3. Create new project
4. Save connection string
```

**Step 2: Get Connection String**
```
Supabase Dashboard → Project → Settings → Database → Connection String
Format: postgresql://user:password@host:port/dbname
```

### 3.2 Create Database Schema

**Option A: Via Supabase SQL Editor**
```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create locations table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_zh TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_zh TEXT,
    description_en TEXT,
    category VARCHAR(50) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    address_zh TEXT,
    address_en TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index
CREATE INDEX idx_locations_geom ON locations USING GIST(geom);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create favorites table
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, location_id)
);

-- Create reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create facilities table
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id),
    type VARCHAR(50) NOT NULL,
    count INTEGER DEFAULT 1,
    UNIQUE(location_id, type)
);
```

**Option B: Via Migration Script**
```bash
# Using Alembic (SQLAlchemy migrations)
alembic upgrade head
```

### 3.3 Load Sample Data

```sql
-- Insert sample locations (Taiwan)
INSERT INTO locations (name_zh, name_en, category, geom, address_zh)
VALUES (
    '台北兒童新樂園',
    'Taipei Children Amusement Park',
    'park',
    ST_GeomFromText('POINT(121.5649 25.0635)', 4326),
    '台北市士林區基河路3號'
);

-- Verify data loaded
SELECT COUNT(*) FROM locations;
SELECT ST_AsText(geom) FROM locations LIMIT 1;
```

### 3.4 Connection String in Backend

**Update `.env.production`:**
```
DATABASE_URL=postgresql://postgres.xxxxx:password@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

## 4. Environment Configuration Checklist

### Frontend (Vercel)
- [ ] `VITE_API_URL` points to production API
- [ ] `VITE_API_URL` is HTTPS
- [ ] CORS allowed in backend for frontend domain

### Backend (Railway)
- [ ] `DATABASE_URL` configured and tested
- [ ] `ALLOWED_ORIGINS` includes frontend domain
- [ ] `SECRET_KEY` is random, 32+ characters
- [ ] All environment variables set before deploy

### Database (Supabase)
- [ ] PostGIS extension enabled
- [ ] All tables created with indexes
- [ ] Sample data loaded
- [ ] Connection string works from backend
- [ ] Backups configured (automatic in Supabase)

## 5. Monitoring & Logging

### 5.1 Vercel Monitoring

**Real-time Metrics:**
```
Dashboard → Analytics
- Response times
- Error rates
- Request volume
- Geographic distribution
```

**Error Tracking:**
```
Dashboard → Monitor
- Failed deployments
- Build errors
- Runtime errors
```

### 5.2 Railway Monitoring

**Logs:**
```
Railway Dashboard → Project → Logs
- Application output
- Error messages
- Request traces
```

**Metrics:**
```
Railway Dashboard → Project → Metrics
- CPU usage
- Memory usage
- Network I/O
- Uptime
```

### 5.3 Sentry Integration (Recommended)

**Setup Sentry:**
```bash
# In client
npm install @sentry/react

# In server
pip install sentry-sdk
```

**Configuration:**
```typescript
// client/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: "production",
  tracesSampleRate: 1.0,
});
```

## 6. Database Backups

### Supabase Automatic Backups
- ✓ Daily backups retained for 7 days
- ✓ Weekly backups retained for 4 weeks
- ✓ Automatic restoration available

### Manual Backup (Recommended Weekly)
```bash
# Backup database
pg_dump \
  postgresql://user:pass@host/dbname \
  -Fc > famap_backup_$(date +%Y%m%d).dump

# Restore from backup
pg_restore \
  -d dbname \
  -U user \
  famap_backup_20240101.dump
```

## 7. Deployment Checklist

### Pre-Deployment
- [ ] All tests passing locally
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] API endpoints tested manually
- [ ] Security audit passed
- [ ] Performance metrics acceptable

### Deployment
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Database connection verified
- [ ] API accessible from frontend
- [ ] Smoke tests run successfully
- [ ] Error tracking configured
- [ ] Monitoring alerts configured

### Post-Deployment
- [ ] Verify all features work
- [ ] Test on mobile devices
- [ ] Check analytics/logs for errors
- [ ] Monitor performance metrics
- [ ] Verify backups are running

## 8. Rollback Procedure

**If deployment fails:**

### Vercel Rollback
```
1. Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click "Redeploy"
4. Confirm deployment (takes ~1-2 minutes)
```

### Railway Rollback
```
1. Railway Dashboard → Deployments
2. Find previous successful deployment
3. Click "Redeploy"
4. Confirm deployment (takes ~2-5 minutes)
```

### Database Rollback
```bash
# If schema change caused issues
pg_restore -d dbname -U user -c famap_backup_20240101.dump
```

## 9. DNS & Domain Configuration

### Update DNS Records

**For famap.com (example domain):**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.19.0 | 3600 |
| CNAME | www | cname.vercel-dns.com | 3600 |
| MX | @ | mail.famap.com | 3600 |
| TXT | @ | v=spf1 include:_spf.google.com ~all | 3600 |

### SSL Certificate
- ✓ Automatic via Vercel (Let's Encrypt)
- ✓ Free and auto-renews

## 10. Production Readiness Checklist

### Infrastructure
- [ ] Frontend CDN configured (Vercel)
- [ ] Backend auto-scaling enabled (Railway)
- [ ] Database backups automated
- [ ] SSL/HTTPS enabled
- [ ] Custom domain configured

### Security
- [ ] Environment variables not hardcoded
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set (CSP, X-Frame-Options, etc.)
- [ ] Database credentials secured

### Monitoring
- [ ] Error tracking setup (Sentry)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Log aggregation enabled
- [ ] Alerts configured for failures

### Operations
- [ ] Documentation updated
- [ ] Team access configured
- [ ] Deployment procedure documented
- [ ] Incident response plan created
- [ ] Regular backup tests scheduled

## 11. Maintenance & Updates

### Weekly Tasks
- ✓ Review error logs
- ✓ Check performance metrics
- ✓ Verify backups completed

### Monthly Tasks
- ✓ Update dependencies
- ✓ Run security audit (npm audit)
- ✓ Review database size
- ✓ Backup size assessment

### Quarterly Tasks
- ✓ Performance optimization review
- ✓ Security audit (3rd party)
- ✓ Capacity planning
- ✓ Disaster recovery drill

## 12. Support & Troubleshooting

### Common Issues

**Frontend won't load:**
```
1. Check Vercel build logs
2. Verify environment variables
3. Check browser console for errors
4. Try hard refresh (Ctrl+Shift+R)
```

**API returns 502 Bad Gateway:**
```
1. Check Railway logs
2. Verify database connection
3. Check API server status
4. Review recent deployments
```

**Database connection timeout:**
```
1. Verify DATABASE_URL correct
2. Check network connectivity
3. Ensure PostGIS extension enabled
4. Verify SSL mode in connection string
```

### Support Contacts
- **Vercel Support**: https://vercel.com/support
- **Railway Support**: https://railway.app/support
- **Supabase Support**: https://supabase.com/support
- **GitHub Support**: https://github.com/support

## 13. Deployment Workflow (GitHub Actions)

**Recommended CI/CD Setup:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: vercel/action@v28
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railway/action@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

---

**Last Updated**: 2026-03-23
**Status**: ✅ Ready for production deployment
**Next Review**: Before major version releases
