// API Integration Types

export interface SlackUser {
  id: string;
  name: string;
  email?: string;
  profile?: {
    email?: string;
    display_name?: string;
    real_name?: string;
  };
}

export interface SlackActivity {
  userId: string;
  date: Date;
  messageCount: number;
  fileCount: number;
  channels: string[];
  isBot: boolean;
}

export interface HarvestUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export interface HarvestTimeEntry {
  id: number;
  user_id: number;
  project_id: number;
  hours: number;
  billable: boolean;
  billable_rate: number;
  amount?: number;
  spent_date: string;
  notes?: string;
}

export interface HarvestProject {
  id: number;
  name: string;
  client_id: number;
  code?: string;
  is_active: boolean;
  budget?: number;
}

export interface HarvestClient {
  id: number;
  name: string;
  currency?: string;
}

export interface AsanaUser {
  gid: string;
  name: string;
  email?: string;
  resource_type: string;
}

export interface AsanaTask {
  gid: string;
  name: string;
  assignee?: {
    gid: string;
    name: string;
  };
  due_on?: string;
  completed: boolean;
  completed_at?: string;
  projects?: Array<{
    gid: string;
    name: string;
  }>;
}

export interface DashboardMetrics {
  totalBillableHours: number;
  totalRevenue: number;
  openTasks: number;
  slackActivityScore: number;
  utilizationRate: number;
  uninvoicedAmount: number;
}

export interface EmployeeMetrics {
  userId: string;
  name: string;
  billableHours: number;
  nonBillableHours: number;
  billableRatio: number;
  completedTasks: number;
  overdueTasks: number;
  slackMessageCount: number;
}

export interface ProjectMetrics {
  projectId: string;
  name: string;
  budget: number;
  spent: number;
  billableHours: number;
  profitability: number;
  taskProgress: number;
  completedTasks: number;
  openTasks: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface SyncStatus {
  entityType: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  lastSyncedAt?: Date;
  nextSyncAt?: Date;
  errorMessage?: string;
}
