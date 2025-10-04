import { useState } from 'react';
import { Quote, User } from '../types';
import { ArrowLeft, Star, Calendar, DollarSign, Shield, Phone, Mail, CheckCircle } from 'lucide-react';

interface DashboardProps {
  quotes: Quote[];
  user: User | null;
  onBack: () => void;
  onNewQuote: () => void;
}

export function Dashboard({ quotes, user, onBack, onNewQuote }: DashboardProps) {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  // State to track if purchase request is being processed
  const [isPurchasing, setIsPurchasing] = useState(false);
  // State to show success message after purchase request
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Function to handle policy purchase request
  const handlePurchasePolicy = async (quote: Quote) => {
    // Set loading state to show user that request is being processed
    setIsPurchasing(true);
    
    try {
      // Get applicant details from user object or form data
      // In a real app, this would come from the quote form data
      const applicantDetails = {
        firstName: user?.name?.split(' ')[0] || 'John',
        lastName: user?.name?.split(' ')[1] || 'Doe',
        email: user?.email || 'customer@example.com',
        phone: user?.phone || '083 123 4567',
        idNumber: '8001015009087', // This would come from the form
        city: 'johannesburg' // This would come from the form
      };

      // Mock insurance info - in real app this would be stored with the quote
      const insuranceInfo = {
        vehicleYear: '2020',
        vehicleMake: 'Toyota',
        vehicleModel: 'Corolla',
        vehicleValue: '250000-500000',
        currentInsurance: 'expiring-soon'
      };

      // Call the serverless function to send email
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-quote-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          quote: {
            ...quote,
            createdAt: quote.createdAt.toISOString()
          },
          applicant: applicantDetails,
          insuranceInfo: insuranceInfo
        }),
      });

      // Parse the response from the serverless function
      const result = await response.json();

      if (result.success) {
        // Show success message to user
        setPurchaseSuccess(true);
        // Hide success message after 5 seconds
        setTimeout(() => setPurchaseSuccess(false), 5000);
      } else {
        // Show error message if email sending failed
        alert('Failed to send purchase request. Please try again or contact support.');
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error sending purchase request:', error);
      alert('An error occurred while processing your request. Please try again.');
    } finally {
      // Reset loading state regardless of success or failure
      setIsPurchasing(false);
    }
  };
  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const groupedQuotes = quotes.reduce((acc, quote) => {
    const key = quote.type;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(quote);
    return acc;
  }, {} as Record<string, Quote[]>);

  const getInsuranceTypeTitle = (type: string) => {
    const titles: Record<string, string> = {
      auto: 'Auto Insurance',
      home: 'Home Insurance',
      life: 'Commercial Property',
      health: 'Health Insurance',
      business: 'Business Insurance',
    };
    return titles[type] || type;
  };

  if (selectedQuote) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white p-6">
              <button
                onClick={() => setSelectedQuote(null)}
                className="flex items-center text-blue-100 hover:text-white mb-4 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold">Quote Details</h1>
              <p className="text-blue-100 mt-2">
                {getInsuranceTypeTitle(selectedQuote.type)} - {selectedQuote.provider}
              </p>
            </div>

            {/* Quote Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Details */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Premium</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(selectedQuote.premium)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coverage Amount</span>
                        <span className="font-semibold text-gray-900">
                          {selectedQuote.coverage}
                        </span>
                      </div>
                      {selectedQuote.deductible && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deductible</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(selectedQuote.deductible)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedQuote.status)}`}>
                          {selectedQuote.status.charAt(0).toUpperCase() + selectedQuote.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="font-medium text-gray-900">{selectedQuote.provider}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 mr-3" />
                        <span className="text-gray-600">4.5/5 Rating (2,345 reviews)</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-green-600 mr-3" />
                        <span className="text-gray-600">1-800-555-0123</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="text-gray-600">support@{selectedQuote.provider.toLowerCase().replace(' ', '')}.com</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Ready to Purchase?</h3>
                    <p className="text-green-700 mb-4">
                      This quote is valid for 30 days. You can purchase this policy directly through our partner.
                    </p>
                    
                    {/* Success message display */}
                    {purchaseSuccess && (
                      <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-md flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-800 text-sm">
                          Purchase request sent successfully! We'll contact you within 24 hours.
                        </span>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {/* Purchase Policy Button - calls handlePurchasePolicy function */}
                      <button 
                        onClick={() => handlePurchasePolicy(selectedQuote)}
                        disabled={isPurchasing}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 font-medium disabled:bg-gray-400"
                      >
                        {isPurchasing ? 'Processing...' : 'Purchase Policy'}
                      </button>
                      <button className="w-full border border-green-600 text-green-600 py-3 px-4 rounded-md hover:bg-green-50 transition-colors duration-200 font-medium">
                        Contact Agent
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Quote Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Quote ID:</span>
                        <span className="text-blue-900 font-mono">{selectedQuote.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Created:</span>
                        <span className="text-blue-900">
                          {selectedQuote.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Expires:</span>
                        <span className="text-blue-900">
                          {new Date(selectedQuote.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user ? `Welcome back, ${user.name}` : 'Insurance Dashboard'}
              </h1>
              <p className="text-gray-600 mt-2">Manage your quotes and policies</p>
            </div>
            <button
              onClick={onNewQuote}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Get New Quote
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{quotes.length}</div>
                <div className="text-gray-600">Active Quotes</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {quotes.filter(q => q.status === 'approved').length}
                </div>
                <div className="text-gray-600">Approved Policies</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {quotes.filter(q => q.status === 'pending').length}
                </div>
                <div className="text-gray-600">Pending Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quotes by Category */}
        {Object.keys(groupedQuotes).length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Quotes Yet</h2>
            <p className="text-gray-600 mb-6">Get started by requesting your first insurance quote</p>
            <button
              onClick={onNewQuote}
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Get Your First Quote
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedQuotes).map(([type, typeQuotes]: [string, Quote[]]) => (
              <div key={type} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {getInsuranceTypeTitle(type)} ({typeQuotes.length})
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {typeQuotes.map((quote: Quote) => (
                      <div
                        key={quote.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        onClick={() => setSelectedQuote(quote)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-900">{quote.provider}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(quote.status)}`}>
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Premium:</span>
                            <span className="font-semibold">{formatCurrency(quote.premium)}/month</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Coverage:</span>
                            <span className="font-semibold">{quote.coverage}</span>
                          </div>
                          {quote.deductible && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Deductible:</span>
                              <span className="font-semibold">{formatCurrency(quote.deductible)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created:</span>
                            <span className="font-semibold">{quote.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <div className="text-center text-blue-600 font-medium">
                            View Details →
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}