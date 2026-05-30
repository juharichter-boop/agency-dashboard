import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard</h2>
      {children}
    </div>
  );
}