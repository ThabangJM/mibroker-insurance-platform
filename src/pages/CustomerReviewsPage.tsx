import { Star, Quote, ThumbsUp, Shield } from 'lucide-react';

interface Review {
  name: string;
  location: string;
  insuranceType: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
}

export default function CustomerReviewsPage() {
  const reviews: Review[] = [
    {
      name: 'Thabo M.',
      location: 'Johannesburg, Gauteng',
      insuranceType: 'Car Insurance',
      rating: 5,
      title: 'Best car insurance experience ever',
      comment:
        'MiBroker made finding affordable car insurance so easy. My representative was professional and helped me compare options I never even knew existed. I ended up saving over R300 a month!',
      date: '12 January 2026',
    },
    {
      name: 'Sarah van der Merwe',
      location: 'Cape Town, Western Cape',
      insuranceType: 'Buildings Insurance',
      rating: 5,
      title: 'Professional and thorough service',
      comment:
        'I was amazed at how quickly I was contacted after submitting my request. The advisor took the time to understand my property and found me comprehensive cover at a great price.',
      date: '28 December 2025',
    },
    {
      name: 'Priya N.',
      location: 'Durban, KwaZulu-Natal',
      insuranceType: 'Small Business Insurance',
      rating: 4,
      title: 'Great support for my business',
      comment:
        'As a small business owner, insurance felt overwhelming. MiBroker simplified everything — from liability to asset cover. My dedicated rep answered every question patiently.',
      date: '15 November 2025',
    },
    {
      name: 'James K.',
      location: 'Pretoria, Gauteng',
      insuranceType: 'Household Contents',
      rating: 5,
      title: 'Quick, easy and no hassle',
      comment:
        'I filled in the form, got a call the next day, and had my policy sorted within the week. The whole process was smooth and transparent. Highly recommend MiBroker!',
      date: '3 February 2026',
    },
    {
      name: 'Nomsa D.',
      location: 'Bloemfontein, Free State',
      insuranceType: 'E-Hailing Insurance',
      rating: 5,
      title: 'Finally, proper e-hailing cover!',
      comment:
        'Finding insurance for my Uber vehicle was a nightmare until I found MiBroker. They connected me with a specialist who understood e-hailing and got me the right cover.',
      date: '20 January 2026',
    },
    {
      name: 'Michael R.',
      location: 'East London, Eastern Cape',
      insuranceType: 'Commercial Property',
      rating: 4,
      title: 'Solid commercial cover',
      comment:
        'We needed insurance for our warehouse and office space. The representative was knowledgeable about commercial property risks and provided competitive quotes from multiple insurers.',
      date: '8 October 2025',
    },
    {
      name: 'Fatima A.',
      location: 'Sandton, Gauteng',
      insuranceType: 'Transport Insurance',
      rating: 5,
      title: 'Fleet insurance made simple',
      comment:
        'Managing insurance for our fleet of delivery vehicles used to be a headache. MiBroker streamlined everything and our representative handles renewals and claims support too.',
      date: '14 December 2025',
    },
    {
      name: 'David L.',
      location: 'Stellenbosch, Western Cape',
      insuranceType: 'Car Insurance',
      rating: 4,
      title: 'Good value, great service',
      comment:
        'Switched from my previous insurer after comparing quotes through MiBroker. Better coverage at a lower premium. The online form was straightforward and my advisor was helpful.',
      date: '5 January 2026',
    },
  ];

  const stats = [
    { label: 'Happy Customers', value: '10,000+' },
    { label: 'Average Rating', value: '4.8/5' },
    { label: 'Insurance Types', value: '12+' },
    { label: 'Partner Insurers', value: '20+' },
  ];

  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Customer Reviews</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Don't just take our word for it — hear from real South Africans who found the right
            insurance through MiBroker.
          </p>
          {/* Overall Rating */}
          <div className="mt-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(Number(averageRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold">{averageRating} out of 5</span>
            <span className="text-blue-200">({reviews.length} reviews)</span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl lg:text-3xl font-bold text-blue-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col"
              >
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-blue-100 mb-3" />

                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>

                {/* Title & Comment */}
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{review.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4">{review.comment}</p>

                {/* Divider */}
                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{review.name}</p>
                      <p className="text-xs text-gray-500">{review.location}</p>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {review.insuranceType}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{review.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-blue-900" />
            <ThumbsUp className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Thousands</h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            We're proud to have helped thousands of South Africans find the right insurance
            coverage. Our commitment to transparency, expert advice, and personalised service keeps
            our customers coming back.
          </p>
        </div>
      </section>
    </div>
  );
}
