// API service layer for handling all external API communications
import { Quote, Policy, Provider, User, AnalyticsData, ApiResponse } from '../types';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.mibroker.co.za';
const API_KEY = import.meta.env.VITE_INSURANCE_API_KEY;

// HTTP client with default configuration
class ApiClient {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  // Generic HTTP request method with error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date(),
      };
    }
  }

  // GET request method
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request method
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request method
  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request method
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Initialize API client
const apiClient = new ApiClient(API_BASE_URL, API_KEY || '');

// Quote-related API functions
export const quoteApi = {
  // Generate quotes from multiple providers
  generateQuotes: async (quoteRequest: any): Promise<ApiResponse<Quote[]>> => {
    // In production, this would call real insurance provider APIs
    // For now, we'll simulate the API call with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockQuotes: Quote[] = [
          {
            id: `quote_${Date.now()}_1`,
            userId: quoteRequest.userId || 'user_123',
            type: quoteRequest.type,
            provider: 'Santam',
            premium: Math.floor(Math.random() * 500) + 200,
            annualPremium: (Math.floor(Math.random() * 500) + 200) * 12,
            coverage: 'R1,000,000',
            deductible: 5000,
            status: 'pending',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            createdAt: new Date(),
            updatedAt: new Date(),
            features: ['Comprehensive Cover', '24/7 Roadside Assistance', 'Accident Forgiveness'],
            exclusions: ['Racing', 'Commercial Use', 'Flood Damage'],
            discounts: [
              {
                type: 'safe-driver',
                description: 'Safe Driver Discount',
                amount: 10,
                isPercentage: true,
              },
            ],
            riskScore: Math.floor(Math.random() * 10) + 1,
            providerRating: 4.2,
            metadata: quoteRequest.metadata || {},
          },
          {
            id: `quote_${Date.now()}_2`,
            userId: quoteRequest.userId || 'user_123',
            type: quoteRequest.type,
            provider: 'Discovery Insure',
            premium: Math.floor(Math.random() * 500) + 180,
            annualPremium: (Math.floor(Math.random() * 500) + 180) * 12,
            coverage: 'R1,000,000',
            deductible: 7500,
            status: 'pending',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
            features: ['Comprehensive Cover', 'Vitality Benefits', 'DQ-Track Technology'],
            exclusions: ['Racing', 'Commercial Use'],
            discounts: [
              {
                type: 'vitality',
                description: 'Vitality Member Discount',
                amount: 15,
                isPercentage: true,
              },
            ],
            riskScore: Math.floor(Math.random() * 10) + 1,
            providerRating: 4.5,
            metadata: quoteRequest.metadata || {},
          },
          {
            id: `quote_${Date.now()}_3`,
            userId: quoteRequest.userId || 'user_123',
            type: quoteRequest.type,
            provider: 'Outsurance',
            premium: Math.floor(Math.random() * 500) + 220,
            annualPremium: (Math.floor(Math.random() * 500) + 220) * 12,
            coverage: 'R1,000,000',
            deductible: 6000,
            status: 'pending',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
            features: ['Comprehensive Cover', 'Fixed Excess', 'Accident Management'],
            exclusions: ['Racing', 'Commercial Use', 'Modifications'],
            discounts: [
              {
                type: 'loyalty',
                description: 'Loyalty Discount',
                amount: 5,
                isPercentage: true,
              },
            ],
            riskScore: Math.floor(Math.random() * 10) + 1,
            providerRating: 4.1,
            metadata: quoteRequest.metadata || {},
          },
        ];

        resolve({
          success: true,
          data: mockQuotes,
          timestamp: new Date(),
        });
      }, 2000); // Simulate API delay
    });
  },

  // Get quote by ID
  getQuote: async (quoteId: string): Promise<ApiResponse<Quote>> => {
    return apiClient.get<Quote>(`/quotes/${quoteId}`);
  },

  // Update quote status
  updateQuoteStatus: async (quoteId: string, status: string): Promise<ApiResponse<Quote>> => {
    return apiClient.put<Quote>(`/quotes/${quoteId}/status`, { status });
  },

  // Get user's quotes with pagination
  getUserQuotes: async (userId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<Quote[]>> => {
    return apiClient.get<Quote[]>(`/users/${userId}/quotes?page=${page}&limit=${limit}`);
  },
};

// Policy-related API functions
export const policyApi = {
  // Purchase a policy from a quote
  purchasePolicy: async (quoteId: string, paymentInfo: any): Promise<ApiResponse<Policy>> => {
    return apiClient.post<Policy>('/policies/purchase', { quoteId, paymentInfo });
  },

  // Get policy by ID
  getPolicy: async (policyId: string): Promise<ApiResponse<Policy>> => {
    return apiClient.get<Policy>(`/policies/${policyId}`);
  },

  // Get user's policies
  getUserPolicies: async (userId: string): Promise<ApiResponse<Policy[]>> => {
    return apiClient.get<Policy[]>(`/users/${userId}/policies`);
  },

  // Cancel a policy
  cancelPolicy: async (policyId: string, reason: string): Promise<ApiResponse<Policy>> => {
    return apiClient.put<Policy>(`/policies/${policyId}/cancel`, { reason });
  },

  // Renew a policy
  renewPolicy: async (policyId: string): Promise<ApiResponse<Policy>> => {
    return apiClient.post<Policy>(`/policies/${policyId}/renew`, {});
  },
};

// Provider-related API functions
export const providerApi = {
  // Get all insurance providers
  getProviders: async (): Promise<ApiResponse<Provider[]>> => {
    // Mock data for providers
    const mockProviders: Provider[] = [
      {
        id: 'santam',
        name: 'Santam',
        logo: 'https://via.placeholder.com/100x50/0066cc/ffffff?text=Santam',
        rating: 4.2,
        reviewCount: 1250,
        description: 'South Africa\'s largest short-term insurer with over 100 years of experience.',
        website: 'https://www.santam.co.za',
        phone: '0860 444 444',
        email: 'info@santam.co.za',
        licenseNumber: 'FSP3416',
        supportedTypes: ['auto', 'home', 'business'],
        features: ['24/7 Claims', 'Roadside Assistance', 'Online Portal'],
        established: new Date('1918-01-01'),
        headquarters: 'Cape Town, South Africa',
      },
      {
        id: 'discovery',
        name: 'Discovery Insure',
        logo: 'https://via.placeholder.com/100x50/00a651/ffffff?text=Discovery',
        rating: 4.5,
        reviewCount: 980,
        description: 'Innovative insurance with Vitality benefits and advanced telematics.',
        website: 'https://www.discovery.co.za',
        phone: '0860 99 88 77',
        email: 'insure@discovery.co.za',
        licenseNumber: 'FSP48657',
        supportedTypes: ['auto', 'home', 'life', 'health'],
        features: ['Vitality Benefits', 'DQ-Track', 'Wellness Programs'],
        established: new Date('2005-01-01'),
        headquarters: 'Johannesburg, South Africa',
      },
      {
        id: 'outsurance',
        name: 'Outsurance',
        logo: 'https://via.placeholder.com/100x50/ff6600/ffffff?text=Outsurance',
        rating: 4.1,
        reviewCount: 2100,
        description: 'Direct insurance with competitive rates and excellent service.',
        website: 'https://www.outsurance.co.za',
        phone: '0860 68 87 87',
        email: 'info@outsurance.co.za',
        licenseNumber: 'FSP15805',
        supportedTypes: ['auto', 'home', 'life'],
        features: ['Fixed Excess', 'Direct Claims', 'No Broker Fees'],
        established: new Date('1998-01-01'),
        headquarters: 'Centurion, South Africa',
      },
    ];

    return Promise.resolve({
      success: true,
      data: mockProviders,
      timestamp: new Date(),
    });
  },

  // Get provider by ID
  getProvider: async (providerId: string): Promise<ApiResponse<Provider>> => {
    return apiClient.get<Provider>(`/providers/${providerId}`);
  },
};

// User-related API functions
export const userApi = {
  // Get user profile
  getProfile: async (userId: string): Promise<ApiResponse<User>> => {
    return apiClient.get<User>(`/users/${userId}`);
  },

  // Update user profile
  updateProfile: async (userId: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    return apiClient.put<User>(`/users/${userId}`, userData);
  },

  // Get user analytics
  getUserAnalytics: async (userId: string): Promise<ApiResponse<AnalyticsData>> => {
    return apiClient.get<AnalyticsData>(`/users/${userId}/analytics`);
  },
};

// Analytics API functions
export const analyticsApi = {
  // Get system-wide analytics
  getSystemAnalytics: async (_params?: { from?: string; to?: string }): Promise<ApiResponse<AnalyticsData>> => {
    // Accepts params for date filtering (for real backend, would use them)
    // Mock analytics data (ignores params)
    const mockAnalytics: AnalyticsData = {
      totalQuotes: 15420,
      totalPolicies: 3890,
      conversionRate: 25.2,
      averagePremium: 485,
      popularInsuranceTypes: [
        { type: 'auto', count: 8500, percentage: 55.1 },
        { type: 'home', count: 4200, percentage: 27.2 },
        { type: 'life', count: 1800, percentage: 11.7 },
        { type: 'health', count: 700, percentage: 4.5 },
        { type: 'business', count: 220, percentage: 1.4 },
      ],
      topProviders: [
        { name: 'Santam', quoteCount: 5200, policyCount: 1300, rating: 4.2 },
        { name: 'Discovery Insure', quoteCount: 4800, policyCount: 1450, rating: 4.5 },
        { name: 'Outsurance', quoteCount: 5420, policyCount: 1140, rating: 4.1 },
      ],
      monthlyTrends: [
        { month: '2024-01', quotes: 1200, policies: 280, revenue: 136800 },
        { month: '2024-02', quotes: 1350, policies: 320, revenue: 155200 },
        { month: '2024-03', quotes: 1480, policies: 380, revenue: 184400 },
        { month: '2024-04', quotes: 1620, policies: 420, revenue: 203700 },
        { month: '2024-05', quotes: 1750, policies: 465, revenue: 225525 },
        { month: '2024-06', quotes: 1890, policies: 510, revenue: 247350 },
      ],
      userGrowth: [
        { month: '2024-01', newUsers: 450, totalUsers: 12500 },
        { month: '2024-02', newUsers: 520, totalUsers: 13020 },
        { month: '2024-03', newUsers: 680, totalUsers: 13700 },
        { month: '2024-04', newUsers: 750, totalUsers: 14450 },
        { month: '2024-05', newUsers: 820, totalUsers: 15270 },
        { month: '2024-06', newUsers: 890, totalUsers: 16160 },
      ],
    };

    return Promise.resolve({
      success: true,
      data: mockAnalytics,
      timestamp: new Date(),
    });
  },
};

// Credit check API functions
export const creditApi = {
  // Perform credit check for better quote accuracy
  performCreditCheck: async (userId: string, idNumber: string): Promise<ApiResponse<any>> => {
    // Mock credit check - in production this would call a real credit bureau API
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockCreditData = {
          userId, // Include userId to use the parameter
          idNumber, // Include idNumber to use the parameter and avoid unused variable error
          score: Math.floor(Math.random() * 400) + 400, // Score between 400-800
          rating: ['Poor', 'Fair', 'Good', 'Excellent'][Math.floor(Math.random() * 4)],
          factors: [
            'Payment history',
            'Credit utilization',
            'Length of credit history',
            'Types of credit',
          ],
          recommendations: [
            'Pay bills on time',
            'Keep credit utilization low',
            'Monitor credit report regularly',
          ],
        };

        resolve({
          success: true,
          data: mockCreditData,
          timestamp: new Date(),
        });
      }, 1500);
    });
  },
};

// Export all API functions
export default {
  quote: quoteApi,
  policy: policyApi,
  provider: providerApi,
  user: userApi,
  analytics: analyticsApi,
  credit: creditApi,
};