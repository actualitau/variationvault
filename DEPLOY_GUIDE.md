# VariationVault Deployment Guide

## Current Status
✅ GitHub repository created: https://github.com/actualitau/variationvault  
✅ Code ready for deployment

## Recommended: Deploy to Vercel (Fastest)

### Option 1: Direct Vercel Connection (Simplest - 5 minutes)

1. **Go to Vercel:** https://vercel.com/new/import
2. **Import from GitHub:** Click "Continue with GitHub"
3. **Select Repository:** Choose "actualitau/variationvault"
4. **Configure:**
   - Framework Preset: Next.js
   - Root Directory: ./app
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **Database:** Create a new PostgreSQL database via Vercel UI
6. **Add Environment Variables:**
   - `DATABASE_URL` (from PostgreSQL)
   - `NEXT_PUBLIC_APP_URL` = `https://variationvault.vercel.app`
7. **Deploy** - Vercel will auto-deploy on every push

### Option 2: Git-Based Auto-Deploy (Recommended for Production)

Connect GitHub repo to Vercel Dashboard:
1. Sign in to Vercel Dashboard
2. Click "Add New Project"
3. Choose "actualitau/variationvault"
4. Configure build settings (auto-detected as Next.js)
5. Add database and environment variables
6. Vercel will auto-deploy on every push to main branch

## Alternative Deployments

### DigitalOcean App Platform
- Connect GitHub repository
- Select Next.js framework
- Add PostgreSQL database
- Configure build settings
- Free tier available

### Railway
- Connect GitHub repository
- Auto-detects Next.js
- Built-in PostgreSQL
- One-click deployment

## Database Setup

For production with PostgreSQL:

**Vercel PostgreSQL:**
1. Go to Vercel Dashboard → Database
2. Click "Add Database"
3. Select PostgreSQL (free tier: 256MB storage)
4. Copy the connection string
5. Add as `DATABASE_URL` environment variable

**Environment Variables Required:**
- `DATABASE_URL` (from database)
- `NEXT_PUBLIC_APP_URL` = production URL
- Any other vars from `.env.example`

## Current Configuration

The app is configured for:
- PostgreSQL database
- Next.js 14 with App Router
- Shadcn UI components
- File upload handling

## Next Steps

1. **Complete Vercel OAuth**: Sign in to Vercel via the browser link provided
2. **Connect GitHub repository**: Import `actualitau/variationvault`
3. **Set up PostgreSQL**: Create free database via Vercel UI
4. **Configure env vars**: Add `DATABASE_URL` and other required vars
5. **Deploy**: Click deploy and get live URL

---

**Estimated Time: 10-15 minutes (manual authentication required)**
**Alternative: Use Railway for faster one-click deployment**
