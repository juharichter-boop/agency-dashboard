export default function DashboardLayout({ children }) {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard</h2>
      {children}
    </div>
  );
}