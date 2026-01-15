
import React, { useState } from 'react';
import { Analytics } from '../components/Analytics';
import { analyticsApi } from '../services/api';

function exportCSV() {
  // Demo: Export a simple CSV with dummy analytics summary
  const rows = [
    ['Metric', 'Value'],
    ['Total Quotes', '15420'],
    ['Total Policies', '3890'],
    ['Conversion Rate', '25.2%'],
    ['Average Premium', 'R485'],
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'analytics.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics from backend with date range
  const fetchAnalytics = async (from?: string, to?: string) => {
    setLoading(true);
    setError(null);
    try {
      // Pass from/to as query params if present
  const res = await analyticsApi.getSystemAnalytics({ from, to });
      if (res.success && res.data) setAnalyticsData(res.data);
      else setError(res.error || 'Failed to load analytics');
    } catch (e) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when dateRange changes
  React.useEffect(() => {
    fetchAnalytics(dateRange.from, dateRange.to);
  }, [dateRange.from, dateRange.to]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-0">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 mb-1">Analytics Dashboard</h1>
            <p className="text-gray-600 text-sm">Track key metrics, trends, and provider performance across your insurance business.</p>
          </div>
          <div className="flex gap-4 items-center mt-4 md:mt-0">
            {/* Date range filter (demo only) */}
            <label className="text-sm text-gray-700 font-medium">From:
              <input
                type="date"
                className="ml-2 border rounded px-2 py-1"
                value={dateRange.from}
                onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
              />
            </label>
            <label className="text-sm text-gray-700 font-medium">To:
              <input
                type="date"
                className="ml-2 border rounded px-2 py-1"
                value={dateRange.to}
                onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
              />
            </label>
            <button
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold shadow"
              onClick={exportCSV}
            >
              Export CSV
            </button>
          </div>
        </div>
      </header>
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading analytics...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : (
            <Analytics analyticsData={analyticsData} />
          )}
        </div>
      </main>
    </div>
  );
}