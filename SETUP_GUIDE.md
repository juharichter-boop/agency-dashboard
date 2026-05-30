# Step-by-Step Setup Guide

## Phase 1: External Services Setup (30-45 minutes)

### Step 1: PostgreSQL Database Setup

**Option A: Vercel Postgres (Recommended)**
1. Go to https://vercel.com/dashboard
2. Select your project (or create new one)
3. Go to Storage tab → Create new → Postgres
4. Copy connection string (looks like: `postgresql://...`)
5. Save it - you'll need it soon

**Option B: Supabase (Alternative)**
1. Go to https://supabase.com
2. Create new project
3. Wait for database to initialize
4. Go to Settings → Database → URI
5. Copy connection string

**Option C: Local PostgreSQL (Development)**
```bash
# Install PostgreSQL if needed
# macOS:
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
psql -U postgres
CREATE DATABASE agency_dashboard;
\q

# Connection string:
postgresql://postgres:password@localhost:5432/agency_dashboard
```

---

### Step 2: Clerk Authentication Setup

1. Go to https://dashboard.clerk.com
2. Click "Create Application" or sign in
3. Choose your preferred auth method (email, Google, etc.)
4. **Get your API keys:**
   - Go to API Keys
   - Copy `Publishable Key` (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
   - Copy `Secret Key` (CLERK_SECRET_KEY)
5. Configure settings:
   - Go to Instances → Development
   - Add your domain (http://localhost:3000 for dev)
   - For production: your-domain.vercel.app

---

### Step 3: Slack Bot Token

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. App Name: "Agency Dashboard"
4. Select your Slack workspace
5. **Enable Socket Mode:**
   - Left sidebar: Socket Mode → Enable
6. **Add OAuth Scopes:**
   - Left sidebar: OAuth & Permissions → Scopes
   - Add these Bot Token Scopes:
     - `channels:read`
     - `groups:read` (for private channels)
     - `im:read` (for DMs)
     - `mpim:read` (for group DMs)
     - `users:read`
     - `chat:read`
     - `files:read`
7. **Get Bot Token:**
   - Top of OAuth & Permissions page
   - Copy "Bot User OAuth Token" (starts with `xoxb-`)
   - This is: `SLACK_BOT_TOKEN`
8. **Subscribe to Events:**
   - Left sidebar: Event Subscriptions
   - Enable: Toggle ON
   - Request URL: `https://your-domain.com/api/webhooks/slack`
   - Subscribe to bot events:
     - `message.channels`
     - `message.groups`
     - `message.im`
     - `message.mpim`

---

### Step 4: Harvest API Credentials

1. Go to https://getharvest.com and sign in
2. **Get Account ID:**
   - Go to https://id.getharvest.com/developers
   - Copy your Account ID
   - This is: `HARVEST_ACCOUNT_ID`
3. **Create Personal Access Token:**
   - Still on developers page
   - Click "Create Personal Access Token"
   - Name it: "Agency Dashboard"
   - Copy the token
   - This is: `HARVEST_ACCESS_TOKEN`

**Note:** Harvest API Documentation:
- API Docs: https://help.getharvest.com/api-v2
- Rate limit: 100 requests per 15 seconds

---

### Step 5: Asana Personal Access Token

1. Go to https://app.asana.com
2. Click your profile icon (top right)
3. Select "Settings"
4. Go to "Apps and Integrations"
5. Click "Personal Access Tokens"
6. Click "Generate new token"
7. Name: "Agency Dashboard"
8. Copy the token
9. This is: `ASANA_ACCESS_TOKEN`

**Note:** Asana API Documentation:
- API Docs: https://developers.asana.com
- Rate limit: 150 requests per minute

---

### Step 6: Generate CRON_SECRET

This is a random string for securing your scheduled sync jobs.

```bash
# Generate a secure random string
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output - this is: `CRON_SECRET`

---

## Phase 2: Local Configuration (10 minutes)

### Create .env.local file

In `/Users/juha/MCP-Elementor/agency-dashboard/`, create/edit `.env.local`:

```
# Database
DATABASE_URL="postgresql://user:password@host:5432/agency_dashboard"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Slack API
SLACK_BOT_TOKEN="xoxb-..."
SLACK_SIGNING_SECRET="your-signing-secret"

# Harvest API
HARVEST_ACCOUNT_ID="123456"
HARVEST_ACCESS_TOKEN="your-token"

# Asana API
ASANA_ACCESS_TOKEN="your-token"

# Security
CRON_SECRET="your-generated-secret"

# API URL
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Initialize Database

```bash
cd /Users/juha/MCP-Elementor/agency-dashboard

# Create tables
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Verify connection
npx prisma db execute --stdin < <(echo "SELECT 1")
```

---

## Phase 3: Local Testing (15 minutes)

### Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### Test Authentication
1. Click "Sign In"
2. Create test account with Clerk
3. Should redirect to `/dashboard`

### Test API Endpoints

```bash
# Test dashboard metrics
curl http://localhost:3000/api/metrics/dashboard?daysBack=7

# Test Slack metrics
curl http://localhost:3000/api/metrics/slack?daysBack=7

# Test sync status
curl http://localhost:3000/api/sync/status
```

### Verify Database
```bash
npx prisma studio

# Opens visual database browser at http://localhost:5555
```

---

## Phase 4: Vercel Deployment (20-30 minutes)

### Step 1: Create Vercel Project

```bash
cd /Users/juha/MCP-Elementor/agency-dashboard

# Link to Vercel
vercel

# Follow prompts to create project
```

### Step 2: Set Environment Variables

In Vercel Dashboard:
1. Select your project
2. Settings → Environment Variables
3. Add all variables from `.env.local`:

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
SLACK_BOT_TOKEN=xoxb-...
HARVEST_ACCOUNT_ID=123456
HARVEST_ACCESS_TOKEN=...
ASANA_ACCESS_TOKEN=...
CRON_SECRET=your-secret
NEXT_PUBLIC_API_URL=https://your-project.vercel.app
```

### Step 3: Deploy

```bash
# Build verification
npm run build

# Deploy to production
vercel --prod
```

### Step 4: Run Database Migrations on Production

```bash
# Set production database URL
DATABASE_URL="postgresql://prod-connection-string" npx prisma migrate deploy
```

### Step 5: Verify Cron Jobs

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Cron Jobs" tab
4. Should see 3 jobs:
   - `/api/cron/sync-slack` (every 4 hours)
   - `/api/cron/sync-harvest` (every 6 hours)
   - `/api/cron/sync-asana` (every 2 hours)

---

## Phase 5: Post-Deployment Testing (15 minutes)

### Test Production URLs

```bash
# Replace with your Vercel URL
PROD_URL="https://your-project.vercel.app"

# Test authentication
curl $PROD_URL/api/auth/status

# Test metrics
curl "$PROD_URL/api/metrics/dashboard?daysBack=7"

# Check sync status
curl "$PROD_URL/api/sync/status"
```

### Monitor First Sync

1. Open your production dashboard
2. Check `/api/sync/status` endpoint
3. Watch logs in Vercel:
   - Settings → Function Logs

### Verify Data in Database

```bash
npx prisma studio --data-proxy

# Or via CLI:
npx prisma db execute --stdin
```

---

## Troubleshooting

### Database Connection Failed
```
Error: connect ECONNREFUSED
```
**Fix:**
- Verify DATABASE_URL format
- Check PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

### Clerk Authentication Not Working
```
Error: Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```
**Fix:**
- Verify keys in .env.local
- Restart dev server after changes
- Clear browser cache

### Slack/Harvest/Asana API Errors
```
Error: 401 Unauthorized
```
**Fix:**
- Verify token hasn't expired
- Check scopes are correct
- Regenerate tokens if needed

### Cron Jobs Not Running
**Fix:**
- Verify vercel.json is correct
- Check CRON_SECRET is set
- View logs: Vercel Dashboard → Cron Jobs

---

## Security Checklist

Before going to production:
- [ ] All API credentials set as environment variables
- [ ] DATABASE_URL uses strong password
- [ ] CRON_SECRET is random and secure (32+ characters)
- [ ] Slack bot has minimal required scopes
- [ ] Clerk MFA enabled (optional but recommended)
- [ ] SSL/TLS enabled (automatic on Vercel)

---

## Next Steps After Deployment

1. **Monitor Initial Syncs** (24 hours)
   - Check sync logs
   - Verify data is appearing in database
   - Monitor for errors

2. **Test with Real Data** (1-2 weeks)
   - Invite team members
   - Verify metrics accuracy
   - Check performance

3. **Optional Enhancements**
   - Add Sentry for error tracking
   - Set up email notifications
   - Implement custom dashboards
   - Add CSV/PDF exports

---

## Support Resources

- Slack API Docs: https://api.slack.com
- Harvest API: https://help.getharvest.com/api-v2
- Asana API: https://developers.asana.com
- Clerk Docs: https://clerk.com/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- Vercel Docs: https://vercel.com/docs

