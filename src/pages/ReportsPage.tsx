import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../contexts/StoreContext';

interface SalesData {
  date: string;
  sales: number;
  transactions: number;
}

export function ReportsPage() {
  const { currentStore } = useStore();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentStore) {
      fetchReports();
    }
  }, [currentStore, period]);

  const fetchReports = async () => {
    if (!currentStore) return;

    setLoading(true);

    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 28);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 6);
        break;
    }

    const { data: transactions } = await supabase
      .from('transactions')
      .select('created_at, total_amount')
      .eq('store_id', currentStore.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at');

    if (transactions) {
      const groupedData: { [key: string]: { sales: number; count: number } } = {};

      transactions.forEach(tx => {
        const date = new Date(tx.created_at);
        let key: string;

        switch (period) {
          case 'daily':
            key = date.toISOString().split('T')[0];
            break;
          case 'weekly':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
            break;
          case 'monthly':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            key = date.toISOString().split('T')[0];
        }

        if (!groupedData[key]) {
          groupedData[key] = { sales: 0, count: 0 };
        }
        groupedData[key].sales += tx.total_amount;
        groupedData[key].count += 1;
      });

      const chartData = Object.entries(groupedData).map(([date, data]) => ({
        date,
        sales: data.sales,
        transactions: data.count,
      }));

      setSalesData(chartData);
      setTotalSales(transactions.reduce((sum, tx) => sum + tx.total_amount, 0));
      setTotalTransactions(transactions.length);
    }

    setLoading(false);
  };

  const maxSales = Math.max(...salesData.map(d => d.sales), 1);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Reports</h1>
        <p className="text-gray-600">Analyze your business performance</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Time Period</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('daily')}
                className={`px-4 py-2 rounded-lg ${
                  period === 'daily'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setPeriod('weekly')}
                className={`px-4 py-2 rounded-lg ${
                  period === 'weekly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setPeriod('monthly')}
                className={`px-4 py-2 rounded-lg ${
                  period === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-900">Total Sales</span>
              </div>
              <div className="text-3xl font-bold text-green-900">
                R {totalSales.toFixed(2)}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-blue-900">Total Transactions</span>
              </div>
              <div className="text-3xl font-bold text-blue-900">
                {totalTransactions}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading reports...</div>
          ) : salesData.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No sales data available for this period
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Chart</h3>
              <div className="space-y-3">
                {salesData.map((data, index) => {
                  const barWidth = (data.sales / maxSales) * 100;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(data.date).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-600">
                          R {data.sales.toFixed(2)} ({data.transactions} txns)
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full flex items-center px-3 text-white text-sm font-medium transition-all duration-300"
                          style={{ width: `${Math.max(barWidth, 10)}%` }}
                        >
                          {barWidth > 15 && `${barWidth.toFixed(0)}%`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
