import { Shield, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { InsuranceType } from '../types';

interface FooterProps {
  onInsuranceTypeSelect: (type: InsuranceType) => void;
}

export function Footer({ onInsuranceTypeSelect }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 text-orange-400 mr-3" />
              <span className="text-2xl font-bold">MiBroker</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              South Africa's leading insurance comparison platform. We help you find the best 
              insurance coverage at competitive rates from trusted providers.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-orange-400 mr-3" />
                <span className="text-gray-300">0860 642 765</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-orange-400 mr-3" />
                <span className="text-gray-300">info@mibroker.co.za</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-orange-400 mr-3" />
                <span className="text-gray-300">Johannesburg, South Africa</span>
              </div>
            </div>
          </div>

          {/* Insurance Types */}
          <div>
            <h3 className="text-lg font-bold mb-6">Insurance Types</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => onInsuranceTypeSelect('auto')}
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
                >
                  Car Insurance
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onInsuranceTypeSelect('buildings-insurance')}
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
                >
                  Buildings Insurance
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onInsuranceTypeSelect('household-contents')}
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
                >
                  Household Contents
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onInsuranceTypeSelect('commercial-property')}
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
                >
                  Commercial Property
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onInsuranceTypeSelect('public-liability')}
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
                >
                  Public Liability
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onInsuranceTypeSelect('small-business')}
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
                >
                  Business Insurance
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onInsuranceTypeSelect('mining-rehabilitation')}
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
                >
                  Mining Rehabilitation
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onInsuranceTypeSelect('e-hailing')}
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
                >
                  E-Hailing Insurance
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-bold mb-6">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Customer Reviews
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Careers
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Newsletter */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-6 lg:mb-0">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <span className="text-gray-300 text-sm">Stay updated with insurance tips:</span>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                />
                <button className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-r-lg font-medium transition-colors duration-200">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 MiBroker. All rights reserved. FSP License #12345
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                POPIA Compliance
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}