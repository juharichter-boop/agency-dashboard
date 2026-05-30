# Agency Operations Dashboard - Implementation Guide

## ✅ Completed Phase 1: Foundation

### Project Setup
- [x] Next.js 14 project initialized with TypeScript
- [x] Tailwind CSS v4 configured
- [x] shadcn/ui initialized with component library
- [x] All dependencies installed (Prisma, Recharts, Tremor, Clerk, etc.)

### Database Architecture
- [x] Prisma schema designed with all models:
  - User (with roles: ADMIN, TEAM_LEAD, EMPLOYEE)
  - SlackMetric, HarvestEntry, AsanaTask
  - Project, Client
  - SyncLog for tracking integrations
- [x] Enums for status tracking (INVOICED, UNINVOICED, OPEN, COMPLETED, etc.)
- [x] Relationships and indexes optimized

### Type System
- [x] TypeScript interfaces for all API responses:
  - SlackUser, SlackActivity
  - HarvestUser, HarvestTimeEntry, HarvestProject, HarvestClient
  - AsanaUser, AsanaTask
  - Dashboard metrics and KPI types

### API Integration Services
- [x] **Slack API Client** (`src/lib/api/slack.ts`)
  - getUsers() - Fetch all users
  - getUserConversations() - Get user's channels
  - getConversationHistory() - Fetch messages
  - getUserActivity() - Calculate user metrics
  - getChannelActivity() - Channel analytics
  - getTeamMetrics() - Team-wide metrics

- [x] **Harvest API Client** (`src/lib/api/harvest.ts`)
  - getUsers() - Fetch all users
  - getTimeEntries() - Fetch billable/non-billable hours
  - getProjects() - Fetch projects
  - getClients() - Fetch clients
  - getUserMetrics() - User-level analytics
  - getProjectMetrics() - Project profitability
  - getTeamMetrics() - Team utilization

- [x] **Asana API Client** (`src/lib/api/asana.ts`)
  - getMe() - Current user info
  - getTeamUsers() - Team members
  - getProjectTasks() - Project tasks
  - getUserTasks() - User's tasks
  - getTasksByProject() - Task filtering
  - getUserMetrics() - Completion rates, overdue tasks
  - getProjectMetrics() - Project progress
  - getTeamMetrics() - Team task metrics

### Data Synchronization
- [x] **Slack Sync Service** (`src/lib/sync/slack.ts`)
  - Incremental sync with date range support
  - User creation/mapping
  - Message count and file tracking
  - Bot message filtering
  - Sync status logging

- [x] **Harvest Sync Service** (`src/lib/sync/harvest.ts`)
  - User, project, and client synchronization
  - Time entry tracking with billability status
  - Revenue calculation
  - Sync error handling

- [x] **Asana Sync Service** (`src/lib/sync/asana.ts`)
  - User task synchronization
  - Completion tracking
  - Overdue task identification
  - Sync status logging

### Utilities
- [x] Database client setup (`src/lib/db.ts`)
- [x] Calculation utilities (`src/lib/utils/calculations.ts`)
  - Billable percentage calculation
  - Currency formatting
  - Hours formatting
  - Date range calculations
  - Trend analysis
  - Top N analysis
  - Utilization rates

### Configuration
- [x] Environment variables template (`.env.example`)

---

## 📋 Phase 2: Backend API Routes (Next)

### Authentication & Authorization
- [ ] Clerk integration setup
  - User sign-up/login pages
  - Role assignment middleware
  - Protected route wrapper
  - User context hook

### API Routes
- [ ] `/api/auth/` - Authentication endpoints
- [ ] `/api/metrics/` - Dashboard metrics endpoints
  - GET /api/metrics/dashboard - Global KPIs
  - GET /api/metrics/slack - Slack analytics
  - GET /api/metrics/harvest - Harvest analytics
  - GET /api/metrics/asana - Asana analytics
  - GET /api/metrics/employees/[id] - Employee drilldown

- [ ] `/api/sync/` - Synchronization endpoints
  - POST /api/sync/slack - Trigger Slack sync
  - POST /api/sync/harvest - Trigger Harvest sync
  - POST /api/sync/asana - Trigger Asana sync
  - GET /api/sync/status - Sync status check

- [ ] `/api/data/` - Data retrieval endpoints
  - GET /api/data/employees - All employees with metrics
  - GET /api/data/projects - Project list
  - GET /api/data/clients - Client list
  - GET /api/data/analytics/trends - Historical trends

---

## 🎨 Phase 3: Frontend Components & UI

### Core Dashboard Components
- [ ] Layout wrapper with sidebar
- [ ] KPI card component (reusable)
- [ ] Metric card component (with trends)
- [ ] Date range picker
- [ ] Filter panel

### Chart Components
- [ ] Revenue chart (Recharts)
- [ ] Utilization heatmap (Recharts)
- [ ] Task completion burndown (Recharts)
- [ ] Employee comparison bar chart
- [ ] Activity trend line chart
- [ ] Billable ratio donut chart

### Dashboard Pages
- [ ] `/dashboard` - Overview dashboard
  - Global KPI cards
  - Key metrics
  - Recent activity
  
- [ ] `/dashboard/slack` - Slack analytics
  - Team activity metrics
  - User rankings
  - Channel analysis
  - Heatmaps by day/time
  
- [ ] `/dashboard/harvest` - Harvest analytics
  - Billable hours tracking
  - Revenue dashboard
  - Utilization rates
  - Project profitability
  
- [ ] `/dashboard/asana` - Asana analytics
  - Task completion metrics
  - Burndown charts
  - Overdue task tracking
  - Team productivity comparison
  
- [ ] `/dashboard/employees` - Employee metrics
  - Employee list with individual metrics
  - Drilldown to employee detail page
  - Performance comparisons
  
- [ ] `/dashboard/projects` - Project dashboard
  - Project list and status
  - Budget vs. actual
  - Timeline and milestones
  - Team allocation

---

## 🔄 Phase 4: Advanced Features

### Data Export
- [ ] CSV export functionality
- [ ] PDF report generation
- [ ] Scheduled report emails

### Monitoring & Alerts
- [ ] Sync job monitoring
- [ ] Error notifications
- [ ] Performance metrics
- [ ] Alert thresholds for utilization

### Advanced Analytics
- [ ] Trend analysis and forecasting
- [ ] Correlation analysis
- [ ] Anomaly detection
- [ ] Custom dashboard building

---

## 🚀 Phase 5: Deployment

### Preparation
- [ ] Environment variables setup
- [ ] Database migrations
- [ ] Vercel cron job setup
- [ ] Redis caching (optional Upstash)

### Testing
- [ ] API integration testing
- [ ] Data sync verification
- [ ] UI/UX testing across devices
- [ ] Performance optimization

### Deployment
- [ ] Deploy to Vercel
- [ ] Configure scheduled sync jobs
- [ ] Set up monitoring and logging
- [ ] Database backups

---

## 📚 Tech Stack Summary

| Component | Technology |
|-----------|------------|
| Frontend Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Library | shadcn/ui |
| Charts | Recharts, Tremor |
| Database | PostgreSQL (Vercel Postgres) |
| ORM | Prisma 5.x |
| Authentication | Clerk |
| API Clients | Axios |
| Deployment | Vercel |
| Caching | Redis (Upstash) - Optional |

---

## 🔐 Security & Privacy Considerations

1. **PII Protection**
   - Only store Slack message counts, not content
   - Hash sensitive identifiers
   - Encrypt credentials in environment variables

2. **RBAC Implementation**
   - Employees can only access their own data
   - Team leads see team metrics
   - Admins see all data

3. **API Rate Limiting**
   - Implement request queuing
   - Cache responses
   - Respect API rate limits:
     - Harvest: 100 req/15sec
     - Asana: 150 req/min
     - Slack: Tiered per endpoint

4. **Database Security**
   - Use connection pooling
   - Implement row-level security
   - Regular backups
   - Access audit logs

---

## 📊 Key Metrics Tracked

### Slack Analytics
- Messages per employee per day/week/month
- File uploads
- Channel activity
- Activity heatmaps by time

### Harvest Analytics
- Billable hours
- Non-billable hours
- Revenue (billable amount)
- Utilization rate
- Project profitability
- Client profitability

### Asana Analytics
- Completed tasks
- Open tasks
- Overdue tasks
- Completion rate
- Average completion time
- Project progress

---

## 🛠️ Next Steps

1. **Implement Clerk Authentication**
   - Set up Clerk app
   - Create login/signup pages
   - Add middleware for protected routes

2. **Build API Routes**
   - Create metric calculation endpoints
   - Implement sync triggers
   - Add data retrieval endpoints

3. **Create Dashboard Components**
   - Build KPI cards
   - Implement chart components
   - Create layout structure

4. **Develop Dashboard Pages**
   - Main overview dashboard
   - Slack analytics page
   - Harvest analytics page
   - Asana analytics page

5. **Testing & Optimization**
   - Test all integrations
   - Optimize queries and caching
   - Performance tuning
   - Security audit

---

## 📞 Support & Resources

- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs
- Slack API: https://api.slack.com
- Harvest API: https://help.getharvest.com/api-v2
- Asana API: https://developers.asana.com
- shadcn/ui: https://ui.shadcn.com
