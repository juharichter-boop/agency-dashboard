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
          fetch('/api/sync/harvest', {
            method: 'POST',
            body: JSON.stringify({ daysBack })
          }),
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
        <h1 className="text-4xl font-bold text-white mb-2">
          Operations Overview
        </h1>
        <p className="text-slate-400">
          Real-time agency metrics and insights
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="mb-8">
        <DateRangePicker onDaysChange={setDaysBack} defaultDays={daysBack} />
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto mb-4"></div>
          <p className="text-slate-400">
            Syncing real data from your APIs...
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <KPICard
              title="Total Revenue"
              value={formatCurrency(harvestData?.totalRevenue || 0, harvestData?.currency || 'USD')}
              unit={`${daysBack}D`}
            />
            <KPICard
              title="Billable Hours"
              value={((harvestData?.billableHours || 0).toFixed(1))}
              unit="hrs"
            />
            <KPICard
              title="Open Tasks"
              value={asanaData?.open || 0}
              unit="tasks"
            />
            <KPICard
              title="Slack Messages"
              value={slackData?.metrics?.totalMessages || 0}
              unit="msgs"
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 rounded-lg p-[15px]">
              <h2 className="text-lg font-bold text-white mb-6">
                Harvest Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <span className="text-slate-400">
                    Total Hours
                  </span>
                  <span className="text-2xl font-bold text-lime-400">
                    {(harvestData?.totalHours || 0).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <span className="text-slate-400">
                    Billable Hours
                  </span>
                  <span className="text-2xl font-bold text-lime-400">
                    {(harvestData?.billableHours || 0).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">
                    Revenue
                  </span>
                  <span className="text-2xl font-bold text-lime-400">
                    {formatCurrency(harvestData?.totalRevenue || 0, harvestData?.currency || 'USD')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-lg p-[15px]">
              <h2 className="text-lg font-bold text-white mb-6">
                Navigation
              </h2>
              <div className="space-y-3">
                <a
                  href="/dashboard/slack"
                  className="block px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-lime-400 hover:text-lime-300 transition-colors text-sm font-medium"
                >
                  📊 Slack Analytics
                  <span className="text-slate-400 block text-xs mt-1">{slackData?.metrics?.totalMessages || 0} messages</span>
                </a>
                <a
                  href="/dashboard/harvest"
                  className="block px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-lime-400 hover:text-lime-300 transition-colors text-sm font-medium"
                >
                  💰 Harvest Details
                  <span className="text-slate-400 block text-xs mt-1">{formatCurrency(harvestData?.totalRevenue || 0, harvestData?.currency || 'USD')}</span>
                </a>
                <a
                  href="/dashboard/asana"
                  className="block px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-lime-400 hover:text-lime-300 transition-colors text-sm font-medium"
                >
                  ✓ Task Progress
                  <span className="text-slate-400 block text-xs mt-1">{asanaData?.open || 0} open tasks</span>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
