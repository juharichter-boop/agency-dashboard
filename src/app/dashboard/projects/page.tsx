'use client';

import { useEffect, useState } from 'react';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { formatCurrency } from '@/lib/utils/calculations';

interface ProjectData {
  projectId: string;
  name: string;
  clientName: string;
  budget: number;
  spent: number;
  revenue: number;
  billableHours: number;
  completedTasks: number;
  openTasks: number;
  progressRate: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [daysBack, setDaysBack] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [harvestRes, asanaRes] = await Promise.all([
          fetch(`/api/metrics/harvest?daysBack=${daysBack}`),
          fetch(`/api/metrics/asana?daysBack=${daysBack}`),
        ]);

        const harvest = await harvestRes.json();
        const asana = await asanaRes.json();

        // Combine project data from all sources
        const projectMap = new Map<string, any>();

        harvest.projects?.forEach((proj: any) => {
          projectMap.set(proj.projectId, {
            ...proj,
            projectId: proj.projectId,
          });
        });

        asana.projects?.forEach((proj: any) => {
          const existing = projectMap.get(proj.projectId) || {
            projectId: proj.projectId,
            name: proj.name,
            clientName: proj.clientName,
          };
          projectMap.set(proj.projectId, {
            ...existing,
            completedTasks: proj.completedTasks,
            openTasks: proj.openTasks,
            progressRate: proj.progressRate,
          });
        });

        setProjects(Array.from(projectMap.values()));
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [daysBack]);

  const sortedProjects = projects.sort(
    (a, b) => (b.revenue || 0) - (a.revenue || 0)
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Projects
        </h1>
        <p className="text-slate-400">
          Project budget, revenue, and progress tracking
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="mb-8">
        <DateRangePicker onDaysChange={setDaysBack} defaultDays={daysBack} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            Loading project data...
          </p>
        </div>
      ) : projects.length > 0 ? (
        <div className="space-y-6">
          {sortedProjects.map((proj) => (
            <div
              key={proj.projectId}
              className="bg-slate-900 rounded-lg p-[15px]"
            >
              <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {proj.name}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {proj.clientName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {formatCurrency(proj.revenue || 0)}
                    </p>
                    <p className="text-sm text-slate-400">
                      Revenue
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 pb-6 border-b border-slate-800">
                <div>
                  <p className="text-sm text-slate-400 mb-1">
                    Budget
                  </p>
                  <p className="font-semibold text-white">
                    {formatCurrency(proj.budget || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">
                    Spent
                  </p>
                  <p className="font-semibold text-white">
                    {formatCurrency(proj.spent || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">
                    Billable Hours
                  </p>
                  <p className="font-semibold text-white">
                    {proj.billableHours?.toFixed(1) || 0} h
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">
                    Margin
                  </p>
                  <p className="font-semibold text-white">
                    {formatCurrency((proj.budget || 0) - (proj.spent || 0))}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-2">
                    Task Progress
                  </p>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-lime-500"
                      style={{
                        width: `${proj.progressRate || 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm font-medium text-white">
                    {proj.progressRate?.toFixed(0) || 0}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">
                    Completed Tasks
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {proj.completedTasks || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-2">
                    Open Tasks
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {proj.openTasks || 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            No project data available
          </p>
        </div>
      )}
    </div>
  );
}
