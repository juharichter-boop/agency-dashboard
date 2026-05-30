'use client';

import { useEffect, useState } from 'react';
import { KPICard } from '@/components/dashboard/KPICard';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { formatCurrency } from '@/lib/utils/calculations';

interface DashboardMetrics {
  metrics: {
    totalBillableHours: number;
    totalRevenue: number;
    openTasks: number;
    slackActivityScore: number;
    utilizationRate: number;
  };
  period: {
    from: string;
    to: string;
    days: number;
  };
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [daysBack, setDaysBack] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/metrics/dashboard?daysBack=${daysBack}`
        );
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [daysBack]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Overview
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Agency operations at a glance
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="mb-8">
        <DateRangePicker onDaysChange={setDaysBack} defaultDays={daysBack} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            Loading metrics...
          </p>
        </div>
      ) : metrics ? (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Total Revenue"
              value={formatCurrency(metrics.metrics.totalRevenue)}
              unit="Last 30 days"
            />
            <KPICard
              title="Billable Hours"
              value={metrics.metrics.totalBillableHours.toFixed(1)}
              unit="hours"
            />
            <KPICard
              title="Utilization Rate"
              value={`${metrics.metrics.utilizationRate}%`}
            />
            <KPICard
              title="Open Tasks"
              value={metrics.metrics.openTasks}
              unit="tasks"
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Team Activity
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Slack Messages
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {metrics.metrics.slackActivityScore}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (metrics.metrics.slackActivityScore / 1000) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Quick Links
              </h2>
              <div className="space-y-2">
                <a
                  href="/dashboard/slack"
                  className="block text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  → Slack Analytics
                </a>
                <a
                  href="/dashboard/harvest"
                  className="block text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  → Harvest Metrics
                </a>
                <a
                  href="/dashboard/asana"
                  className="block text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  → Task Progress
                </a>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">
            Failed to load metrics. Please try again.
          </p>
        </div>
      )}
    </div>
  );
}
