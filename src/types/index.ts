// Core type definitions for the insurance aggregator system

// Enum for different insurance types supported by the platform
export type InsuranceType = 
  | 'auto' 
  | 'buildings-insurance' 
  | 'household-contents' 
  | 'life' 
  | 'health' 
  | 'public-liability'
  | 'small-business' 
  | 'commercial-property'
  | 'transport-insurance'
  | 'body-corporates'
  | 'engineering-construction'
  | 'aviation-marine'
  | 'mining-rehabilitation'
  | 'e-hailing';

// Enum for quote status tracking throughout the lifecycle
export type QuoteStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'purchased';

// Enum for policy status after purchase
export type PolicyStatus = 'active' | 'cancelled' | 'expired' | 'suspended';

// Enum for user roles in the system
export type UserRole = 'customer' | 'agent' | 'admin';

// Interface for user account information
export interface User {
  id: string;                    // Unique user identifier
  name: string;                  // Full name of the user
  email: string;                 // Email address for communication
  phone: string;                 // Contact phone number
  role: UserRole;                // User's role in the system
  createdAt: Date;              // Account creation timestamp
  lastLogin?: Date;             // Last login timestamp (optional)
  preferences?: UserPreferences; // User's system preferences (optional)
}

// Interface for user preferences and settings
export interface UserPreferences {
  notifications: {
    email: boolean;              // Email notification preference
    sms: boolean;               // SMS notification preference
    push: boolean;              // Push notification preference
  };
  language: string;             // Preferred language code
  currency: string;             // Preferred currency code
  theme: 'light' | 'dark';     // UI theme preference
}

// Interface for insurance quotes with comprehensive details
export interface Quote {
  id: string;                   // Unique quote identifier
  userId: string;               // ID of the user who requested the quote
  type: InsuranceType;          // Type of insurance being quoted
  provider: string;             // Insurance provider/company name
  premium: number;              // Monthly premium amount
  annualPremium: number;        // Annual premium amount
  coverage: string;             // Coverage amount description
  deductible?: number;          // Deductible amount (optional)
  status: QuoteStatus;          // Current status of the quote
  validUntil: Date;            // Quote expiration date
  createdAt: Date;             // Quote creation timestamp
  updatedAt: Date;             // Last update timestamp
  features: string[];           // List of coverage features
  exclusions: string[];         // List of coverage exclusions
  discounts: Discount[];        // Applied discounts
  riskScore: number;           // Risk assessment score (1-10)
  providerRating: number;      // Provider rating (1-5)
  metadata: QuoteMetadata;     // Additional quote-specific data
}

// Interface for discount information
export interface Discount {
  type: string;                // Type of discount (e.g., 'multi-policy', 'safe-driver')
  description: string;         // Human-readable discount description
  amount: number;              // Discount amount or percentage
  isPercentage: boolean;       // Whether the amount is a percentage
}

// Interface for quote metadata (varies by insurance type)
export interface QuoteMetadata {
  [key: string]: any;          // Flexible structure for type-specific data
  
  // Auto insurance specific fields
  vehicleYear?: number;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleValue?: number;
  drivingHistory?: DrivingRecord[];
  
  // Home insurance specific fields
  propertyValue?: number;
  propertyType?: string;
  constructionYear?: number;
  securityFeatures?: string[];
  
  // Commercial property specific fields
  coverageAmount?: number;
  beneficiaries?: Beneficiary[];
  medicalHistory?: MedicalRecord[];
  
  // Health insurance specific fields
  dependents?: number;
  preExistingConditions?: string[];
  preferredProviders?: string[];

  // Optional cover selections (home/buildings/contents)
  optionalCovers?: {
    accidentalDamage?: { selected: boolean; amount: number | null };
    powerSurge?: { selected: boolean; amount: number | null };
    subsidenceLandslip?: { selected: boolean; amount: number | null };
  };
  optionalCoverAgentComment?: string;
}

// Interface for driving record information
export interface DrivingRecord {
  date: Date;                  // Date of the incident
  type: string;                // Type of incident (accident, violation, etc.)
  description: string;         // Description of the incident
  severity: 'minor' | 'major' | 'severe'; // Severity level
}

// Interface for beneficiary information
export interface Beneficiary {
  name: string;                // Full name of beneficiary
  relationship: string;        // Relationship to policyholder
  percentage: number;          // Percentage of benefit (0-100)
  contactInfo: string;         // Contact information
}

// Interface for medical record information
export interface MedicalRecord {
  condition: string;           // Medical condition name
  diagnosisDate: Date;         // Date of diagnosis
  severity: 'mild' | 'moderate' | 'severe'; // Condition severity
  treatment: string;           // Current treatment status
}

// Interface for purchased insurance policies
export interface Policy {
  id: string;                  // Unique policy identifier
  quoteId: string;             // Original quote ID that led to this policy
  userId: string;              // Policy holder's user ID
  policyNumber: string;        // Insurance company's policy number
  type: InsuranceType;         // Type of insurance
  provider: string;            // Insurance provider name
  status: PolicyStatus;        // Current policy status
  premium: number;             // Monthly premium amount
  coverage: string;            // Coverage amount
  startDate: Date;             // Policy effective start date
  endDate: Date;               // Policy expiration date
  renewalDate: Date;           // Next renewal date
  createdAt: Date;             // Policy creation timestamp
  documents: PolicyDocument[]; // Associated policy documents
  claims: Claim[];             // Claims made against this policy
  paymentHistory: Payment[];   // Payment history for this policy
}

// Interface for policy documents
export interface PolicyDocument {
  id: string;                  // Document identifier
  type: string;                // Document type (policy, certificate, etc.)
  name: string;                // Document name/title
  url: string;                 // URL to access the document
  uploadedAt: Date;            // Upload timestamp
  size: number;                // File size in bytes
}

// Interface for insurance claims
export interface Claim {
  id: string;                  // Unique claim identifier
  policyId: string;            // Associated policy ID
  claimNumber: string;         // Insurance company's claim number
  type: string;                // Type of claim
  description: string;         // Claim description
  amount: number;              // Claimed amount
  status: 'submitted' | 'processing' | 'approved' | 'denied' | 'paid'; // Claim status
  submittedAt: Date;           // Claim submission date
  processedAt?: Date;          // Claim processing completion date
  documents: ClaimDocument[];  // Supporting documents
}

// Interface for claim documents
export interface ClaimDocument {
  id: string;                  // Document identifier
  type: string;                // Document type (photo, receipt, report, etc.)
  name: string;                // Document name
  url: string;                 // URL to access the document
  uploadedAt: Date;            // Upload timestamp
}

// Interface for payment records
export interface Payment {
  id: string;                  // Payment identifier
  policyId: string;            // Associated policy ID
  amount: number;              // Payment amount
  method: string;              // Payment method (card, bank transfer, etc.)
  status: 'pending' | 'completed' | 'failed' | 'refunded'; // Payment status
  transactionId: string;       // External transaction identifier
  processedAt: Date;           // Payment processing date
  dueDate: Date;               // Payment due date
}

// Interface for insurance providers/companies
export interface Provider {
  id: string;                  // Provider identifier
  name: string;                // Company name
  logo: string;                // Logo image URL
  rating: number;              // Overall rating (1-5)
  reviewCount: number;         // Number of reviews
  description: string;         // Company description
  website: string;             // Company website URL
  phone: string;               // Customer service phone
  email: string;               // Customer service email
  licenseNumber: string;       // Insurance license number
  supportedTypes: InsuranceType[]; // Types of insurance offered
  features: string[];          // Special features or benefits
  established: Date;           // Company establishment date
  headquarters: string;        // Company headquarters location
}

// Interface for quote comparison filters
export interface QuoteFilters {
  priceRange: {
    min: number;               // Minimum premium amount
    max: number;               // Maximum premium amount
  };
  providers: string[];         // Selected provider names
  coverageAmount: {
    min: number;               // Minimum coverage amount
    max: number;               // Maximum coverage amount
  };
  deductible: {
    min: number;               // Minimum deductible amount
    max: number;               // Maximum deductible amount
  };
  rating: number;              // Minimum provider rating
  features: string[];          // Required features
  sortBy: 'price' | 'rating' | 'coverage' | 'provider'; // Sort criteria
  sortOrder: 'asc' | 'desc';   // Sort direction
}

// Interface for analytics data
export interface AnalyticsData {
  totalQuotes: number;         // Total number of quotes generated
  totalPolicies: number;       // Total number of policies purchased
  conversionRate: number;      // Quote to policy conversion rate
  averagePremium: number;      // Average premium amount
  popularInsuranceTypes: {     // Most popular insurance types
    type: InsuranceType;
    count: number;
    percentage: number;
  }[];
  topProviders: {              // Top performing providers
    name: string;
    quoteCount: number;
    policyCount: number;
    rating: number;
  }[];
  monthlyTrends: {             // Monthly trend data
    month: string;
    quotes: number;
    policies: number;
    revenue: number;
  }[];
  userGrowth: {                // User growth statistics
    month: string;
    newUsers: number;
    totalUsers: number;
  }[];
}

// Interface for notification system
export interface Notification {
  id: string;                  // Notification identifier
  userId: string;              // Target user ID
  type: 'quote' | 'policy' | 'claim' | 'payment' | 'system'; // Notification type
  title: string;               // Notification title
  message: string;             // Notification message
  read: boolean;               // Whether notification has been read
  actionUrl?: string;          // Optional action URL
  createdAt: Date;             // Creation timestamp
  expiresAt?: Date;            // Optional expiration date
}

// Interface for system settings
export interface SystemSettings {
  maintenanceMode: boolean;    // Whether system is in maintenance mode
  allowNewRegistrations: boolean; // Whether new user registrations are allowed
  maxQuotesPerUser: number;    // Maximum quotes per user per day
  quoteValidityDays: number;   // Number of days quotes remain valid
  supportedCurrencies: string[]; // List of supported currency codes
  supportedLanguages: string[]; // List of supported language codes
  apiRateLimits: {             // API rate limiting configuration
    quotesPerHour: number;
    requestsPerMinute: number;
  };
}

// Interface for API responses
export interface ApiResponse<T> {
  success: boolean;            // Whether the request was successful
  data?: T;                    // Response data (if successful)
  error?: string;              // Error message (if failed)
  message?: string;            // Additional message
  timestamp: Date;             // Response timestamp
}

// Interface for pagination
export interface PaginationParams {
  page: number;                // Current page number (1-based)
  limit: number;               // Number of items per page
  total?: number;              // Total number of items (for responses)
  totalPages?: number;         // Total number of pages (for responses)
}

// Interface for search parameters
export interface SearchParams {
  query: string;               // Search query string
  filters?: QuoteFilters;      // Additional filters
  pagination: PaginationParams; // Pagination parameters
}

// Representative types for the quote recommendation system
export interface Representative {
  id: string;                  // Unique representative identifier
  name: string;                // Representative's full name
  surname: string;             // Representative's surname
  email: string;               // Representative's email address
  specializations: InsuranceType[]; // Types of insurance they specialize in
  rating: number;              // Representative rating (1-5)
  activeClients: number;       // Number of active clients
  isAvailable: boolean;        // Availability status
}

// Quote recommendation status types
export type RecommendationStatus = 
  | 'recommended'              // Quote was recommended by the system
  | 'not-recommended'          // Quote was chosen by user despite recommendation
  | 'same-as-recommendation';  // User choice matches recommendation

// Interface for quote interest and recommendation system
export interface QuoteInterest {
  id: string;                  // Unique interest identifier
  userId: string;              // ID of the user who showed interest
  interestedQuoteId: string;   // ID of the quote user is interested in
  recommendedQuoteId: string;  // ID of the system-recommended quote
  status: RecommendationStatus; // Status of the recommendation
  representativeId: string;    // Assigned representative ID
  createdAt: Date;            // Interest registration timestamp
  formData: any;              // Complete form data from the user
}

// Interface for representative assignment
export interface RepresentativeAssignment {
  id: string;                  // Unique assignment identifier
  userId: string;              // ID of the assigned user
  representativeId: string;    // ID of the assigned representative
  quoteInterestId: string;     // ID of the related quote interest
  status: 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  assignedAt: Date;           // Assignment timestamp
  expectedResponseDays: number; // Expected response time in business days
}

// Interface for quote recommendation details
export interface QuoteRecommendation {
  recommendedQuote: Quote;     // The recommended quote
  reasons: string[];           // Reasons for the recommendation
  score: number;              // Recommendation confidence score (0-100)
  alternativeQuotes: Quote[];  // Other viable alternatives
}