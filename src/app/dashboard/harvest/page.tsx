'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { KPICard } from '@/components/dashboard/KPICard';
import { formatCurrency } from '@/lib/utils/calculations';
import { useState } from 'react';

interface HarvestMetrics {
  employees: Array<{
    name: string;
    billableHours: number;
    nonBillableHours: number;
    billableRatio: number;
    billableAmount: number;
  }>;
  projects: Array<{
    name: string;
    spent: number;
    revenue: number;
    billableHours: number;
  }>;
  summary: {
    totalBillableHours: number;
    totalNonBillableHours: number;
    totalRevenue: number;
    utilizationRate: number;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// Mock data
const mockMetrics: HarvestMetrics = {
  employees: [
    { name: 'Alice', billableHours: 156, nonBillableHours: 24, billableRatio: 87, billableAmount: 4680 },
    { name: 'Bob', billableHours: 140, nonBillableHours: 32, billableRatio: 81, billableAmount: 4200 },
  ],
  projects: [
    { name: 'Project Alpha', spent: 2400, revenue: 4800, billableHours: 80 },
    { name: 'Project Beta', spent: 1221, revenue: 2442, billableHours: 40 },
  ],
  summary: {
    totalBillableHours: 296,
    totalNonBillableHours: 56,
    totalRevenue: 12450,
    utilizationRate: 84,
  },
};

export default function HarvestAnalyticsPage() {
  const [daysBack, setDaysBack] = useState(30);
  const metrics = mockMetrics;

  const billableData = [
    {
      name: 'Billable',
      value: metrics.summary.totalBillableHours,
    },
    {
      name: 'Non-Billable',
      value: metrics.summary.totalNonBillableHours,
    },
  ];

  const topEmployees = metrics.employees.slice(0, 8);
  const topProjects = metrics.projects.slice(0, 8);

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(metrics.summary.totalRevenue)}
        />
        <KPICard
          title="Billable Hours"
          value={metrics.summary.totalBillableHours.toFixed(1)}
          unit="hours"
        />
        <KPICard
          title="Utilization Rate"
          value={`${metrics.summary.utilizationRate}%`}
        />
        <KPICard
          title="Non-Billable Hours"
          value={metrics.summary.totalNonBillableHours.toFixed(1)}
          unit="hours"
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

        {/* Top Employees */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Top Revenue Earners
          </h2>
          <div className="space-y-3">
            {topEmployees.map((emp) => (
              <div key={emp.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {emp.name}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(emp.billableAmount)}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (emp.billableAmount /
                          Math.max(
                            ...topEmployees.map((e) => e.billableAmount)
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
      </div>

      {/* Billable Hours by Employee */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Billable Hours by Employee
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
                dataKey="billableHours"
                fill="#3b82f6"
                name="Billable Hours"
              />
              <Bar
                dataKey="nonBillableHours"
                fill="#9ca3af"
                name="Non-Billable Hours"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            No data available
          </p>
        )}
      </div>

      {/* Project Revenue */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Top Projects by Revenue
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
                    {proj.billableHours.toFixed(1)} billable hours
                  </p>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(proj.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
