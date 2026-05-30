export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Agency Operations Dashboard
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          Unified analytics for Slack, Harvest, and Asana
        </p>
        <a
          href="/dashboard"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          View Dashboard
        </a>
      </div>
    </main>
  );
}