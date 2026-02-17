import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { InsuranceTypes } from './components/InsuranceTypes';
import { QuoteForm } from './components/QuoteForm';
import { Dashboard } from './components/Dashboard';
import { QuoteComparison } from './components/QuoteComparison';
import AnalyticsPage from './pages/AnalyticsPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import CustomerReviewsPage from './pages/CustomerReviewsPage';
import { PolicyManagement } from './components/PolicyManagement';
import { Footer } from './components/Footer';
import { CheckCircle, Clock } from 'lucide-react';

import { Quote, User, InsuranceType, Representative } from './types';
// import { quoteApi } from './services/api'; // Commented out - not used in current flow
import { assignRepresentative } from './services/recommendationService';
import { NotificationProvider } from './components/NotificationCenter';


function App() {
    // State to track which view is currently active (home, quote form, dashboard, etc.)
  const [currentView, setCurrentView] = useState<'home' | 'quote' | 'dashboard' | 'comparison' | 'analytics' | 'policies' | 'about' | 'how-it-works' | 'customer-reviews' | 'representative-assignment' | 'thank-you'>('home');

  // State to track which insurance type user selected
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<InsuranceType | null>(null);

  // State to store user information
  const [user] = useState<User | null>(null); // setUser commented out - login disabled

  // State to store fetched quotes
  const [quotes] = useState<Quote[]>([]); // setQuotes commented out - not used in current flow

  // State for loading quotes  
  const [quotesLoading] = useState(false); // setQuotesLoading commented out - not used in current flow

  // State to store form data for recommendations
  const [formData, setFormData] = useState<any>(null);

  // State for representative assignment
  const [assignedRepresentative, setAssignedRepresentative] = useState<Representative | null>(null);


  // Function called when user selects an insurance type from the homepage
  const handleInsuranceTypeSelect = (type: InsuranceType) => {
    setSelectedInsuranceType(type);
    // Directly start assigning representative (skip the explanation screen)
    handleRepresentativeAssignment();
  };

  // Function to assign representative and then proceed to quote form
  const handleRepresentativeAssignment = async () => {
    setCurrentView('representative-assignment'); // Show the loading screen
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
      // Use the existing representative assignment service
      const representative = assignRepresentative(selectedInsuranceType!);
      setAssignedRepresentative(representative);
      
      // Wait a bit to show the assignment process
      setTimeout(() => {
        setCurrentView('quote');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 2000);
    } catch (error) {
      console.error('Error assigning representative:', error);
      // Still proceed to quote form even if assignment fails
      setCurrentView('quote');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };



  // Function called when user submits the quote form
  const handleQuoteSubmit = async (quoteData: any) => {
    // Store form data for later use
    setFormData(quoteData);
    
    // First show thank you message
    setCurrentView('thank-you');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // COMMENTED OUT: Automatic quote generation (Step 4 & 5 of flow)
    // Wait 3 seconds, then start generating quotes
    // setTimeout(() => {
    //   handleGenerateQuotes(quoteData);
    // }, 3000);
  };

  // COMMENTED OUT: Separate function to handle quote generation (Step 4 & 5 of flow)
  // const handleGenerateQuotes = async (quoteData: any) => {
  //   try {
  //     setQuotesLoading(true);
  //     
  //     // Prepare quote request with user and form data
  //     const quoteRequest = {
  //       userId: user?.id || 'anonymous',
  //       type: selectedInsuranceType!,
  //       metadata: quoteData,
  //     };
  //     
  //     // Call API to generate quotes
  //     const response = await quoteApi.generateQuotes(quoteRequest);
  //     
  //     if (response.success && response.data) {
  //       // Add the new quotes to the existing quotes array
  //       setQuotes(prev => [...prev, ...(response.data ?? [])]);
  //       // Navigate to comparison view to show the generated quotes
  //       setCurrentView('comparison');
  //     } else {
  //       alert('Failed to generate quotes. Please try again.');
  //       console.error('Quote generation failed:', response.error);
  //       setCurrentView('quote'); // Go back to quote form on error
  //     }
  //   } catch (error) {
  //     alert('An error occurred while generating quotes. Please try again.');
  //     console.error('Quote generation error:', error);
  //     setCurrentView('quote'); // Go back to quote form on error
  //   } finally {
  //     setQuotesLoading(false);
  //   }
  // };

  // DISABLED: Login functionality commented out
  // const handleUserLogin = (userData: User) => {
  //   // Store the user data in state
  //   setUser(userData);
  // };

  // Function to handle quote selection from comparison view
  const handleSelectQuote = () => {
    // Navigate to dashboard with selected quote
    setCurrentView('dashboard');
  };

  // Function to handle quote purchase from comparison view
  const handlePurchaseQuote = (quote: Quote) => {
    // In a real app, this would initiate the purchase process
    // For now, we'll just show an alert and navigate to dashboard
    alert(`Purchase process initiated for ${quote.provider} quote!`);
    setCurrentView('dashboard');
  };

  // Function to render the thank you view
  const renderThankYouView = () => (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* Thank You Message */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You for Your Request!
            </h2>
            
            <p className="text-lg text-gray-600 mb-6">
              We've received your {selectedInsuranceType?.replace('-', ' ')} insurance quote request and our team is now working on finding you the best possible quotes.
            </p>

            {/* What happens next */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900">What happens next?</h3>
              </div>
              <div className="text-left space-y-3 text-blue-800">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Your request has been successfully submitted</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Your assigned representative will review your information</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <span>They will contact you within 24 hours with personalized quotes</span>
                </div>
              </div>
            </div>

            {/* Representative Info */}
            {assignedRepresentative && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Dedicated Representative</h3>
                <p className="text-gray-700">
                  <strong>{assignedRepresentative.name} {assignedRepresentative.surname}</strong> will be handling your request and is available to answer any questions you may have.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Email: {assignedRepresentative.email}
                </p>
              </div>
            )}

            {/* Final Message */}
            <div className="text-center">
              <p className="text-gray-600 font-medium">
                Thank you for choosing MiBroker. We'll be in touch soon!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Function to render the representative assignment view
  const renderRepresentativeAssignment = () => (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Assignment in Progress Screen */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Assigning Your Representative
            </h2>
            <p className="text-gray-600 mb-8">
              We're finding the perfect insurance expert for your {selectedInsuranceType?.replace('-', ' ')} needs...
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-center space-x-2 text-blue-800">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-blue-800 mt-4 font-medium">
                Matching you with a specialist...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Function to render the appropriate view based on current state
  const renderCurrentView = () => {
    switch (currentView) {
      case 'quote':
        return (
          <QuoteForm
            insuranceType={selectedInsuranceType!}
            onSubmit={handleQuoteSubmit}
            onBack={() => setCurrentView('home')}
            loading={quotesLoading}
            assignedRepresentative={assignedRepresentative}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            quotes={quotes}
            user={user}
            onBack={() => setCurrentView('home')}
            onNewQuote={() => setCurrentView('home')}
          />
        );
      case 'comparison':
        return (
          <QuoteComparison
            quotes={quotes}
            onSelectQuote={handleSelectQuote}
            onPurchaseQuote={handlePurchaseQuote}
            formData={formData}
            insuranceType={selectedInsuranceType || undefined}
          />
        );
      case 'analytics':
        return <AnalyticsPage />;
      case 'about':
        return <AboutPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'customer-reviews':
        return <CustomerReviewsPage />;
      case 'representative-assignment':
        return renderRepresentativeAssignment();
      case 'policies':
        return (
          <PolicyManagement
            userId={user?.id || 'anonymous'}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'thank-you':
        return renderThankYouView();
      default:
        return (
          <>
            <Hero 
              onGetQuote={() => {
                // Scroll to insurance types section
                const insuranceTypesElement = document.getElementById('insurance-types');
                if (insuranceTypesElement) {
                  insuranceTypesElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onLearnMore={() => {
                setCurrentView('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <InsuranceTypes onSelect={handleInsuranceTypeSelect} />
          </>
        );
    }
  };

  // Main app render - includes header, main content, and footer
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header component with navigation and user controls */}
        <Header
          user={user}
          // onLogin={handleUserLogin} // DISABLED: Login functionality commented out
          onDashboard={() => setCurrentView('dashboard')}
          onHome={() => setCurrentView('home')}
          onAnalytics={() => setCurrentView('analytics')}
          onPolicies={() => setCurrentView('policies')}
          onInsuranceTypeSelect={handleInsuranceTypeSelect}
        />
        {/* Main content area with top padding to account for fixed header */}
        <main className="pt-16">
          {renderCurrentView()}
        </main>
        {/* Footer component with company information and links */}
        <Footer
          onInsuranceTypeSelect={handleInsuranceTypeSelect}
          onNavigate={(page: string) => {
            setCurrentView(page as any);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    </NotificationProvider>
  );
}

export default App;