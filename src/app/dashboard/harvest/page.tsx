'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { KPICard } from '@/components/dashboard/KPICard';
import { formatCurrency } from '@/lib/utils/calculations';
import { useState, useEffect } from 'react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function HarvestAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/sync/harvest', { method: 'POST' });
        if (response.ok) {
          setData(await response.json());
        }
      } catch (error) {
        console.error('Error fetching Harvest data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [daysBack]);

  const billableData = [
    { name: 'Billable', value: data?.billableHours || 0 },
    { name: 'Non-Billable', value: (data?.totalHours || 0) - (data?.billableHours || 0) },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Harvest Analytics
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Billable hours, revenue, and utilization metrics
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="mb-8">
        <DateRangePicker onDaysChange={setDaysBack} defaultDays={daysBack} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            Syncing Harvest data...
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Total Revenue"
              value={formatCurrency(data?.totalRevenue || 0)}
            />
            <KPICard
              title="Billable Hours"
              value={(data?.billableHours || 0).toFixed(1)}
              unit="hours"
            />
            <KPICard
              title="Total Hours"
              value={(data?.totalHours || 0).toFixed(1)}
              unit="hours"
            />
            <KPICard
              title="Entries Synced"
              value={data?.synced || 0}
              unit="entries"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Billable vs Non-Billable */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                Hours Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={billableData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}h`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {billableData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                Summary
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Total Hours Logged
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {(data?.totalHours || 0).toFixed(1)} hours
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Billable Hours
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {(data?.billableHours || 0).toFixed(1)} hours
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Total Revenue
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(data?.totalRevenue || 0)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Billable Rate
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {data?.totalHours ? ((data.billableHours / data.totalHours) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              ✓ Real data synced from Harvest API (last 90 days)
            </p>
          </div>
        </>
      )}
    </div>
  );
}
