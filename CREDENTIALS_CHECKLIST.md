# Credentials Checklist

Use this to keep track of all the credentials you collect. **Store securely!**

## Phase 1: Collect Credentials

### ✅ PostgreSQL Database
- [ ] Connection String: `postgresql://...`
  - Provider: (Vercel Postgres / Supabase / Local)
  - Save to: `DATABASE_URL`

### ✅ Clerk Authentication
- [ ] Publishable Key: `pk_...`
  - Save to: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] Secret Key: `sk_...`
  - Save to: `CLERK_SECRET_KEY`

### ✅ Slack Bot
- [ ] Bot Token: `xoxb-...`
  - Save to: `SLACK_BOT_TOKEN`
- [ ] Signing Secret: (optional)
  - Save to: `SLACK_SIGNING_SECRET`

### ✅ Harvest API
- [ ] Account ID: `12345...`
  - Save to: `HARVEST_ACCOUNT_ID`
- [ ] Access Token: (long string)
  - Save to: `HARVEST_ACCESS_TOKEN`

### ✅ Asana API
- [ ] Personal Access Token: (long string)
  - Save to: `ASANA_ACCESS_TOKEN`

### ✅ Security
- [ ] CRON_SECRET: (random 32+ character string)
  - Save to: `CRON_SECRET`
  - Generate: `openssl rand -base64 32`

---

## Phase 2: Create .env.local

Location: `/Users/juha/MCP-Elementor/agency-dashboard/.env.local`

```
DATABASE_URL=your-postgres-connection-string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=optional
HARVEST_ACCOUNT_ID=123456
HARVEST_ACCESS_TOKEN=...
ASANA_ACCESS_TOKEN=...
CRON_SECRET=your-random-string
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Phase 3: Test Locally

Commands to run:
```bash
cd /Users/juha/MCP-Elementor/agency-dashboard
npx prisma migrate dev
npm run dev
# Visit http://localhost:3000
```

---

## Phase 4: Deploy to Vercel

Steps:
1. Create Vercel account (if needed)
2. Run: `vercel`
3. Add same env vars to Vercel dashboard
4. Run: `vercel --prod`
5. Check Cron Jobs tab

---

## Phase 5: Verify Production

Test URLs:
- Dashboard: `https://your-project.vercel.app/dashboard`
- Metrics API: `https://your-project.vercel.app/api/metrics/dashboard`

---

## Status Tracker

- [ ] Phase 1: Credentials collected
- [ ] Phase 2: .env.local created
- [ ] Phase 3: Local testing complete
- [ ] Phase 4: Deployed to Vercel
- [ ] Phase 5: Production verified

