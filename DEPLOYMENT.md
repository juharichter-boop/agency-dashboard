# Deployment Guide

## Production Deployment Checklist

### 1. Pre-Deployment

- [ ] All environment variables configured
- [ ] Database migrations tested locally
- [ ] API integrations tested with real credentials
- [ ] Cron jobs configured in `vercel.json`
- [ ] Security audit completed

### 2. Database Setup

```bash
# Create PostgreSQL database on Vercel Postgres or Supabase
createdb agency_dashboard_prod

# Run migrations
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 3. Vercel Configuration

**vercel.json** configuration:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "env": {
    "DATABASE_URL": "@db_url",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "@clerk_pub_key",
    "CLERK_SECRET_KEY": "@clerk_secret_key",
    "SLACK_BOT_TOKEN": "@slack_token",
    "HARVEST_ACCOUNT_ID": "@harvest_id",
    "HARVEST_ACCESS_TOKEN": "@harvest_token",
    "ASANA_ACCESS_TOKEN": "@asana_token",
    "CRON_SECRET": "@cron_secret"
  }
}
```

### 4. Environment Variables

Set in Vercel dashboard:

```
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
SLACK_BOT_TOKEN=xoxb-...
HARVEST_ACCOUNT_ID=123456
HARVEST_ACCESS_TOKEN=...
ASANA_ACCESS_TOKEN=...
CRON_SECRET=generate-random-string-min-32-chars
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### 5. Deploy

```bash
# Deploy to staging
vercel --yes

# Deploy to production
vercel --prod --yes
```

### 6. Post-Deployment

- [ ] Verify all API endpoints responding
- [ ] Check Clerk authentication working
- [ ] Test cron jobs in Vercel dashboard
- [ ] Monitor initial sync logs
- [ ] Set up error tracking (optional: Sentry)
- [ ] Configure CDN/caching rules

## Scaling Considerations

### Database

For large datasets (>1M rows):

1. **Enable connection pooling** with PgBouncer
2. **Add read replicas** for analytics queries
3. **Archive old data** periodically
4. **Implement table partitioning** by date

### Caching

For high traffic (>1000 req/min):

1. **Add Redis** (Upstash) for response caching
2. **Enable edge caching** with Vercel
3. **Implement database query caching**
4. **Rate limit** per user/IP

### Monitoring

Set up monitoring:

```bash
# Vercel monitoring (built-in)
# Check: https://vercel.com/dashboard/[project]/analytics

# Optional: Add Sentry for error tracking
npm install @sentry/nextjs

# Optional: Add New Relic for performance monitoring
```

## Maintenance

### Weekly

- [ ] Check sync job status
- [ ] Review error logs
- [ ] Verify data freshness

### Monthly

- [ ] Review API usage and rate limits
- [ ] Archive old sync logs
- [ ] Update dependencies: `npm update`
- [ ] Audit security: `npm audit`

### Quarterly

- [ ] Database optimization review
- [ ] Performance profiling
- [ ] Disaster recovery drill

## Troubleshooting Deployment

### Cron Jobs Not Running

1. Check `vercel.json` syntax
2. Verify `CRON_SECRET` is set
3. Check cron endpoint logs: `vercel logs [url]/api/cron/sync-*`
4. Ensure routes are not in `/pages` (must be in `/app`)

### Database Connection Errors

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection string format
# Should be: postgresql://user:password@host:port/database
```

### API Credentials Not Found

1. Verify secrets are in Vercel dashboard
2. Restart deployment after adding secrets
3. Check secret names match exactly

### Sync Jobs Failing

1. Check API rate limits
2. Verify external API credentials are still valid
3. Check database has correct schema
4. Review detailed logs: `vercel logs [url]`

## Rollback Procedure

If deployment fails:

```bash
# Vercel automatically keeps previous deployments
# To rollback:
vercel rollback

# Or deploy a specific git commit:
vercel --commit-sha [sha]
```

## Disaster Recovery

### Database Backup

```bash
# Backup production database
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

### Environment Variables

- [ ] Store in Vercel Secrets Manager
- [ ] Keep local copy in secure location
- [ ] Rotate API tokens quarterly

### Data Recovery

Sync logs stored in database allow re-running syncs:

```sql
SELECT * FROM SyncLog WHERE status = 'FAILED' AND createdAt > NOW() - INTERVAL '24 hours';
```

## Performance Tuning

### Database Indices

```sql
CREATE INDEX idx_harvest_entries_user_date ON HarvestEntry(userId, date);
CREATE INDEX idx_slack_metrics_user_date ON SlackMetric(userId, date);
CREATE INDEX idx_asana_tasks_user_status ON AsanaTask(userId, status);
```

### Query Optimization

Enable query analysis:

```sql
EXPLAIN ANALYZE SELECT * FROM SlackMetric WHERE date > NOW() - INTERVAL '30 days';
```

### Connection Pooling

Configure in `DATABASE_URL`:

```
postgresql://user:password@host/database?sslmode=require&pgbouncer=true
```

## Security Hardening

### 1. API Rate Limiting

Implement in middleware:

```typescript
// Included in middleware.ts via Clerk
```

### 2. Database Encryption

- PostgreSQL supports SSL connections
- Data at rest encrypted by default on most providers
- Use `sslmode=require` in connection string

### 3. Secret Rotation

Rotate quarterly:
- Slack Bot Token
- Harvest Access Token
- Asana Access Token
- CRON_SECRET

### 4. Audit Logging

Track sensitive operations:

```typescript
// Log all data exports and user access
console.log(`User ${userId} accessed ${resource} at ${timestamp}`);
```
