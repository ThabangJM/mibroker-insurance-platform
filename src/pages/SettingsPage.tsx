import { useState, useEffect } from 'react';
import { Save, Users, Store as StoreIcon, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';

export function SettingsPage() {
  const { currentStore, refreshStores, userRole } = useStore();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'store' | 'team' | 'subscription'>('store');

  const isOwnerOrAdmin = currentStore?.owner_id === user?.id || userRole === 'Admin';

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your store configuration</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('store')}
              className={`px-6 py-4 font-medium border-b-2 ${
                activeTab === 'store'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <StoreIcon className="w-5 h-5" />
                Store Details
              </div>
            </button>
            {isOwnerOrAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`px-6 py-4 font-medium border-b-2 ${
                    activeTab === 'team'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`px-6 py-4 font-medium border-b-2 ${
                    activeTab === 'subscription'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Subscription
                  </div>
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'store' && <StoreSettings />}
          {activeTab === 'team' && isOwnerOrAdmin && <TeamSettings />}
          {activeTab === 'subscription' && isOwnerOrAdmin && <SubscriptionSettings />}
        </div>
      </div>
    </div>
  );
}

function StoreSettings() {
  const { currentStore, refreshStores } = useStore();
  const [formData, setFormData] = useState({
    name: currentStore?.name || '',
    currency: (currentStore?.settings as any)?.currency || 'ZAR',
    tax_rate: (currentStore?.settings as any)?.tax_rate?.toString() || '15',
    receipt_footer: (currentStore?.settings as any)?.receipt_footer || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('stores')
        .update({
          name: formData.name,
          settings: {
            currency: formData.currency,
            tax_rate: parseFloat(formData.tax_rate),
            receipt_footer: formData.receipt_footer,
          },
        })
        .eq('id', currentStore.id);

      if (updateError) throw updateError;

      setSuccess(true);
      await refreshStores();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Settings saved successfully
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Store Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ZAR">ZAR - South African Rand</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.tax_rate}
            onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Receipt Footer
        </label>
        <textarea
          value={formData.receipt_footer}
          onChange={(e) => setFormData({ ...formData, receipt_footer: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Thank you for your business!"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
      >
        <Save className="w-5 h-5" />
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

function TeamSettings() {
  return (
    <div className="max-w-2xl">
      <p className="text-gray-600 mb-4">Manage team members and their roles</p>
      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
        Team management coming soon
      </div>
    </div>
  );
}

function SubscriptionSettings() {
  const { currentStore } = useStore();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Plan</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-blue-900">
                {currentStore?.subscription_tier} Plan
              </div>
              <div className="text-sm text-blue-700">
                Status: {currentStore?.subscription_status}
              </div>
              {currentStore?.trial_ends_at && (
                <div className="text-sm text-blue-700">
                  Trial ends: {new Date(currentStore.trial_ends_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-2">Starter Plan</h4>
          <div className="text-2xl font-bold text-gray-900 mb-4">R299/month</div>
          <ul className="space-y-2 text-sm text-gray-600 mb-4">
            <li>1 Store</li>
            <li>2 Users</li>
            <li>Unlimited Products</li>
            <li>Basic Reports</li>
          </ul>
        </div>

        <div className="border-2 border-blue-600 rounded-lg p-6 bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Pro Plan</h4>
            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Popular</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-4">R699/month</div>
          <ul className="space-y-2 text-sm text-gray-600 mb-4">
            <li>3 Stores</li>
            <li>5 Users</li>
            <li>Unlimited Products</li>
            <li>Advanced Reports</li>
            <li>Priority Support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
