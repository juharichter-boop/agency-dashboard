'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { KPICard } from '@/components/dashboard/KPICard';

interface SlackMetrics {
  userMetrics: Array<{
    name: string;
    totalMessages: number;
    totalFiles: number;
    avgMessagesPerDay: number;
  }>;
  heatmapData: Record<string, number>;
  summary: {
    totalMessages: number;
    totalFiles: number;
    activeUsers: number;
  };
}

export default function SlackAnalyticsPage() {
  const [metrics, setMetrics] = useState<SlackMetrics | null>(null);
  const [daysBack, setDaysBack] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/metrics/slack?daysBack=${daysBack}`
        );
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching Slack metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [daysBack]);

  const chartData = metrics?.userMetrics?.slice(0, 10) || [];

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
            Loading metrics...
          </p>
        </div>
      ) : metrics ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPICard
              title="Total Messages"
              value={metrics.summary.totalMessages}
              unit="messages"
            />
            <KPICard
              title="Files Shared"
              value={metrics.summary.totalFiles}
              unit="files"
            />
            <KPICard
              title="Active Users"
              value={metrics.summary.activeUsers}
              unit="users"
            />
          </div>

          {/* Charts */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              Top 10 Most Active Users
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalMessages" fill="#3b82f6" name="Messages" />
                  <Bar dataKey="totalFiles" fill="#10b981" name="Files" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                No activity data available
              </p>
            )}
          </div>

          {/* Activity by Day */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              Activity by Day of Week
            </h2>
            <div className="space-y-3">
              {Object.entries(metrics.heatmapData).map(([day, count]) => (
                <div key={day}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {day}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {count} messages
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (count /
                            Math.max(
                              ...Object.values(metrics.heatmapData)
                            )) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
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
