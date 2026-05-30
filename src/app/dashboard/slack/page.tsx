'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { KPICard } from '@/components/dashboard/KPICard';
import { useState, useEffect } from 'react';

export default function SlackAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(7);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/sync/slack', { method: 'POST' });
        if (response.ok) {
          setData(await response.json());
        }
      } catch (error) {
        console.error('Error fetching Slack data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [daysBack]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Slack Analytics
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Communication and engagement metrics
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="mb-8">
        <DateRangePicker onDaysChange={setDaysBack} defaultDays={daysBack} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            Syncing Slack data...
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPICard
              title="Total Messages"
              value={data?.metrics?.totalMessages || 0}
              unit="messages"
            />
            <KPICard
              title="Files Shared"
              value={data?.metrics?.totalFiles || 0}
              unit="files"
            />
            <KPICard
              title="Active Users"
              value={data?.metrics?.activeUsers || 0}
              unit="users"
            />
          </div>

          {/* Charts */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              Activity Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Total Messages (Last 7 days)</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data?.metrics?.totalMessages || 0}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Files Shared</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data?.metrics?.totalFiles || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Active Contributors</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data?.metrics?.activeUsers || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              ✓ Real data synced from Slack API (last 7 days, top 10 channels)
            </p>
          </div>
        </>
      )}
    </div>
  );
}
