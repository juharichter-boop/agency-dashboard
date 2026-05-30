'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { KPICard } from '@/components/dashboard/KPICard';
import { useState } from 'react';

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

// Mock data
const mockMetrics: AsanaMetrics = {
  employees: [
    { name: 'Alice', completedTasks: 24, openTasks: 8, overdueTasks: 1, completionRate: 75 },
    { name: 'Bob', completedTasks: 18, openTasks: 12, overdueTasks: 2, completionRate: 60 },
  ],
  projects: [
    { name: 'Website Redesign', completedTasks: 28, openTasks: 12, overdueTasks: 1, progressRate: 70 },
    { name: 'Mobile App', completedTasks: 14, openTasks: 8, overdueTasks: 2, progressRate: 64 },
  ],
  summary: {
    totalCompletedTasks: 42,
    totalOpenTasks: 20,
    totalOverdueTasks: 3,
    completionRate: 68,
  },
};

export default function AsanaAnalyticsPage() {
  const [daysBack, setDaysBack] = useState(30);
  const metrics = mockMetrics;

  const completionData = [
    { name: 'Completed', value: metrics.summary.totalCompletedTasks, fill: '#10b981' },
    { name: 'Open', value: metrics.summary.totalOpenTasks, fill: '#3b82f6' },
    { name: 'Overdue', value: metrics.summary.totalOverdueTasks, fill: '#ef4444' },
  ];

  const topEmployees = metrics.employees.slice(0, 8);
  const topProjects = metrics.projects.slice(0, 8);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Task Progress
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Task completion, workload, and project progress
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="mb-8">
        <DateRangePicker onDaysChange={setDaysBack} defaultDays={daysBack} />
      </div>

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
        {/* Task Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Task Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {completionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Assignees */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Top Assignees
          </h2>
          <div className="space-y-3">
            {topEmployees.map((emp) => (
              <div key={emp.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {emp.name}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {emp.completedTasks} tasks
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${emp.completionRate}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks by Employee */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Task Distribution by Assignee
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
              <Bar dataKey="completedTasks" fill="#10b981" name="Completed" />
              <Bar dataKey="openTasks" fill="#3b82f6" name="Open" />
              <Bar dataKey="overdueTasks" fill="#ef4444" name="Overdue" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            No data available
          </p>
        )}
      </div>

      {/* Projects */}
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
                    {proj.completedTasks} completed, {proj.openTasks} open
                  </p>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {proj.progressRate}%
                </p>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${proj.progressRate}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
