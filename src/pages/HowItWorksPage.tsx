import { Shield, FileText, Users, CheckCircle, ArrowRight, Phone, MessageSquare, ClipboardList } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      icon: ClipboardList,
      title: 'Choose Your Insurance Type',
      description:
        "Browse our wide range of insurance products - from car and home insurance to business, transport, and specialised cover. Select the type that fits your needs.",
      color: 'bg-blue-100 text-blue-700',
    },
    {
      number: '02',
      icon: FileText,
      title: 'Complete the Quote Form',
      description:
        "Fill in your details through our simple, guided quote form. We'll ask relevant questions to understand your needs and ensure accurate, tailored quotes.",
      color: 'bg-orange-100 text-orange-700',
    },
    {
      number: '03',
      icon: Users,
      title: 'Get Matched with a Representative',
      description:
        "We automatically assign a qualified insurance advisor who specialises in your chosen cover. They'll review your information and prepare personalised quotes.",
      color: 'bg-green-100 text-green-700',
    },
    {
      number: '04',
      icon: Phone,
      title: 'Receive Your Quotes',
      description:
        'Your dedicated representative will contact you within 24 hours with competitive quotes from trusted South African insurers, tailored to your specific requirements.',
      color: 'bg-purple-100 text-purple-700',
    },
    {
      number: '05',
      icon: CheckCircle,
      title: 'Choose & Get Covered',
      description:
        "Compare your options, ask questions, and choose the policy that's right for you. Your representative will handle the paperwork and get you covered.",
      color: 'bg-teal-100 text-teal-700',
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Trusted Providers',
      description: "We partner with South Africa's leading insurance companies to bring you reliable cover.",
    },
    {
      icon: MessageSquare,
      title: 'Expert Advice',
      description: 'Our qualified advisors help you understand your options and make informed decisions.',
    },
    {
      icon: Users,
      title: 'Personal Service',
      description: 'A dedicated representative is assigned to your request from start to finish.',
    },
    {
      icon: CheckCircle,
      title: 'No Obligation',
      description: 'Get quotes for free with no obligation to purchase. Compare at your own pace.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">How It Works</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Getting the right insurance cover has never been easier. Follow our simple process and
            let us do the heavy lifting for you.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex flex-col md:flex-row items-start gap-6">
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0 flex items-center gap-4">
                    <span className="text-4xl font-bold text-gray-200">{step.number}</span>
                    <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center`}>
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>

                  {/* Arrow (not on last step) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:flex items-center justify-center mt-4">
                      <ArrowRight className="w-5 h-5 text-gray-300 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose MiBroker?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make insurance simple, transparent, and personalised so you can focus on what matters most.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-200">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-blue-700" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-blue-200 mb-8 text-lg">
            Choose your insurance type on our homepage and get your personalised quotes today.
          </p>
        </div>
      </section>
    </div>
  );
}
