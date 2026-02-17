import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../contexts/StoreContext';

interface Stats {
  todaySales: number;
  todayTransactions: number;
  lowStockCount: number;
  totalProducts: number;
}

export function Dashboard() {
  const { currentStore } = useStore();
  const [stats, setStats] = useState<Stats>({
    todaySales: 0,
    todayTransactions: 0,
    lowStockCount: 0,
    totalProducts: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentStore) {
      fetchDashboardData();
    }
  }, [currentStore]);

  const fetchDashboardData = async () => {
    if (!currentStore) return;

    setLoading(true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayTransactions } = await supabase
      .from('transactions')
      .select('total_amount')
      .eq('store_id', currentStore.id)
      .gte('created_at', today.toISOString());

    const todaySales = todayTransactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0;

    const { count: lowStockCount } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', currentStore.id)
      .lt('quantity', 10);

    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', currentStore.id)
      .eq('is_active', true);

    const { data: recent } = await supabase
      .from('transactions')
      .select('*')
      .eq('store_id', currentStore.id)
      .order('created_at', { ascending: false })
      .limit(5);

    setStats({
      todaySales,
      todayTransactions: todayTransactions?.length || 0,
      lowStockCount: lowStockCount || 0,
      totalProducts: totalProducts || 0,
    });

    setRecentTransactions(recent || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back to {currentStore?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            R {stats.todaySales.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Today's Sales</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.todayTransactions}
          </div>
          <div className="text-sm text-gray-600">Transactions Today</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.lowStockCount}
          </div>
          <div className="text-sm text-gray-600">Low Stock Items</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalProducts}
          </div>
          <div className="text-sm text-gray-600">Active Products</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="p-6">
            {recentTransactions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.transaction_number}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        R {transaction.total_amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {transaction.payment_method}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <button className="w-full text-left p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">New Sale</div>
                    <div className="text-sm text-gray-600">Process a new transaction</div>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Add Product</div>
                    <div className="text-sm text-gray-600">Add new product to inventory</div>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">View Reports</div>
                    <div className="text-sm text-gray-600">Analyze sales performance</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {stats.lowStockCount > 0 && (
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900 mb-1">Low Stock Alert</h3>
              <p className="text-sm text-orange-800">
                You have {stats.lowStockCount} product{stats.lowStockCount > 1 ? 's' : ''} running low on stock.
                Consider restocking to avoid running out.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
