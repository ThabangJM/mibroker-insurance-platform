import { 
  Shield, 
  Award, 
  Users, 
  Target, 
  CheckCircle,
  Star,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About MiBroker SA
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              A Financial Advisor Who Wants Only the Best For You!
            </p>
            <p className="text-lg text-blue-200 max-w-4xl mx-auto mt-4">
              We provide Financial Advice in the Short Term Insurance Industry. We apply our skills and extensive knowledge in insurance to help our clients manage risk and guide them to get the right financial protection for their assets.
            </p>
          </div>
        </div>
      </div>

      {/* Company Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  MiBroker SA is an Authorised Financial Services Provider with FSP number: 51626. 
                  We are a 100% black-owned company committed to providing exceptional financial advisory services in the short-term insurance industry.
                </p>
                <p>
                  Our experienced sales team brings over 12 years of expertise in Short Term Insurance, 
                  specializing in comprehensive risk management solutions for individuals and businesses.
                </p>
                <p>
                  We don't just sell insurance – we build lasting relationships by understanding your unique needs 
                  and providing tailored solutions that truly protect what matters most to you.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">Our Credentials</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-green-600 mr-3" />
                  <span>FSP License #51626</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-3" />
                  <span>12+ Years Experience</span>
                </div>
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-purple-600 mr-3" />
                  <span>100% Black-Owned Business</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why People Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We are experts in Short Term Insurance with a commitment to quality, expertise, and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Quality Advice & Service */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="text-center">
                <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Quality Advice & Service
                </h3>
                <p className="text-gray-600">
                  We put quality at the center of our work and our clients benefit from the exceptional work we do!
                </p>
              </div>
            </div>

            {/* Right Cover Knowledge */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="text-center">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  We Know The Right Cover for You
                </h3>
                <p className="text-gray-600">
                  We have been in the insurance industry long enough to know which financial products are suitable for you.
                </p>
              </div>
            </div>

            {/* Risk Management */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="text-center">
                <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  We Help You Manage Risk
                </h3>
                <p className="text-gray-600">
                  Risk management goes beyond insurance. We help you create comprehensive risk management plans.
                </p>
              </div>
            </div>

            {/* Best Interest */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="text-center">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  We Want The Best for You
                </h3>
                <p className="text-gray-600">
                  We don't rush you to make quick financial decisions but patiently assist you to make the right decisions!
                </p>
              </div>
            </div>

            {/* Negotiation Skills */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="text-center">
                <Award className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Exceptional Negotiation Skills
                </h3>
                <p className="text-gray-600">
                  We are the best at negotiating with product suppliers on your behalf.
                </p>
              </div>
            </div>

            {/* Claims Support */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  We Negotiate Rejected Claims
                </h3>
                <p className="text-gray-600">
                  We don't give up when claims are rejected. We step in to ensure decisions align with policy contracts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Specialized Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              With over 12 years of experience, we specialize in a comprehensive range of short-term insurance products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Car Insurance',
              'Home Insurance', 
              'Small Business Insurance',
              'Commercial Property',
              'Mining Rehabilitation Guarantees',
              'Body Corporates',
              'Transport Insurance',
              'Public Liability',
              'Engineering & Construction Insurance',
              'Aviation and Marine Insurance'
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <span className="font-medium text-gray-900">{service}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Ready to protect what matters most? Contact our experienced team today for personalized insurance solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-gray-800 rounded-lg p-6">
              <Phone className="h-8 w-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-300">087 236 3095</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <Mail className="h-8 w-8 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-300">admin@mibrokersa.co.za</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <MapPin className="h-8 w-8 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-300">South Africa</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <a
              href="/quote"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Your Quote Today
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;