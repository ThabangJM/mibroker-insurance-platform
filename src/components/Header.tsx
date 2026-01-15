import { useState } from 'react';
import { Shield, Menu, X, User, Phone, BarChart3, FileText, LogOut } from 'lucide-react';
// import { LoginModal } from './LoginModal'; // DISABLED: LoginModal import commented out
import { InsuranceType } from '../types';

// Navigation links array for DRY principle
const navigationItems = [
  { label: 'Car Insurance', type: 'auto' as InsuranceType },
  { label: 'Buildings Insurance', type: 'buildings-insurance' as InsuranceType },
  { label: 'Household Contents', type: 'household-contents' as InsuranceType },
  { label: 'Business Insurance', type: 'small-business' as InsuranceType },
  { label: 'E-Hailing Insurance', type: 'e-hailing' as InsuranceType },
];
import { User as UserType } from '../types';

interface HeaderProps {
  user: UserType | null;
  // onLogin: (user: UserType) => void; // DISABLED: Login callback commented out
  onDashboard: () => void;
  onHome: () => void;
  onAnalytics: () => void;
  onPolicies: () => void;
  onInsuranceTypeSelect: (type: InsuranceType) => void;
}

export function Header({ user, onDashboard, onHome, onAnalytics, onPolicies, onInsuranceTypeSelect }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // DISABLED: Login modal state commented out

  // DISABLED: Login handler commented out
  // const handleLogin = (userData: UserType) => {
  //   onLogin(userData);
  //   setIsLoginModalOpen(false);
  // };

  return (
    <>
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={onHome}>
              <Shield className="h-8 w-8 text-blue-900 mr-2" />
              <span className="text-xl font-bold text-gray-900">MiBroker</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((link) => (
                <button
                  key={link.label}
                  onClick={() => onInsuranceTypeSelect(link.type)}
                  className="text-gray-700 hover:text-blue-900 font-medium transition-colors duration-200"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Contact & User Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center text-gray-600 mr-4">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">0860 642 765</span>
              </div>
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onDashboard}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-900 transition-colors duration-200"
                  >
                    <User className="h-4 w-4" />
                    <span className="font-medium">{user?.name}</span>
                  </button>
                  <button
                    onClick={onPolicies}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-900 transition-colors duration-200"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Policies</span>
                  </button>
                  <button
                    onClick={onAnalytics}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-900 transition-colors duration-200"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="font-medium">Analytics</span>
                  </button>
                  <button
                    aria-label="Logout"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors duration-200"
                    // onClick={onLogout} // Uncomment and implement onLogout if needed
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  // onClick={() => setIsLoginModalOpen(true)} // DISABLED: Sign in functionality commented out
                  className="bg-gray-400 cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium opacity-50"
                  disabled
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-900 transition-colors duration-200"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-3 space-y-3">
              {navigationItems.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    onInsuranceTypeSelect(link.type);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-gray-700 hover:text-blue-900 font-medium"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center text-gray-600 mb-3">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">0860 642 765</span>
                </div>
                
                {user ? (
                  <>
                    <button
                      onClick={onDashboard}
                      className="block w-full text-left py-2 text-gray-700 hover:text-blue-900 font-medium"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={onPolicies}
                      className="block w-full text-left py-2 text-gray-700 hover:text-blue-900 font-medium"
                    >
                      Policies
                    </button>
                    <button
                      onClick={onAnalytics}
                      className="block w-full text-left py-2 text-gray-700 hover:text-blue-900 font-medium"
                    >
                      Analytics
                    </button>
                  </>
                ) : (
                  <button
                    // onClick={() => setIsLoginModalOpen(true)} // DISABLED: Sign in functionality commented out
                    className="block w-full bg-gray-400 cursor-not-allowed text-white py-3 rounded-lg font-medium opacity-50"
                    disabled
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* DISABLED: LoginModal functionality commented out */}
      {/* <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      /> */}
    </>
  );
}