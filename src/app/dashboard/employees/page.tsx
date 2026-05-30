'use client';

import { useEffect, useState } from 'react';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { formatCurrency } from '@/lib/utils/calculations';

interface EmployeeData {
  userId: string;
  name: string;
  email: string;
  billableHours: number;
  nonBillableHours: number;
  billableRatio: number;
  billableAmount: number;
  completedTasks: number;
  openTasks: number;
  overdueTasks: number;
  totalMessages: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [daysBack, setDaysBack] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [harvestRes, asanaRes, slackRes] = await Promise.all([
          fetch(`/api/metrics/harvest?daysBack=${daysBack}`),
          fetch(`/api/metrics/asana?daysBack=${daysBack}`),
          fetch(`/api/metrics/slack?daysBack=${daysBack}`),
        ]);

        const harvest = await harvestRes.json();
        const asana = await asanaRes.json();
        const slack = await slackRes.json();

        // Combine employee data from all sources
        const employeeMap = new Map<string, any>();

        harvest.employees?.forEach((emp: any) => {
          const existing = employeeMap.get(emp.email) || {};
          employeeMap.set(emp.email, {
            ...existing,
            ...emp,
            userId: emp.userId,
            email: emp.email,
          });
        });

        asana.employees?.forEach((emp: any) => {
          const existing = employeeMap.get(emp.email) || {};
          employeeMap.set(emp.email, {
            ...existing,
            completedTasks: emp.completedTasks,
            openTasks: emp.openTasks,
            overdueTasks: emp.overdueTasks,
          });
        });

        slack.userMetrics?.forEach((emp: any) => {
          const existing = employeeMap.get(emp.email) || {};
          employeeMap.set(emp.email, {
            ...existing,
            totalMessages: emp.totalMessages,
          });
        });

        setEmployees(Array.from(employeeMap.values()));
      } catch (error) {
        console.error('Error fetching employee data:', error);
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
        <h1 className="text-3xl font-bold text-white mb-2">
          Employee Directory
        </h1>
        <p className="text-slate-400">
          Individual employee metrics and performance
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="mb-8">
        <DateRangePicker onDaysChange={setDaysBack} defaultDays={daysBack} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            Loading employee data...
          </p>
        </div>
      ) : employees.length > 0 ? (
        <div className="bg-slate-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                    Name
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-white">
                    Billable Hours
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-white">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-white">
                    Utilization
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-white">
                    Tasks Complete
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-white">
                    Messages
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {employees.map((emp) => (
                  <tr
                    key={emp.userId}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">
                          {emp.name}
                        </p>
                        <p className="text-sm text-slate-400">
                          {emp.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {emp.billableHours?.toFixed(1) || '-'} h
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {emp.billableAmount
                        ? formatCurrency(emp.billableAmount)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <div className="w-12 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-lime-500"
                            style={{
                              width: `${emp.billableRatio || 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-white">
                          {emp.billableRatio?.toFixed(0) || '0'}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {emp.completedTasks || 0}
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {emp.totalMessages || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            No employee data available
          </p>
        </div>
      )}
    </div>
  );
}
