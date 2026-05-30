'use client';

import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { KPICard } from '@/components/dashboard/KPICard';
import { useState, useEffect } from 'react';

export default function AsanaAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/sync/asana', { method: 'POST' });
        if (response.ok) {
          setData(await response.json());
        }
      } catch (error) {
        console.error('Error fetching Asana data:', error);
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
          Task Progress
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Task completion and project progress
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="mb-8">
        <DateRangePicker onDaysChange={setDaysBack} defaultDays={daysBack} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            Syncing Asana data...
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPICard
              title="Total Tasks"
              value={data?.synced || 0}
              unit="tasks"
            />
            <KPICard
              title="Completed"
              value={data?.completed || 0}
              unit="tasks"
            />
            <KPICard
              title="Open Tasks"
              value={data?.open || 0}
              unit="tasks"
            />
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              Task Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Total Tasks</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {data?.synced || 0}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Completed</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {data?.completed || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Open</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data?.open || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {data?.synced > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-8">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                Completion Rate
              </h2>
              <div className="mb-2 flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {((data.completed / data.synced) * 100).toFixed(0)}% Complete
                </span>
              </div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${(data.completed / data.synced) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              ✓ Real data synced from Asana API
            </p>
          </div>
        </>
      )}
    </div>
  );
}
