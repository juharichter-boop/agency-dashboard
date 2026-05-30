import { ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-[15px]">
          {children}
        </div>
      </main>
    </div>
  );
}