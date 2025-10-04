const express = require('express');
const router = express.Router();

// Mock data for insurance providers
const providers = [
  {
    id: 'santam',
    name: 'Santam',
    logo: '/logos/santam.png',
    rating: 4.3,
    reviews: 2847,
    website: 'https://www.santam.co.za',
    phone: '0860 44 44 44',
    email: 'info@santam.co.za',
    licenseNumber: 'FSP3416',
    supportedTypes: ['auto', 'home', 'business', 'public-liability'],
    features: [
      '24/7 Claims Service',
      'Accident Assist',
      'Client Portal',
      'Emergency Services',
      'Risk Management'
    ],
    established: new Date('1918-01-01'),
    headquarters: 'Cape Town, South Africa',
    branches: 150,
    description: 'South Africa\'s largest general insurer with over 100 years of experience.',
    specialties: ['Commercial Property', 'Motor Insurance', 'Business Insurance'],
    claimsProcessingTime: '3-5 business days',
    customerSatisfaction: 4.3,
    financialStrength: 'AA-',
    coverage: {
      geographic: ['South Africa', 'Namibia', 'Botswana'],
      sectors: ['Personal', 'Commercial', 'Corporate']
    }
  },
  {
    id: 'discovery',
    name: 'Discovery Insure',
    logo: '/logos/discovery.png',
    rating: 4.5,
    reviews: 1923,
    website: 'https://www.discovery.co.za',
    phone: '0860 99 88 77',
    email: 'insure@discovery.co.za',
    licenseNumber: 'FSP48657',
    supportedTypes: ['auto', 'home', 'life', 'health'],
    features: [
      'Vitality Benefits',
      'DQ-Track Device',
      'Wellness Programs',
      'Shared-value Insurance',
      'Real-time Monitoring'
    ],
    established: new Date('2005-01-01'),
    headquarters: 'Johannesburg, South Africa',
    branches: 85,
    description: 'Innovative insurer focusing on shared-value insurance and wellness programs.',
    specialties: ['Behavioral Insurance', 'Health & Wellness', 'Technology Integration'],
    claimsProcessingTime: '2-4 business days',
    customerSatisfaction: 4.5,
    financialStrength: 'A+',
    coverage: {
      geographic: ['South Africa', 'United Kingdom'],
      sectors: ['Personal', 'SME']
    }
  },
  {
    id: 'outsurance',
    name: 'Outsurance',
    logo: '/logos/outsurance.png',
    rating: 4.1,
    reviews: 3156,
    website: 'https://www.outsurance.co.za',
    phone: '0860 68 87 87',
    email: 'info@outsurance.co.za',
    licenseNumber: 'FSP15805',
    supportedTypes: ['auto', 'home', 'life'],
    features: [
      'Fixed Excess Option',
      'Direct Claims Processing',
      'No Broker Fees',
      'Guaranteed Premiums',
      'OutBonus Rewards'
    ],
    established: new Date('1998-01-01'),
    headquarters: 'Centurion, South Africa',
    branches: 45,
    description: 'Direct insurer known for competitive pricing and efficient service.',
    specialties: ['Motor Insurance', 'Household Insurance', 'Direct Sales'],
    claimsProcessingTime: '1-3 business days',
    customerSatisfaction: 4.1,
    financialStrength: 'A',
    coverage: {
      geographic: ['South Africa'],
      sectors: ['Personal', 'Small Business']
    }
  },
  {
    id: 'hollard',
    name: 'Hollard Insurance',
    logo: '/logos/hollard.png',
    rating: 4.2,
    reviews: 2104,
    website: 'https://www.hollard.co.za',
    phone: '0860 007 300',
    email: 'info@hollard.co.za',
    licenseNumber: 'FSP7617',
    supportedTypes: ['auto', 'home', 'business', 'engineering-construction'],
    features: [
      'Pan-African Coverage',
      'Specialized Engineering',
      'Corporate Solutions',
      'Digital Claims',
      'Risk Consulting'
    ],
    established: new Date('1980-01-01'),
    headquarters: 'Johannesburg, South Africa',
    branches: 120,
    description: 'Leading African insurer with strong engineering and construction expertise.',
    specialties: ['Engineering Insurance', 'Construction Risk', 'Pan-African Coverage'],
    claimsProcessingTime: '4-7 business days',
    customerSatisfaction: 4.2,
    financialStrength: 'AA-',
    coverage: {
      geographic: ['South Africa', 'Ghana', 'Kenya', 'Nigeria', 'Mozambique'],
      sectors: ['Personal', 'Commercial', 'Engineering']
    }
  },
  {
    id: 'momentum',
    name: 'Momentum Insure',
    logo: '/logos/momentum.png',
    rating: 4.0,
    reviews: 1567,
    website: 'https://www.momentum.co.za',
    phone: '0860 786 777',
    email: 'insure@momentum.co.za',
    licenseNumber: 'FSP6406',
    supportedTypes: ['auto', 'home', 'life', 'business'],
    features: [
      'Multiply Rewards',
      'Family Benefits',
      'Wellness Integration',
      'Investment Options',
      'Tax Benefits'
    ],
    established: new Date('1966-01-01'),
    headquarters: 'Centurion, South Africa',
    branches: 95,
    description: 'Comprehensive financial services group with strong insurance offerings.',
    specialties: ['Life Insurance', 'Investment Products', 'Family Coverage'],
    claimsProcessingTime: '3-6 business days',
    customerSatisfaction: 4.0,
    financialStrength: 'A',
    coverage: {
      geographic: ['South Africa'],
      sectors: ['Personal', 'Commercial', 'Employee Benefits']
    }
  }
];

// Get all providers
router.get('/', (req, res) => {
  try {
    const { type, rating, location } = req.query;
    
    let filteredProviders = [...providers];
    
    // Filter by supported insurance type
    if (type) {
      filteredProviders = filteredProviders.filter(p => 
        p.supportedTypes.includes(type)
      );
    }
    
    // Filter by minimum rating
    if (rating) {
      const minRating = parseFloat(rating);
      filteredProviders = filteredProviders.filter(p => p.rating >= minRating);
    }
    
    // Filter by coverage location (basic implementation)
    if (location) {
      filteredProviders = filteredProviders.filter(p => 
        p.coverage.geographic.some(geo => 
          geo.toLowerCase().includes(location.toLowerCase())
        )
      );
    }

    res.json({
      success: true,
      data: filteredProviders,
      total: filteredProviders.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get specific provider by ID
router.get('/:providerId', (req, res) => {
  try {
    const provider = providers.find(p => p.id === req.params.providerId);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: provider,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get provider availability for specific insurance type
router.get('/:providerId/availability/:insuranceType', (req, res) => {
  try {
    const { providerId, insuranceType } = req.params;
    const provider = providers.find(p => p.id === providerId);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found',
        timestamp: new Date().toISOString()
      });
    }

    const isAvailable = provider.supportedTypes.includes(insuranceType);
    const availability = {
      providerId,
      providerName: provider.name,
      insuranceType,
      available: isAvailable,
      features: isAvailable ? provider.features : [],
      estimatedProcessingTime: provider.claimsProcessingTime,
      rating: provider.rating
    };

    if (isAvailable) {
      // Add type-specific information
      availability.typeSpecificInfo = getTypeSpecificInfo(insuranceType, provider);
    }

    res.json({
      success: true,
      data: availability,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get providers comparison
router.post('/compare', (req, res) => {
  try {
    const { providerIds, insuranceType } = req.body;
    
    if (!providerIds || !Array.isArray(providerIds)) {
      return res.status(400).json({
        success: false,
        error: 'Provider IDs array is required',
        timestamp: new Date().toISOString()
      });
    }

    const providersToCompare = providers.filter(p => 
      providerIds.includes(p.id)
    );

    if (providersToCompare.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No providers found for comparison',
        timestamp: new Date().toISOString()
      });
    }

    // Filter by insurance type if specified
    let relevantProviders = providersToCompare;
    if (insuranceType) {
      relevantProviders = providersToCompare.filter(p => 
        p.supportedTypes.includes(insuranceType)
      );
    }

    const comparison = {
      providers: relevantProviders.map(provider => ({
        id: provider.id,
        name: provider.name,
        rating: provider.rating,
        reviews: provider.reviews,
        features: provider.features,
        claimsProcessingTime: provider.claimsProcessingTime,
        customerSatisfaction: provider.customerSatisfaction,
        financialStrength: provider.financialStrength,
        supportedTypes: provider.supportedTypes,
        branches: provider.branches,
        established: provider.established
      })),
      analysis: {
        highestRated: relevantProviders.reduce((prev, current) => 
          prev.rating > current.rating ? prev : current
        ),
        mostExperienced: relevantProviders.reduce((prev, current) => 
          new Date(prev.established) < new Date(current.established) ? prev : current
        ),
        fastestClaims: relevantProviders.reduce((prev, current) => 
          extractDays(prev.claimsProcessingTime) < extractDays(current.claimsProcessingTime) ? prev : current
        ),
        mostBranches: relevantProviders.reduce((prev, current) => 
          prev.branches > current.branches ? prev : current
        )
      },
      summary: {
        averageRating: (relevantProviders.reduce((sum, p) => sum + p.rating, 0) / relevantProviders.length).toFixed(1),
        averageClaimsTime: calculateAverageClaimsTime(relevantProviders),
        totalFeatures: [...new Set(relevantProviders.flatMap(p => p.features))],
        coverageAreas: [...new Set(relevantProviders.flatMap(p => p.coverage.geographic))]
      }
    };

    res.json({
      success: true,
      data: comparison,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get provider performance metrics
router.get('/:providerId/performance', (req, res) => {
  try {
    const provider = providers.find(p => p.id === req.params.providerId);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found',
        timestamp: new Date().toISOString()
      });
    }

    // Generate mock performance data
    const performance = {
      providerId: provider.id,
      providerName: provider.name,
      metrics: {
        customerSatisfaction: provider.customerSatisfaction,
        claimsApprovalRate: (Math.random() * 0.15 + 0.85).toFixed(2), // 85-100%
        averageClaimsTime: provider.claimsProcessingTime,
        financialStrength: provider.financialStrength,
        complaintRatio: (Math.random() * 0.05 + 0.01).toFixed(3), // 1-6%
        renewalRate: (Math.random() * 0.15 + 0.80).toFixed(2), // 80-95%
        responseTime: Math.floor(Math.random() * 120) + 30 + ' minutes' // 30-150 min
      },
      recentTrends: {
        customerSatisfactionTrend: (Math.random() * 0.4 - 0.2).toFixed(2), // -0.2 to +0.2
        claimsProcessingTrend: Math.floor(Math.random() * 2 - 1), // -1 to +1 days
        marketShareTrend: (Math.random() * 2 - 1).toFixed(1) + '%' // -1% to +1%
      },
      certifications: [
        'ISO 9001:2015',
        'FAIS Compliant',
        'SAIA Member',
        'FSB Registered'
      ],
      awards: generateAwards(provider)
    };

    res.json({
      success: true,
      data: performance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper functions

function getTypeSpecificInfo(insuranceType, provider) {
  const typeInfo = {
    auto: {
      coverageOptions: ['Comprehensive', 'Third Party', 'Third Party Fire & Theft'],
      additionalBenefits: ['Roadside Assistance', 'Rental Car', 'Accident Management'],
      discounts: ['Multi-vehicle', 'No Claims Bonus', 'Security Features']
    },
    home: {
      coverageOptions: ['Buildings', 'Contents', 'Combined'],
      additionalBenefits: ['Emergency Accommodation', 'Garden Cover', 'Portable Items'],
      discounts: ['Security Systems', 'Multi-policy', 'Claims-free']
    },
    life: {
      coverageOptions: ['Term Life', 'Whole Life', 'Universal Life'],
      additionalBenefits: ['Disability Cover', 'Critical Illness', 'Funeral Benefits'],
      discounts: ['Non-smoker', 'Health Screening', 'Annual Premium']
    },
    business: {
      coverageOptions: ['Public Liability', 'Professional Indemnity', 'Commercial Property'],
      additionalBenefits: ['Business Interruption', 'Cyber Protection', 'Key Person'],
      discounts: ['Risk Management', 'Claims History', 'Industry Specific']
    }
  };

  return typeInfo[insuranceType] || {};
}

function extractDays(timeString) {
  const match = timeString.match(/(\d+)/);
  return match ? parseInt(match[0]) : 999;
}

function calculateAverageClaimsTime(providers) {
  const totalDays = providers.reduce((sum, provider) => {
    return sum + extractDays(provider.claimsProcessingTime);
  }, 0);
  
  const avgDays = Math.round(totalDays / providers.length);
  return `${avgDays} business days`;
}

function generateAwards(provider) {
  const allAwards = [
    'Best Customer Service 2023',
    'Innovation in Insurance 2022',
    'Claims Excellence Award 2023',
    'Digital Transformation Leader',
    'Sustainable Business Award',
    'Best Employer in Insurance',
    'Customer Choice Award'
  ];
  
  const numAwards = Math.floor(Math.random() * 4) + 1;
  return allAwards.slice(0, numAwards).map(award => ({
    title: award,
    year: 2023 - Math.floor(Math.random() * 3),
    organization: 'South African Insurance Awards'
  }));
}

module.exports = router;