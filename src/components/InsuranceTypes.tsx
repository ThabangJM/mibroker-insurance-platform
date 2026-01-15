import { Car, Home, Shield, Building, ArrowRight, Truck, Users, HardHat, Plane, Package, Mountain } from 'lucide-react';
import { InsuranceType } from '../types';

interface InsuranceTypesProps {
  onSelect: (type: InsuranceType) => void;
}

export function InsuranceTypes({ onSelect }: InsuranceTypesProps) {
  const insuranceTypes = [
    {
      type: 'auto' as InsuranceType,
      title: 'Car Insurance',
      description: 'Comprehensive vehicle cover with competitive rates from top South African insurers',
      icon: Car,
      color: 'from-blue-500 to-blue-600',
      highlight: 'Fast Claims',
    },
    {
      type: 'buildings-insurance' as InsuranceType,
      title: 'Buildings Insurance',
      description: 'Protect the structure of your home, garage, and permanent fixtures against damage',
      icon: Home,
      color: 'from-green-500 to-green-600',
      highlight: 'Structural Cover',
    },
    {
      type: 'household-contents' as InsuranceType,
      title: 'Household Contents',
      description: 'Comprehensive coverage for your furniture, electronics, and personal belongings',
      icon: Package,
      color: 'from-emerald-500 to-emerald-600',
      highlight: 'Contents Cover',
    },
    {
      type: 'public-liability' as InsuranceType,
      title: 'Public Liability',
      description: 'Protect your business against third-party claims and legal liability costs',
      icon: Shield,
      color: 'from-indigo-500 to-indigo-600',
      highlight: 'Legal Protection',
    },
    {
      type: 'small-business' as InsuranceType,
      title: 'Small Business Insurance',
      description: 'Comprehensive business insurance to protect your company, assets, and operations',
      icon: Building,
      color: 'from-orange-500 to-orange-600',
      highlight: 'Complete Cover',
    },
    {
      type: 'commercial-property' as InsuranceType,
      title: 'Commercial Property',
      description: 'Specialized coverage for commercial buildings, warehouses, and industrial properties',
      icon: Building,
      color: 'from-purple-500 to-purple-600',
      highlight: 'Premium Support',
    },
    {
      type: 'transport-insurance' as InsuranceType,
      title: 'Transport Insurance',
      description: 'Comprehensive coverage for commercial transport, fleet, and logistics operations',
      icon: Truck,
      color: 'from-red-500 to-red-600',
      highlight: 'Fleet Excellence',
    },
    {
      type: 'body-corporates' as InsuranceType,
      title: 'Body Corporates',
      description: 'Specialized insurance coverage for sectional title schemes and body corporate entities',
      icon: Users,
      color: 'from-teal-500 to-teal-600',
      highlight: 'Community First',
    },
    {
      type: 'engineering-construction' as InsuranceType,
      title: 'Engineering & Construction',
      description: 'Comprehensive coverage for construction projects, contractors, and engineering works',
      icon: HardHat,
      color: 'from-amber-500 to-amber-600',
      highlight: 'Project Security',
    },
    {
      type: 'aviation-marine' as InsuranceType,
      title: 'Aviation & Marine',
      description: 'Specialized insurance for aviation, marine vessels, and high-value transportation',
      icon: Plane,
      color: 'from-cyan-500 to-cyan-600',
      highlight: 'Expert Care',
    },
    {
      type: 'mining-rehabilitation' as InsuranceType,
      title: 'Mining Rehabilitation Guarantees',
      description: 'Environmental rehabilitation guarantees for mining operations and compliance',
      icon: Mountain,
      color: 'from-stone-500 to-stone-600',
      highlight: 'Environmental Cover',
    },
    {
      type: 'e-hailing' as InsuranceType,
      title: 'E-Hailing Insurance',
      description: 'Comprehensive coverage for Uber, Bolt, and other ride-hailing drivers',
      icon: Car,
      color: 'from-purple-500 to-purple-600',
      highlight: 'Driver Protection',
    },
  ];

  return (
    <section id="insurance-types" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Compare Insurance Quotes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get competitive quotes from South Africa's leading insurance providers. 
            Compare coverage options and find quality protection with reliable claims support.
          </p>
        </div>

        {/* Featured Insurance Cards - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {insuranceTypes.slice(0, 3).map((insurance) => {
            const Icon = insurance.icon;
            return (
              <div
                key={insurance.type + insurance.title}
                onClick={() => onSelect(insurance.type)}
                className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
              >
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${insurance.color}`}></div>
                
                <div className="p-8">
                  {/* Icon and Badge */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${insurance.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {insurance.highlight}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {insurance.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {insurance.description}
                  </p>
                  
                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-blue-900 font-semibold group-hover:text-orange-500 transition-colors duration-200">
                      Get Free Quote
                    </span>
                    <ArrowRight className="h-5 w-5 text-blue-900 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Business Insurance Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              Business & Commercial Insurance
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Specialized coverage solutions for businesses of all sizes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insuranceTypes.slice(3).map((insurance) => {
              const Icon = insurance.icon;
              return (
                <div
                  key={insurance.type + insurance.title}
                  onClick={() => onSelect(insurance.type)}
                  className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
                >
                  {/* Gradient Header */}
                  <div className={`h-1.5 bg-gradient-to-r ${insurance.color}`}></div>
                  
                  <div className="p-6">
                    {/* Icon and Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${insurance.color} rounded-lg flex items-center justify-center shadow-md`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="bg-blue-50 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {insurance.highlight}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {insurance.title}
                    </h4>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {insurance.description}
                    </p>
                    
                    {/* CTA */}
                    <div className="flex items-center justify-between">
                      <span className="text-blue-900 font-medium text-sm group-hover:text-orange-500 transition-colors duration-200">
                        Get Quote
                      </span>
                      <ArrowRight className="h-4 w-4 text-blue-900 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 text-center border border-gray-100">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Not sure which insurance you need?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Speak to one of our qualified insurance advisors. We'll help you find the perfect coverage for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200">
              Call Me Back
            </button>
            <button className="border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200">
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}