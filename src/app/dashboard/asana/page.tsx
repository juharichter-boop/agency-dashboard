'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { KPICard } from '@/components/dashboard/KPICard';

interface AsanaMetrics {
  employees: Array<{
    name: string;
    completedTasks: number;
    openTasks: number;
    overdueTasks: number;
    completionRate: number;
  }>;
  projects: Array<{
    name: string;
    completedTasks: number;
    openTasks: number;
    overdueTasks: number;
    progressRate: number;
  }>;
  summary: {
    totalCompletedTasks: number;
    totalOpenTasks: number;
    totalOverdueTasks: number;
    completionRate: number;
  };
}

const COLORS = ['#10b981', '#3b82f6', '#ef4444'];

export default function AsanaAnalyticsPage() {
  const [metrics, setMetrics] = useState<AsanaMetrics | null>(null);
  const [daysBack, setDaysBack] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/metrics/asana?daysBack=${daysBack}`
        );
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching Asana metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [daysBack]);

  const taskData = [
    { name: 'Completed', value: metrics?.summary.totalCompletedTasks || 0 },
    { name: 'Open', value: metrics?.summary.totalOpenTasks || 0 },
    { name: 'Overdue', value: metrics?.summary.totalOverdueTasks || 0 },
  ];

  const topEmployees = metrics?.employees?.slice(0, 8) || [];
  const topProjects = metrics?.projects?.slice(0, 8) || [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Task Analytics
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Project progress and team productivity
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Completed Tasks"
              value={metrics.summary.totalCompletedTasks}
              unit="tasks"
            />
            <KPICard
              title="Open Tasks"
              value={metrics.summary.totalOpenTasks}
              unit="tasks"
            />
            <KPICard
              title="Overdue Tasks"
              value={metrics.summary.totalOverdueTasks}
              unit="tasks"
            />
            <KPICard
              title="Completion Rate"
              value={`${metrics.summary.completionRate}%`}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Task Status Distribution */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                Task Status Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskData.map((entry, index) => (
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

            {/* Top Performers */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                Team Members - Completion Rate
              </h2>
              <div className="space-y-3">
                {topEmployees.map((emp) => (
                  <div key={emp.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {emp.name}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {emp.completionRate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${emp.completionRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Employee Task Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              Employee Task Status
            </h2>
            {topEmployees.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={topEmployees}
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
                  <Bar
                    dataKey="completedTasks"
                    fill="#10b981"
                    name="Completed"
                  />
                  <Bar dataKey="openTasks" fill="#3b82f6" name="Open" />
                  <Bar
                    dataKey="overdueTasks"
                    fill="#ef4444"
                    name="Overdue"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                No data available
              </p>
            )}
          </div>

          {/* Project Progress */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              Project Progress
            </h2>
            <div className="space-y-4">
              {topProjects.map((proj) => (
                <div key={proj.name} className="pb-4 border-b border-slate-200 dark:border-slate-800 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {proj.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {proj.completedTasks} of{' '}
                        {proj.completedTasks + proj.openTasks} tasks
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {proj.progressRate.toFixed(0)}%
                    </p>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${proj.progressRate}%` }}
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
