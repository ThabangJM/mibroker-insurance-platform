const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Mock data storage (in production, this would be a database)
let quotes = [];
let providers = [
  {
    id: 'santam',
    name: 'Santam',
    logo: '/logos/santam.png',
    rating: 4.3,
    website: 'https://www.santam.co.za',
    phone: '0860 44 44 44',
    email: 'info@santam.co.za',
    licenseNumber: 'FSP3416',
    supportedTypes: ['auto', 'home', 'business'],
    features: ['24/7 Claims', 'Accident Assist', 'Client Portal'],
    established: new Date('1918-01-01'),
    headquarters: 'Cape Town, South Africa'
  },
  {
    id: 'discovery',
    name: 'Discovery Insure',
    logo: '/logos/discovery.png',
    rating: 4.5,
    website: 'https://www.discovery.co.za',
    phone: '0860 99 88 77',
    email: 'insure@discovery.co.za',
    licenseNumber: 'FSP48657',
    supportedTypes: ['auto', 'home', 'life', 'health'],
    features: ['Vitality Benefits', 'DQ-Track', 'Wellness Programs'],
    established: new Date('2005-01-01'),
    headquarters: 'Johannesburg, South Africa'
  },
  {
    id: 'outsurance',
    name: 'Outsurance',
    logo: '/logos/outsurance.png',
    rating: 4.1,
    website: 'https://www.outsurance.co.za',
    phone: '0860 68 87 87',
    email: 'info@outsurance.co.za',
    licenseNumber: 'FSP15805',
    supportedTypes: ['auto', 'home', 'life'],
    features: ['Fixed Excess', 'Direct Claims', 'No Broker Fees'],
    established: new Date('1998-01-01'),
    headquarters: 'Centurion, South Africa'
  }
];

// Generate quotes based on request
router.post('/generate', async (req, res) => {
  try {
    const quoteRequest = normalizeQuoteRequest(req.body);
    
    // Simulate quote generation with different providers
    const generatedQuotes = providers
      .filter(provider => provider.supportedTypes.includes(quoteRequest.insuranceType))
      .map(provider => {
        const baseQuote = generateBaseQuote(quoteRequest, provider);
        quotes.push(baseQuote);
        return baseQuote;
      });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    res.json({
      success: true,
      data: generatedQuotes,
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

const OPTIONAL_COVER_LIMITS = { min: 10000, max: 100000 };

function normalizeOptionalCover(cover) {
  const selected = Boolean(cover && cover.selected);
  const rawAmount = cover?.amount;
  const parsedAmount = typeof rawAmount === 'number' ? rawAmount : parseFloat(rawAmount || '');
  const amountIsValid =
    selected &&
    !Number.isNaN(parsedAmount) &&
    parsedAmount >= OPTIONAL_COVER_LIMITS.min &&
    parsedAmount <= OPTIONAL_COVER_LIMITS.max;

  return {
    selected,
    amount: amountIsValid ? parsedAmount : null
  };
}

function normalizeQuoteRequest(request) {
  if (!request || typeof request !== 'object') return request;

  const needsAnalysis = request.needsAnalysis || {};
  const coveragePreferences = needsAnalysis.coveragePreferences || {};
  const optionalCovers = coveragePreferences.optionalCovers || {};

  return {
    ...request,
    needsAnalysis: {
      ...needsAnalysis,
      coveragePreferences: {
        ...coveragePreferences,
        optionalCovers: {
          accidentalDamage: normalizeOptionalCover(optionalCovers.accidentalDamage),
          powerSurge: normalizeOptionalCover(optionalCovers.powerSurge),
          subsidenceLandslip: normalizeOptionalCover(optionalCovers.subsidenceLandslip)
        },
        optionalCoverAgentComment:
          typeof coveragePreferences.optionalCoverAgentComment === 'string'
            ? coveragePreferences.optionalCoverAgentComment.trim()
            : ''
      }
    }
  };
}

// Get quote by ID
router.get('/:quoteId', (req, res) => {
  try {
    const quote = quotes.find(q => q.id === req.params.quoteId);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: quote,
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

// Update quote status
router.put('/:quoteId/status', (req, res) => {
  try {
    const quoteIndex = quotes.findIndex(q => q.id === req.params.quoteId);
    
    if (quoteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found',
        timestamp: new Date().toISOString()
      });
    }

    quotes[quoteIndex].status = req.body.status;
    quotes[quoteIndex].updatedAt = new Date();

    res.json({
      success: true,
      data: quotes[quoteIndex],
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

// Get user's quotes with pagination
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status, type } = req.query;
    
    let userQuotes = quotes.filter(q => q.userId === userId);
    
    // Filter by status
    if (status) {
      userQuotes = userQuotes.filter(q => q.status === status);
    }
    
    // Filter by type
    if (type) {
      userQuotes = userQuotes.filter(q => q.type === type);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedQuotes = userQuotes.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        quotes: paginatedQuotes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: userQuotes.length,
          totalPages: Math.ceil(userQuotes.length / limit)
        }
      },
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

// Compare quotes
router.post('/compare', (req, res) => {
  try {
    const { quoteIds } = req.body;
    
    const quotesToCompare = quotes.filter(q => quoteIds.includes(q.id));
    
    if (quotesToCompare.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No quotes found for comparison',
        timestamp: new Date().toISOString()
      });
    }

    // Generate comparison data
    const comparison = {
      quotes: quotesToCompare,
      analysis: {
        cheapest: quotesToCompare.reduce((prev, current) => 
          prev.premium < current.premium ? prev : current
        ),
        mostExpensive: quotesToCompare.reduce((prev, current) => 
          prev.premium > current.premium ? prev : current
        ),
        averagePremium: quotesToCompare.reduce((sum, q) => sum + q.premium, 0) / quotesToCompare.length,
        priceRange: {
          min: Math.min(...quotesToCompare.map(q => q.premium)),
          max: Math.max(...quotesToCompare.map(q => q.premium))
        }
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

// Helper function to generate a base quote
function generateBaseQuote(request, provider) {
  const baseRates = {
    auto: { min: 800, max: 2500 },
    home: { min: 400, max: 1200 },
    life: { min: 200, max: 800 },
    business: { min: 1500, max: 5000 },
    'public-liability': { min: 300, max: 1000 },
    'engineering-construction': { min: 2000, max: 8000 }
  };

  const rate = baseRates[request.insuranceType] || { min: 500, max: 2000 };
  const basePremium = Math.floor(Math.random() * (rate.max - rate.min) + rate.min);
  
  // Apply provider-specific multipliers
  const providerMultipliers = {
    'santam': 1.1,
    'discovery': 1.2,
    'outsurance': 0.95
  };
  
  const multiplier = providerMultipliers[provider.id] || 1.0;
  const premium = Math.floor(basePremium * multiplier);

  return {
    id: uuidv4(),
    userId: request.userId || 'anonymous',
    type: request.insuranceType,
    provider: provider.name,
    providerId: provider.id,
    premium: premium,
    annualPremium: premium * 12,
    coverage: generateCoverageAmount(request.insuranceType, premium),
    deductible: Math.floor(premium * 0.1),
    status: 'pending',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    createdAt: new Date(),
    updatedAt: new Date(),
    features: generateFeatures(request.insuranceType),
    exclusions: generateExclusions(request.insuranceType),
    discounts: generateDiscounts(),
    riskScore: Math.floor(Math.random() * 10) + 1,
    providerRating: provider.rating,
    metadata: request
  };
}

function generateCoverageAmount(type, premium) {
  const coverageMultipliers = {
    auto: 100,
    home: 80,
    life: 200,
    business: 150,
    'public-liability': 120,
    'engineering-construction': 300
  };
  
  const multiplier = coverageMultipliers[type] || 100;
  return `R${(premium * multiplier).toLocaleString()}`;
}

function generateFeatures(type) {
  const featureOptions = {
    auto: ['Comprehensive Cover', '24/7 Roadside Assistance', 'Accident Management', 'Rental Car Cover'],
    home: ['Building Cover', 'Contents Cover', 'Portable Possessions', 'Emergency Accommodation'],
    life: ['Death Benefit', 'Disability Cover', 'Critical Illness', 'Funeral Benefits'],
    business: ['Public Liability', 'Professional Indemnity', 'Business Interruption', 'Cyber Protection'],
    'public-liability': ['Third Party Cover', 'Legal Costs', 'Product Liability', 'Advertising Liability'],
    'engineering-construction': ['All Risks Cover', 'Third Party Liability', 'Delays in Start-Up', 'Professional Indemnity']
  };
  
  const features = featureOptions[type] || ['Standard Cover', 'Claims Support', 'Policy Management'];
  return features.slice(0, Math.floor(Math.random() * 3) + 2);
}

function generateExclusions(type) {
  const exclusionOptions = {
    auto: ['Racing or Speed Tests', 'Unlicensed Drivers', 'Wear and Tear'],
    home: ['War and Nuclear Risks', 'Gradual Deterioration', 'Unattended Property'],
    life: ['Suicide (first 2 years)', 'War and Military Action', 'Self-inflicted Injuries'],
    business: ['Nuclear Risks', 'Terrorism', 'Cyber Attacks (basic cover)']
  };
  
  return exclusionOptions[type] || ['Standard Exclusions Apply'];
}

function generateDiscounts() {
  const possibleDiscounts = [
    { type: 'multi-policy', description: 'Multiple Policy Discount', amount: 10, isPercentage: true },
    { type: 'no-claims', description: 'No Claims Bonus', amount: 15, isPercentage: true },
    { type: 'security', description: 'Security Features Discount', amount: 5, isPercentage: true }
  ];
  
  const numDiscounts = Math.floor(Math.random() * 3);
  return possibleDiscounts.slice(0, numDiscounts);
}

module.exports = router;