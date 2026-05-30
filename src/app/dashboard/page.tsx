'use client';

import { useEffect, useState } from 'react';
import { KPICard } from '@/components/dashboard/KPICard';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { formatCurrency } from '@/lib/utils/calculations';

export default function DashboardPage() {
  const [harvestData, setHarvestData] = useState<any>(null);
  const [slackData, setSlackData] = useState<any>(null);
  const [asanaData, setAsanaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(30);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch real data from sync endpoints
        const [harvestRes, slackRes, asanaRes] = await Promise.all([
          fetch('/api/sync/harvest', { method: 'POST' }),
          fetch('/api/sync/slack', { method: 'POST' }),
          fetch('/api/sync/asana', { method: 'POST' }),
        ]);

        if (harvestRes.ok) {
          setHarvestData(await harvestRes.json());
        }
        if (slackRes.ok) {
          setSlackData(await slackRes.json());
        }
        if (asanaRes.ok) {
          setAsanaData(await asanaRes.json());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
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
            Syncing real data from your APIs...
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Total Revenue"
              value={formatCurrency(harvestData?.totalRevenue || 0)}
              unit="Last 90 days"
            />
            <KPICard
              title="Billable Hours"
              value={((harvestData?.billableHours || 0).toFixed(1))}
              unit="hours"
            />
            <KPICard
              title="Open Tasks"
              value={asanaData?.open || 0}
              unit="tasks"
            />
            <KPICard
              title="Slack Activity"
              value={slackData?.metrics?.totalMessages || 0}
              unit="messages"
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Harvest Metrics
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Total Hours
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {(harvestData?.totalHours || 0).toFixed(1)} hrs
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Billable Hours
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {(harvestData?.billableHours || 0).toFixed(1)} hrs
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Revenue
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(harvestData?.totalRevenue || 0)}
                    </span>
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
                  → Slack Analytics ({slackData?.metrics?.totalMessages || 0} messages)
                </a>
                <a
                  href="/dashboard/harvest"
                  className="block text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  → Harvest Metrics ({formatCurrency(harvestData?.totalRevenue || 0)} revenue)
                </a>
                <a
                  href="/dashboard/asana"
                  className="block text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  → Task Progress ({asanaData?.open || 0} open tasks)
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
