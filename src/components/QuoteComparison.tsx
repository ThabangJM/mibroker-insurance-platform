import { useState, useMemo } from 'react';
import { Quote, QuoteFilters, QuoteRecommendation } from '../types';
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  Star, 
  Shield, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Info,
  Heart,
  Loader2,
  User,
  Mail,
  Clock,
  // ...existing code...
} from 'lucide-react';

// Import recommendation service
import {
  generateQuoteRecommendation,
  assignRepresentative,
  generateUserId,
  createQuoteInterest,
  createRepresentativeAssignment,
  formatQuoteDetails,
  calculateBusinessDays
} from '../services/recommendationService';

// Props interface for the QuoteComparison component
interface QuoteComparisonProps {
  quotes: Quote[];                           // Array of quotes to compare
  onSelectQuote: (quote: Quote) => void;     // Callback when user selects a quote
  onPurchaseQuote: (quote: Quote) => void;   // Callback when user wants to purchase (deprecated)
  formData?: any;                           // Form data for recommendations
  insuranceType?: string;                   // Insurance type for representative assignment
}

// Component for advanced quote comparison with filtering and sorting
export function QuoteComparison({ quotes, onSelectQuote, onPurchaseQuote, formData, insuranceType }: QuoteComparisonProps) {

  // State for showing the comparison modal
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  // State for selected quote for detailed comparison
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  // State for showing filters panel
  const [showFilters, setShowFilters] = useState(false);

  // State for managing filters and sorting
  const [filters, setFilters] = useState<QuoteFilters>({
    priceRange: { min: 0, max: 1000 },
    providers: [],
    coverageAmount: { min: 0, max: 10000000 },
    deductible: { min: 0, max: 50000 },
    rating: 0,
    features: [],
    sortBy: 'price',
    sortOrder: 'asc',
  });

  // New state for recommendation system
  const [interestedQuote, setInterestedQuote] = useState<Quote | null>(null);
  const [recommendation, setRecommendation] = useState<QuoteRecommendation | null>(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [assignedRepresentative, setAssignedRepresentative] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [showRepresentativeModal, setShowRepresentativeModal] = useState(false);
  const [userChoice, setUserChoice] = useState<'proceed' | 'change' | null>(null);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);

  // Helper to update filters
  const updateFilter = <K extends keyof QuoteFilters>(key: K, value: QuoteFilters[K]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handler for when user shows interest in a quote
  const handleInterestedInQuote = async (quote: Quote) => {
    setIsLoadingRecommendation(true);
    setInterestedQuote(quote);
    
    // Generate user ID if not already set
    if (!userId) {
      const newUserId = generateUserId();
      setUserId(newUserId);
    }

    try {
      // Generate recommendation
      const rec = generateQuoteRecommendation(quotes, formData);
      setRecommendation(rec);
      setShowRecommendationModal(true);
    } catch (error) {
      console.error('Error generating recommendation:', error);
      // Fallback - proceed without recommendation
      handleProceedWithQuote(quote);
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  // Handler for user choice (proceed or change)
  const handleUserChoice = async (choice: 'proceed' | 'change') => {
    if (!interestedQuote || !recommendation) return;

    setUserChoice(choice);
    setShowRecommendationModal(false);
    setIsLoadingRecommendation(true);

    try {
      // Assign representative
      const representative = assignRepresentative(insuranceType);
      setAssignedRepresentative(representative);

      // Create quote interest record
      const quoteInterest = createQuoteInterest(
        userId,
        interestedQuote,
        recommendation.recommendedQuote,
        formData,
        choice
      );

      // Create representative assignment
      createRepresentativeAssignment(
        userId,
        representative.id,
        quoteInterest.id
      );

      // Update quote interest with representative ID
      quoteInterest.representativeId = representative.id;

      // Show representative modal
      setShowRepresentativeModal(true);
    } catch (error) {
      console.error('Error assigning representative:', error);
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  // Handler for proceeding with final confirmation
  const handleFinalProceed = () => {
    setShowRepresentativeModal(false);
    setShowFinalConfirmation(true);
  };

  // Legacy handler for backwards compatibility
  const handleProceedWithQuote = (quote: Quote) => {
    // This maintains compatibility with the old purchase system if needed
    onPurchaseQuote(quote);
  };

  // Unique providers and features for filter options
  const uniqueProviders = useMemo(
    () => Array.from(new Set(quotes.map(q => q.provider))),
    [quotes]
  );
  const uniqueFeatures = useMemo(
    () => Array.from(new Set(quotes.flatMap(q => q.features))),
    [quotes]
  );

  // Filtering and sorting logic
  const filteredAndSortedQuotes = useMemo(() => {
    let result = quotes.filter(q => {
      // Price range
      if (q.premium < filters.priceRange.min || q.premium > filters.priceRange.max) return false;
      // Providers
      if (filters.providers.length > 0 && !filters.providers.includes(q.provider)) return false;
      // Coverage
      if (Number(q.coverage) < filters.coverageAmount.min || Number(q.coverage) > filters.coverageAmount.max) return false;
      // Deductible
      if (
        q.deductible === undefined ||
        q.deductible < filters.deductible.min ||
        q.deductible > filters.deductible.max
      ) return false;
      // Rating
      if (q.providerRating < filters.rating) return false;
      // Features
      if (filters.features.length > 0 && !filters.features.every(f => q.features.includes(f))) return false;
      return true;
    });

    // Sorting
    result = result.sort((a, b) => {
      let compare = 0;
      switch (filters.sortBy) {
        case 'price':
          compare = a.premium - b.premium;
          break;
        case 'rating':
          compare = b.providerRating - a.providerRating;
          break;
        case 'coverage':
          compare = Number(b.coverage) - Number(a.coverage);
          break;
        case 'provider':
          compare = a.provider.localeCompare(b.provider);
          break;
        default:
          compare = 0;
      }
      return filters.sortOrder === 'asc' ? compare : -compare;
    });

    return result;
  }, [quotes, filters]);

  // Toggle quote selection for comparison
  const toggleQuoteSelection = (quoteId: string) => {
    setSelectedQuotes(prev => {
      if (prev.includes(quoteId)) {
        return prev.filter(id => id !== quoteId);
      } else if (prev.length < 3) {
        return [...prev, quoteId];
      }
      return prev;
    });
  };



  // Function to format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  // Function to get risk score color
  const getRiskScoreColor = (score: number) => {
    if (score <= 3) return 'text-green-600 bg-green-100';
    if (score <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Function to get provider rating stars
  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header with filters and sorting controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Compare Quotes ({filteredAndSortedQuotes.length})
            </h2>
            <p className="text-gray-600 mt-1">
              Find the best insurance deal for your needs
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={filters.sortBy}
                onChange={e => updateFilter('sortBy', e.target.value as 'price' | 'rating' | 'coverage' | 'provider')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="price">Price</option>
                <option value="rating">Rating</option>
                <option value="coverage">Coverage</option>
                <option value="provider">Provider</option>
              </select>
              <button
                onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {filters.sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4 text-gray-600" />
                ) : (
                  <SortDesc className="h-4 w-4 text-gray-600" />
                )}
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Premium Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) => updateFilter('priceRange', {
                      ...filters.priceRange,
                      min: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) => updateFilter('priceRange', {
                      ...filters.priceRange,
                      max: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Provider Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Providers
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uniqueProviders.map(provider => (
                    <label key={provider} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.providers.includes(provider)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter('providers', [...filters.providers, provider]);
                          } else {
                            updateFilter('providers', filters.providers.filter(p => p !== provider));
                          }
                        }}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{provider}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => updateFilter('rating', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Any Rating</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </select>
              </div>
            </div>

            {/* Features Filter */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Features
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueFeatures.map(feature => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.features.includes(feature)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFilter('features', [...filters.features, feature]);
                        } else {
                          updateFilter('features', filters.features.filter(f => f !== feature));
                        }
                      }}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setFilters({
                  priceRange: { min: 0, max: 1000 },
                  providers: [],
                  coverageAmount: { min: 0, max: 10000000 },
                  deductible: { min: 0, max: 50000 },
                  rating: 0,
                  features: [],
                  sortBy: 'price',
                  sortOrder: 'asc',
                })}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quote Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAndSortedQuotes.length === 0 ? (
          <div className="text-center py-12 col-span-full">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes match your filters</h3>
            <p className="text-gray-600">Try adjusting your filter criteria to see more results.</p>
          </div>
        ) : (
          filteredAndSortedQuotes.map(quote => (
            <div
              key={quote.id}
              className={`bg-white rounded-lg shadow-md border-2 transition-all duration-200 hover:shadow-lg ${
                selectedQuotes.includes(quote.id)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Quote Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{quote.provider}</h3>
                    <div className="flex items-center mt-1">
                      {renderRatingStars(quote.providerRating)}
                      <span className="ml-2 text-sm text-gray-600">
                        ({quote.providerRating})
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedQuotes.includes(quote.id)}
                    onChange={() => toggleQuoteSelection(quote.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={!selectedQuotes.includes(quote.id) && selectedQuotes.length >= 3}
                  />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(quote.premium)}
                  </div>
                  <div className="text-sm text-gray-600">per month</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatCurrency(quote.annualPremium)} annually
                  </div>
                </div>
              </div>

              {/* Quote Details */}
              <div className="p-6">
                {/* Coverage and Deductible */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Shield className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium text-gray-700">Coverage</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">{quote.coverage}</div>
                  </div>
                  
                  {quote.deductible && (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <DollarSign className="h-4 w-4 text-orange-600 mr-1" />
                        <span className="text-sm font-medium text-gray-700">Deductible</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(quote.deductible)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Risk Score */}
                <div className="flex items-center justify-center mb-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskScoreColor(quote.riskScore)}`}>
                    Risk Score: {quote.riskScore}/10
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Features</h4>
                  <div className="space-y-1">
                    {quote.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                    {quote.features.length > 3 && (
                      <div className="text-sm text-blue-600 cursor-pointer hover:underline">
                        +{quote.features.length - 3} more features
                      </div>
                    )}
                  </div>
                </div>

                {/* Discounts */}
                {quote.discounts.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Applied Discounts</h4>
                    <div className="space-y-1">
                      {quote.discounts.map((discount, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{discount.description}</span>
                          <span className="text-green-600 font-medium">
                            -{discount.amount}{discount.isPercentage ? '%' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => onSelectQuote(quote)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleInterestedInQuote(quote)}
                    disabled={isLoadingRecommendation}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoadingRecommendation ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Interested
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Quotes Comparison Bar */}
      {selectedQuotes.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-4">
                {selectedQuotes.length} quote{selectedQuotes.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                {selectedQuotes.map(quoteId => {
                  const quote = quotes.find(q => q.id === quoteId);
                  return quote ? (
                    <div key={quoteId} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {quote.provider}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedQuotes([])}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setShowComparisonModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                disabled={selectedQuotes.length < 2}
                title={selectedQuotes.length < 2 ? 'Select at least 2 quotes to compare' : ''}
              >
                Compare Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for side-by-side comparison */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full p-8 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setShowComparisonModal(false)}
              aria-label="Close comparison"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Compare Quotes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedQuotes
                .map(id => quotes.find(q => q.id === id))
                .filter(Boolean)
                .map((quote) => quote && (
                  <div key={quote.id} className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-xl font-bold mb-2 text-blue-900">{quote.provider}</h3>
                    <div className="mb-2"><span className="font-semibold">Premium:</span> {formatCurrency(quote.premium)}</div>
                    <div className="mb-2"><span className="font-semibold">Coverage:</span> {quote.coverage}</div>
                    <div className="mb-2"><span className="font-semibold">Deductible:</span> {quote.deductible ? formatCurrency(quote.deductible) : 'N/A'}</div>
                    <div className="mb-2"><span className="font-semibold">Features:</span>
                      <ul className="list-disc ml-5 text-sm">
                        {quote.features.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                    <div className="mb-2"><span className="font-semibold">Exclusions:</span>
                      <ul className="list-disc ml-5 text-sm">
                        {quote.exclusions.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                    <div className="mb-2"><span className="font-semibold">Provider Rating:</span> {quote.providerRating} / 5</div>
                    <div className="mb-2"><span className="font-semibold">Risk Score:</span> {quote.riskScore} / 10</div>
                    <div className="mb-2"><span className="font-semibold">Valid Until:</span> {quote.validUntil.toLocaleDateString()}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Modal */}
      {showRecommendationModal && recommendation && interestedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Quote Recommendation</h2>
                <button
                  onClick={() => setShowRecommendationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Your Interested Quote */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Quote You're Interested In
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Provider: <span className="font-semibold">{interestedQuote.provider}</span></p>
                      <p className="text-sm text-gray-600">Monthly Premium: <span className="font-semibold text-lg">R{interestedQuote.premium.toFixed(2)}</span></p>
                      <p className="text-sm text-gray-600">Annual Premium: <span className="font-semibold">R{interestedQuote.annualPremium.toFixed(2)}</span></p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Coverage: <span className="font-semibold">{interestedQuote.coverage}</span></p>
                      <p className="text-sm text-gray-600">Provider Rating: <span className="font-semibold">{interestedQuote.providerRating}/5 ⭐</span></p>
                      <p className="text-sm text-gray-600">Risk Score: <span className="font-semibold">{interestedQuote.riskScore}/10</span></p>
                    </div>
                  </div>
                </div>

                {/* Our Recommendation */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Our Recommendation (Score: {recommendation.score}/100)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Provider: <span className="font-semibold">{recommendation.recommendedQuote.provider}</span></p>
                      <p className="text-sm text-gray-600">Monthly Premium: <span className="font-semibold text-lg">R{recommendation.recommendedQuote.premium.toFixed(2)}</span></p>
                      <p className="text-sm text-gray-600">Annual Premium: <span className="font-semibold">R{recommendation.recommendedQuote.annualPremium.toFixed(2)}</span></p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Coverage: <span className="font-semibold">{recommendation.recommendedQuote.coverage}</span></p>
                      <p className="text-sm text-gray-600">Provider Rating: <span className="font-semibold">{recommendation.recommendedQuote.providerRating}/5 ⭐</span></p>
                      <p className="text-sm text-gray-600">Risk Score: <span className="font-semibold">{recommendation.recommendedQuote.riskScore}/10</span></p>
                    </div>
                  </div>

                  {/* Recommendation Reasons */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Why we recommend this:</h4>
                    <ul className="space-y-1">
                      {recommendation.reasons.map((reason, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Comparison Summary */}
                {interestedQuote.id !== recommendation.recommendedQuote.id && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-3">Comparison Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-gray-800">Monthly Premium Difference:</p>
                        <p className={`font-bold ${recommendation.recommendedQuote.premium < interestedQuote.premium ? 'text-green-600' : 'text-red-600'}`}>
                          {recommendation.recommendedQuote.premium < interestedQuote.premium ? '-' : '+'}R
                          {Math.abs(recommendation.recommendedQuote.premium - interestedQuote.premium).toFixed(2)}
                          {recommendation.recommendedQuote.premium < interestedQuote.premium ? ' (Better value)' : ' (More premium)'}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Annual Cost Difference:</p>
                        <p className={`font-bold ${recommendation.recommendedQuote.annualPremium < interestedQuote.annualPremium ? 'text-green-600' : 'text-red-600'}`}>
                          {recommendation.recommendedQuote.annualPremium < interestedQuote.annualPremium ? 'Lower by ' : 'Higher by '}R
                          {Math.abs(recommendation.recommendedQuote.annualPremium - interestedQuote.annualPremium).toFixed(2)}
                          {recommendation.recommendedQuote.annualPremium < interestedQuote.annualPremium ? ' per year' : ' more per year'}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Rating Comparison:</p>
                        <p className={`font-bold ${recommendation.recommendedQuote.providerRating > interestedQuote.providerRating ? 'text-green-600' : recommendation.recommendedQuote.providerRating < interestedQuote.providerRating ? 'text-red-600' : 'text-gray-600'}`}>
                          {recommendation.recommendedQuote.providerRating > interestedQuote.providerRating ? 'Higher' : recommendation.recommendedQuote.providerRating < interestedQuote.providerRating ? 'Lower' : 'Same'} rated
                          ({recommendation.recommendedQuote.providerRating} vs {interestedQuote.providerRating})
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => handleUserChoice('proceed')}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Proceed with My Choice
                  </button>
                  {interestedQuote.id !== recommendation.recommendedQuote.id && (
                    <button
                      onClick={() => handleUserChoice('change')}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Change to Recommended
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Representative Assignment Modal */}
      {showRepresentativeModal && assignedRepresentative && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="text-center mb-6">
                {isLoadingRecommendation ? (
                  <div className="flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Assigning Representative...</h2>
                  </div>
                ) : (
                  <div>
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Representative Assigned!</h2>
                  </div>
                )}
              </div>

              {!isLoadingRecommendation && (
                <div className="space-y-4">
                  {/* User ID */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Your Unique Reference ID</h3>
                    <p className="text-lg font-mono font-bold text-blue-800">{userId}</p>
                    <p className="text-sm text-blue-600 mt-1">Please keep this ID for tracking your application progress</p>
                  </div>

                  {/* Representative Details */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Your Assigned Representative
                    </h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {assignedRepresentative.name} {assignedRepresentative.surname}</p>
                      <p className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">Email:</span> 
                        <span className="ml-1">{assignedRepresentative.email}</span>
                      </p>
                      <p><span className="font-medium">Rating:</span> {assignedRepresentative.rating}/5 ⭐</p>
                      <p><span className="font-medium">Specialization:</span> {assignedRepresentative.specializations.join(', ')}</p>
                    </div>
                  </div>

                  {/* Quote Status */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">Quote Status</h3>
                    <p className="text-sm text-yellow-800">
                      <strong>Selected Quote:</strong> {userChoice === 'change' ? recommendation?.recommendedQuote.provider : interestedQuote?.provider}
                    </p>
                    <p className="text-sm text-yellow-800">
                      <strong>Status:</strong> {
                        interestedQuote?.id === recommendation?.recommendedQuote.id 
                          ? 'Same as Recommendation' 
                          : userChoice === 'change' 
                            ? 'Recommended' 
                            : 'Not Recommended'
                      }
                    </p>
                    <div className="mt-3 text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
                      <strong>Quote Details:</strong>
                      <pre className="whitespace-pre-wrap mt-1 font-mono text-xs">
                        {formatQuoteDetails(userChoice === 'change' ? recommendation!.recommendedQuote : interestedQuote!)}
                      </pre>
                    </div>
                  </div>

                  {/* Expected Timeline */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Expected Timeline
                    </h3>
                    <p className="text-sm text-green-800">
                      You can expect feedback from your representative within <strong>3 business days</strong>.
                    </p>
                    <p className="text-sm text-green-800">
                      Expected response by: <strong>{calculateBusinessDays(new Date(), 3).toLocaleDateString()}</strong>
                    </p>
                  </div>

                  {/* Proceed Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleFinalProceed}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Proceed
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Final Confirmation Modal */}
      {showFinalConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
              
              <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700">
                  <strong>✅ Your application has been successfully sent to your assigned representative for further review.</strong>
                </p>
                <p className="text-gray-700">
                  <strong>📅 Expected Response:</strong> You can expect feedback within 3 business days.
                </p>
                <p className="text-gray-700">
                  <strong>📞 Need Help?</strong> If the expected timeframe passes without hearing from us, please contact our customer support.
                </p>
                <p className="text-gray-700">
                  <strong>🔍 Track Progress:</strong> Use your reference ID <code className="bg-blue-100 px-2 py-1 rounded font-mono">{userId}</code> when contacting us.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowFinalConfirmation(false);
                  // Reset all states
                  setInterestedQuote(null);
                  setRecommendation(null);
                  setAssignedRepresentative(null);
                  setUserChoice(null);
                  setUserId('');
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}