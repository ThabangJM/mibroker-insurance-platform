import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Calendar, 
  DollarSign, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  CreditCard,
  Phone,
  Mail,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Policy, Claim, Payment } from '../types';
import { policyApi } from '../services/api';

// Props interface for PolicyManagement component
interface PolicyManagementProps {
  userId: string;                    // Current user ID
  onBack: () => void;               // Callback to go back to previous view
}

// Component for comprehensive policy management
export function PolicyManagement({ userId, onBack }: PolicyManagementProps) {
  // State for policies data
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for selected policy and active tab
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'claims' | 'payments' | 'documents'>('overview');
  
  // State for policy actions
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load user's policies on component mount
  useEffect(() => {
    loadPolicies();
  }, [userId]);

  // Function to load user's policies from API
  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await policyApi.getUserPolicies(userId);
      
      if (response.success && response.data) {
        setPolicies(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to load policies');
      }
    } catch (err) {
      setError('An error occurred while loading policies');
      console.error('Policy loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle policy renewal
  const handleRenewPolicy = async (policyId: string) => {
    try {
      setActionLoading('renew');
      const response = await policyApi.renewPolicy(policyId);
      
      if (response.success) {
        // Refresh policies list
        await loadPolicies();
        alert('Policy renewal initiated successfully!');
      } else {
        alert(response.error || 'Failed to renew policy');
      }
    } catch (err) {
      alert('An error occurred while renewing the policy');
      console.error('Policy renewal error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Function to handle policy cancellation
  const handleCancelPolicy = async (policyId: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      setActionLoading('cancel');
      const response = await policyApi.cancelPolicy(policyId, reason);
      
      if (response.success) {
        // Refresh policies list
        await loadPolicies();
        alert('Policy cancellation request submitted successfully!');
      } else {
        alert(response.error || 'Failed to cancel policy');
      }
    } catch (err) {
      alert('An error occurred while cancelling the policy');
      console.error('Policy cancellation error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Function to format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  // Function to get policy status color
  const getPolicyStatusColor = (status: Policy['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Function to get claim status color
  const getClaimStatusColor = (status: Claim['status']) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get payment status color
  const getPaymentStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <AlertTriangle className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Policies</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadPolicies}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Policy detail view
  if (selectedPolicy) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedPolicy(null)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Policies
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedPolicy.provider} - {selectedPolicy.type.charAt(0).toUpperCase() + selectedPolicy.type.slice(1)} Insurance
              </h1>
              <p className="text-gray-600">Policy #{selectedPolicy.policyNumber}</p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPolicyStatusColor(selectedPolicy.status)}`}>
            {selectedPolicy.status.charAt(0).toUpperCase() + selectedPolicy.status.slice(1)}
          </div>
        </div>

        {/* Policy Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-green-600 mr-1" />
                <span className="text-sm font-medium text-gray-700">Monthly Premium</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(selectedPolicy.premium)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-5 w-5 text-blue-600 mr-1" />
                <span className="text-sm font-medium text-gray-700">Coverage</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {selectedPolicy.coverage}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-purple-600 mr-1" />
                <span className="text-sm font-medium text-gray-700">Renewal Date</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {selectedPolicy.renewalDate.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Shield },
                { id: 'claims', label: 'Claims', icon: FileText },
                { id: 'payments', label: 'Payments', icon: CreditCard },
                { id: 'documents', label: 'Documents', icon: Download },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Policy Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Policy Number:</span>
                        <span className="font-medium">{selectedPolicy.policyNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">{selectedPolicy.startDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">{selectedPolicy.endDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Provider:</span>
                        <span className="font-medium">{selectedPolicy.provider}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      {selectedPolicy.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleRenewPolicy(selectedPolicy.id)}
                            disabled={actionLoading === 'renew'}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === 'renew' ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            Renew Policy
                          </button>
                          
                          <button
                            onClick={() => handleCancelPolicy(selectedPolicy.id)}
                            disabled={actionLoading === 'cancel'}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === 'cancel' ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Cancel Policy
                          </button>
                        </>
                      )}
                      
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                        <Phone className="h-4 w-4" />
                        Contact Support
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'claims' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Claims History</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    File New Claim
                  </button>
                </div>

                {selectedPolicy.claims.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Claims Filed</h4>
                    <p className="text-gray-600">You haven't filed any claims for this policy yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedPolicy.claims.map((claim) => (
                      <div key={claim.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">Claim #{claim.claimNumber}</h4>
                            <p className="text-sm text-gray-600">{claim.type}</p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getClaimStatusColor(claim.status)}`}>
                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{claim.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Amount:</span>
                            <span className="ml-2 font-medium">{formatCurrency(claim.amount)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Submitted:</span>
                            <span className="ml-2 font-medium">{claim.submittedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>

                {selectedPolicy.paymentHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h4>
                    <p className="text-gray-600">No payments have been processed for this policy yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transaction ID
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedPolicy.paymentHistory.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.processedAt.toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.method}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                              {payment.transactionId}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Policy Documents</h3>

                {selectedPolicy.documents.length === 0 ? (
                  <div className="text-center py-8">
                    <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Documents Available</h4>
                    <p className="text-gray-600">Policy documents will appear here once they're available.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedPolicy.documents.map((document) => (
                      <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <FileText className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                              <h4 className="font-medium text-gray-900">{document.name}</h4>
                              <p className="text-sm text-gray-600">{document.type}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          <p>Size: {(document.size / 1024 / 1024).toFixed(2)} MB</p>
                          <p>Uploaded: {document.uploadedAt.toLocaleDateString()}</p>
                        </div>
                        
                        <button
                          onClick={() => window.open(document.url, '_blank')}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main policies list view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Policy Management</h1>
          <p className="text-gray-600 mt-1">Manage your active insurance policies</p>
        </div>
        
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Policies Grid */}
      {policies.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Policies</h3>
          <p className="text-gray-600 mb-6">You don't have any active insurance policies yet.</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Get Your First Quote
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedPolicy(policy)}
            >
              {/* Policy Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{policy.provider}</h3>
                    <p className="text-gray-600">{policy.type.charAt(0).toUpperCase() + policy.type.slice(1)} Insurance</p>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPolicyStatusColor(policy.status)}`}>
                    {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(policy.premium)}
                  </div>
                  <div className="text-sm text-gray-600">per month</div>
                </div>
              </div>

              {/* Policy Details */}
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Policy Number:</span>
                    <span className="font-medium text-gray-900">{policy.policyNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coverage:</span>
                    <span className="font-medium text-gray-900">{policy.coverage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Renewal Date:</span>
                    <span className="font-medium text-gray-900">{policy.renewalDate.toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{policy.claims.length}</div>
                      <div className="text-gray-600">Claims</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{policy.paymentHistory.length}</div>
                      <div className="text-gray-600">Payments</div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  <div className="text-center text-blue-600 font-medium hover:text-blue-700 transition-colors">
                    Manage Policy →
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}