import { Quote, Representative, QuoteRecommendation, QuoteInterest, RepresentativeAssignment, RecommendationStatus } from '../types';

// Available representatives
const REPRESENTATIVES: Representative[] = [
  {
    id: 'rep-001',
    name: 'Thabang',
    surname: 'Mulaudzi',
    email: 'thabang@mibrokersa.co.za',
    specializations: ['auto', 'buildings-insurance', 'household-contents', 'commercial-property', 'small-business', 'e-hailing'],
    rating: 4.9,
    activeClients: 38,
    isAvailable: true,
  },
  {
    id: 'rep-002',
    name: 'Dineo',
    surname: 'Mogale',
    email: 'dineo@mibrokersa.co.za',
    specializations: ['transport-insurance', 'aviation-marine', 'public-liability', 'body-corporates', 'e-hailing'],
    rating: 4.8,
    activeClients: 42,
    isAvailable: true,
  },
  {
    id: 'rep-003',
    name: 'OK',
    surname: 'Nkadimeng',
    email: 'ok.nkadimeng@mibrokersa.co.za',
    specializations: ['engineering-construction', 'aviation-marine', 'public-liability', 'mining-rehabilitation'],
    rating: 4.7,
    activeClients: 35,
    isAvailable: true,
  },
  {
    id: 'rep-004',
    name: 'Mandla',
    surname: 'Mavembeka',
    email: 'mandla@mibrokersa.co.za',
    specializations: ['auto', 'buildings-insurance', 'household-contents', 'small-business'],
    rating: 4.8,
    activeClients: 45,
    isAvailable: true,
  },
  {
    id: 'rep-005',
    name: 'Lerato',
    surname: 'Mokoena',
    email: 'lerato.mokoena@mibrokersa.co.za',
    specializations: ['commercial-property', 'body-corporates', 'engineering-construction', 'mining-rehabilitation'],
    rating: 4.85,
    activeClients: 40,
    isAvailable: true,
  },
];

// Generate unique user ID
export const generateUserId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `USR-${timestamp}-${randomStr}`.toUpperCase();
};

// Quote recommendation algorithm
export const generateQuoteRecommendation = (
  quotes: Quote[], 
  formData: any
): QuoteRecommendation | null => {
  if (quotes.length === 0) return null;

  // Scoring factors
  const scores = quotes.map(quote => {
    let score = 0;
    const reasons: string[] = [];

    // Provider rating (0-25 points)
    const providerScore = (quote.providerRating / 5) * 25;
    score += providerScore;
    if (quote.providerRating >= 4.5) {
      reasons.push(`Highly rated provider (${quote.providerRating}/5 stars)`);
    }

    // Premium affordability (0-25 points)
    const budgetMax = formData.needsAnalysis?.budgetPreferences?.maxMonthlyPremium || 1000;
    const affordabilityRatio = Math.max(0, (budgetMax - quote.premium) / budgetMax);
    const premiumScore = affordabilityRatio * 25;
    score += premiumScore;
    if (quote.premium <= budgetMax * 0.8) {
      reasons.push(`Excellent value - 20% within your budget range`);
    } else if (quote.premium <= budgetMax) {
      reasons.push(`Well within your specified budget`);
    }

    // Risk score (lower is better, 0-20 points)
    const riskScore = Math.max(0, (10 - quote.riskScore) / 10) * 20;
    score += riskScore;
    if (quote.riskScore <= 3) {
      reasons.push(`Low risk profile`);
    }

    // Feature coverage (0-20 points)
    const featureScore = Math.min(20, quote.features.length * 2);
    score += featureScore;
    if (quote.features.length >= 8) {
      reasons.push(`Comprehensive coverage with ${quote.features.length} features`);
    }

    // Discount availability (0-10 points)
    const discountScore = Math.min(10, quote.discounts.length * 3);
    score += discountScore;
    if (quote.discounts.length > 0) {
      const totalDiscount = quote.discounts.reduce((sum, discount) => sum + discount.amount, 0);
      reasons.push(`Includes ${quote.discounts.length} benefit(s) adding R${totalDiscount.toFixed(2)} in value`);
    }

    return { quote, score, reasons };
  });

  // Sort by score (highest first)
  scores.sort((a, b) => b.score - a.score);
  const recommended = scores[0];

  return {
    recommendedQuote: recommended.quote,
    reasons: recommended.reasons,
    score: Math.round(recommended.score),
    alternativeQuotes: scores.slice(1, 4).map(s => s.quote), // Top 3 alternatives
  };
};

// Randomly assign a representative
export const assignRepresentative = (insuranceType?: string): Representative => {
  // Filter representatives by specialization if insurance type is provided
  const eligibleReps = insuranceType 
    ? REPRESENTATIVES.filter(rep => 
        rep.isAvailable && rep.specializations.includes(insuranceType as any)
      )
    : REPRESENTATIVES.filter(rep => rep.isAvailable);

  // If no specialized reps available, use any available rep
  const availableReps = eligibleReps.length > 0 ? eligibleReps : REPRESENTATIVES.filter(rep => rep.isAvailable);
  
  // Random selection
  const randomIndex = Math.floor(Math.random() * availableReps.length);
  return availableReps[randomIndex] || REPRESENTATIVES[0]; // Fallback to first rep
};

// Create quote interest record
export const createQuoteInterest = (
  userId: string,
  interestedQuote: Quote,
  recommendedQuote: Quote,
  formData: any,
  userChoice: 'proceed' | 'change'
): QuoteInterest => {
  let status: RecommendationStatus;

  if (interestedQuote.id === recommendedQuote.id) {
    status = 'same-as-recommendation';
  } else if (userChoice === 'change') {
    status = 'recommended';
  } else {
    status = 'not-recommended';
  }

  return {
    id: `QI-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase(),
    userId,
    interestedQuoteId: userChoice === 'change' ? recommendedQuote.id : interestedQuote.id,
    recommendedQuoteId: recommendedQuote.id,
    status,
    representativeId: '', // Will be assigned later
    createdAt: new Date(),
    formData,
  };
};

// Create representative assignment
export const createRepresentativeAssignment = (
  userId: string,
  representativeId: string,
  quoteInterestId: string
): RepresentativeAssignment => {
  return {
    id: `RA-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase(),
    userId,
    representativeId,
    quoteInterestId,
    status: 'assigned',
    assignedAt: new Date(),
    expectedResponseDays: 3, // 3 business days
  };
};

// Get representative by ID
export const getRepresentativeById = (id: string): Representative | undefined => {
  return REPRESENTATIVES.find(rep => rep.id === id);
};

// Format quote details for display
export const formatQuoteDetails = (quote: Quote): string => {
  const features = quote.features.slice(0, 5).join(', ') + (quote.features.length > 5 ? '...' : '');
  const discounts = quote.discounts.map(d => d.description).join(', ') || 'None';
  
  return `
Provider: ${quote.provider}
Monthly Premium: R${quote.premium.toFixed(2)}
Annual Premium: R${quote.annualPremium.toFixed(2)}
Coverage: ${quote.coverage}
Key Features: ${features}
Discounts: ${discounts}
Provider Rating: ${quote.providerRating}/5 stars
Risk Score: ${quote.riskScore}/10
Valid Until: ${quote.validUntil.toLocaleDateString()}
  `.trim();
};

// Calculate business days for follow-up
export const calculateBusinessDays = (startDate: Date, businessDays: number): Date => {
  const result = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded < businessDays) {
    result.setDate(result.getDate() + 1);
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      daysAdded++;
    }
  }
  
  return result;
};