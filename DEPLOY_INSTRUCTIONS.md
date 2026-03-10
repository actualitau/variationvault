# VariationVault - Production Deployment

**Status:** ✅ Code pushed to GitHub (actualitau/variationvault)  
**Platform:** AWS RDS PostgreSQL (existing infrastructure)  
**Recommendation:** Deploy main app to Railway or Vercel

## Quick Deployment (Railway - Recommended)

### Step 1: Railway Account
1. Go to https://railway.app
2. Sign up with GitHub OAuth (fastest option)
3. Click "New Project" → "Deploy from GitHub repo"

### Step 2: Configure Railway
1. Select repository: `actualitau/variationvault`
2. Railway auto-detects: Next.js application
3. **Add PostgreSQL Service:**
   - Click "+" → "New Service" → "Database" → "PostgreSQL"
   - Wait for provisioning (~2 minutes)
   - Database credentials automatically injected

### Step 3: Connect to Your Database
Instead of Railway's database, connect to your existing AWS RDS:

**Railway Variables:**
```
DATABASE_URL=postgresql://[username]:[password]@[host]:5432/variationvault
NEXT_PUBLIC_APP_URL=https://[railway-project-url].app.railway.app
```

**Find your AWS RDS credentials:**
1. Go to AWS Console → RDS
2. Find "variation-vault-db" instance
3. Click "Connect" → Copy connection string
4. Example: `postgresql://user:pass@variation-vault-db.cluster-xxx.us-east-1.rds.amazonaws.com:5432/variationvault`

### Step 4: Deploy
```
# Deploy to Railway
railway up
railway deploy
```

**Railway will:**
- Install dependencies
- Build Next.js app
- Deploy to production
- Provide live URL automatically

---

## Alternative: Vercel (Simpler for Next.js)

1. Go to https://vercel.com/new/import
2. Connect via GitHub OAuth
3. Select: `actualitau/variationvault`
4. Click "Deploy"
5. Add PostgreSQL database (Vercel offers free tier)
6. Set environment variables:
   ```
   DATABASE_URL=postgresql://[user]:[pass]@[vercel-db-host]:5432/[db-name]
   ```

**Estimated time:** 5-10 minutes
**Cost:** Free tier available
**Auto-deploy:** Yes (on every git push)

---

## Vercel Deployment Commands (if OAuth issues)

```bash
cd /home/david/.openclaw/workspace/variationvault

# Build locally to test
npm install
npm run build

# Preview build
npm run start
# Visit http://localhost:3000
```

### Manual Vercel CLI Deployment (bypasses OAuth)

If OAuth flow doesn't work:
```bash
# Get Vercel account ID (from Vercel dashboard URL)
VERCEL_ACCOUNT_ID=your-account-id

# Deploy with account flag
vercel --yes --prod --confirm --no-verify
```

---

## Environment Variables for Both Platforms

**Required:**
```
DATABASE_URL=<postgresql_connection_string>
NEXT_PUBLIC_APP_URL=<production_url>
```

**Optional (if configured in production):**
- `AWS_REGION=us-east-1`
- `AWS_ACCESS_KEY_ID=<key>`
- `AWS_SECRET_ACCESS_KEY=<secret>`
- `UPLOAD_DIR=/uploads`

---

## Post-Deployment Checklist

1. ✅ Visit production URL
2. ✅ Test file upload functionality
3. ✅ Verify cost calculation works
4. ✅ Test all main features
5. ✅ Set up monitoring (optional)

## Troubleshooting

**Build failures:**
- Check Node.js version in `package.json` (recommended: 18.x+)
- Verify all dependencies are in `package.json`
- Check `vercel.json` or `next.config.js`

**Database connection issues:**
- Verify DATABASE_URL is correct and escaped
- Check RDS security groups allow Railway/Vercel IPs
- Test connection locally with `npm run db:migrate`

**OAuth login issues:**
- Try Railway instead (similar simplicity)
- Use digitalocean.com App Platform
- Consider Heroku for quick deployment

---

**Current Progress:**
- Code ready ✅
- GitHub repo created ✅
- Next.js build tests passed ✅
- Awaiting platform deployment ⏳
