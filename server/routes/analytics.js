const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Mock data storage for analytics
let analyticsData = {
  quotes: [],
  policies: [],
  users: [],
  providers: []
};

// Get dashboard analytics
router.get('/dashboard', (req, res) => {
  try {
    const { timeRange = '30d', userId } = req.query;
    
    const analytics = generateDashboardAnalytics(timeRange, userId);

    res.json({
      success: true,
      data: analytics,
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

// Get quote analytics
router.get('/quotes', (req, res) => {
  try {
    const { timeRange = '30d', type, provider } = req.query;
    
    const quoteAnalytics = generateQuoteAnalytics(timeRange, type, provider);

    res.json({
      success: true,
      data: quoteAnalytics,
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

// Get policy analytics
router.get('/policies', (req, res) => {
  try {
    const { timeRange = '30d', status, type } = req.query;
    
    const policyAnalytics = generatePolicyAnalytics(timeRange, status, type);

    res.json({
      success: true,
      data: policyAnalytics,
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

// Get user analytics (admin only)
router.get('/users', (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const userAnalytics = generateUserAnalytics(timeRange);

    res.json({
      success: true,
      data: userAnalytics,
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

// Get provider performance analytics
router.get('/providers', (req, res) => {
  try {
    const { timeRange = '30d', providerId } = req.query;
    
    const providerAnalytics = generateProviderAnalytics(timeRange, providerId);

    res.json({
      success: true,
      data: providerAnalytics,
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

// Get conversion funnel analytics
router.get('/conversion-funnel', (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const conversionFunnel = generateConversionFunnel(timeRange);

    res.json({
      success: true,
      data: conversionFunnel,
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

// Track user event
router.post('/events', (req, res) => {
  try {
    const { userId, eventType, eventData, timestamp } = req.body;
    
    if (!eventType) {
      return res.status(400).json({
        success: false,
        error: 'Event type is required',
        timestamp: new Date().toISOString()
      });
    }

    const event = {
      id: uuidv4(),
      userId: userId || 'anonymous',
      eventType,
      eventData: eventData || {},
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      userAgent: req.headers['user-agent'],
      ip: req.ip
    };

    // Store event (in real app, this would go to a database/analytics service)
    if (!analyticsData.events) {
      analyticsData.events = [];
    }
    analyticsData.events.push(event);

    res.status(201).json({
      success: true,
      data: { eventId: event.id },
      message: 'Event tracked successfully',
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

// Get revenue analytics
router.get('/revenue', (req, res) => {
  try {
    const { timeRange = '30d', breakdown = 'monthly' } = req.query;
    
    const revenueAnalytics = generateRevenueAnalytics(timeRange, breakdown);

    res.json({
      success: true,
      data: revenueAnalytics,
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

// Helper functions for generating analytics data

function generateDashboardAnalytics(timeRange, userId) {
  return {
    summary: {
      totalQuotes: Math.floor(Math.random() * 500) + 100,
      totalPolicies: Math.floor(Math.random() * 200) + 50,
      totalUsers: Math.floor(Math.random() * 1000) + 200,
      conversionRate: (Math.random() * 0.3 + 0.1).toFixed(2), // 10-40%
      averageQuoteValue: Math.floor(Math.random() * 1000) + 800,
      totalRevenue: Math.floor(Math.random() * 100000) + 50000
    },
    trends: {
      quotesGrowth: (Math.random() * 20 - 10).toFixed(1), // -10% to +10%
      policiesGrowth: (Math.random() * 20 - 10).toFixed(1),
      revenueGrowth: (Math.random() * 25 - 5).toFixed(1), // -5% to +20%
      userGrowth: (Math.random() * 15 + 5).toFixed(1) // +5% to +20%
    },
    chartData: generateChartData(timeRange),
    topInsuranceTypes: [
      { type: 'auto', count: 45, percentage: 45 },
      { type: 'home', count: 30, percentage: 30 },
      { type: 'life', count: 15, percentage: 15 },
      { type: 'business', count: 10, percentage: 10 }
    ]
  };
}

function generateQuoteAnalytics(timeRange, type, provider) {
  return {
    totalQuotes: Math.floor(Math.random() * 300) + 50,
    quotesThisPeriod: Math.floor(Math.random() * 100) + 20,
    averageQuoteValue: Math.floor(Math.random() * 1000) + 600,
    conversionRate: (Math.random() * 0.4 + 0.15).toFixed(2),
    byInsuranceType: {
      'auto': Math.floor(Math.random() * 100) + 30,
      'home': Math.floor(Math.random() * 80) + 20,
      'life': Math.floor(Math.random() * 50) + 10,
      'business': Math.floor(Math.random() * 30) + 5
    },
    byProvider: {
      'santam': Math.floor(Math.random() * 80) + 20,
      'discovery': Math.floor(Math.random() * 70) + 25,
      'outsurance': Math.floor(Math.random() * 60) + 15
    },
    statusDistribution: {
      'pending': Math.floor(Math.random() * 50) + 20,
      'accepted': Math.floor(Math.random() * 30) + 10,
      'declined': Math.floor(Math.random() * 20) + 5,
      'expired': Math.floor(Math.random() * 15) + 3
    }
  };
}

function generatePolicyAnalytics(timeRange, status, type) {
  return {
    totalPolicies: Math.floor(Math.random() * 150) + 30,
    activePolicies: Math.floor(Math.random() * 120) + 25,
    newPoliciesThisPeriod: Math.floor(Math.random() * 20) + 5,
    renewalRate: (Math.random() * 0.3 + 0.7).toFixed(2), // 70-100%
    averagePolicyValue: Math.floor(Math.random() * 1200) + 800,
    byStatus: {
      'active': Math.floor(Math.random() * 100) + 50,
      'expired': Math.floor(Math.random() * 30) + 10,
      'cancelled': Math.floor(Math.random() * 20) + 5,
      'pending': Math.floor(Math.random() * 15) + 3
    },
    expiringNext30Days: Math.floor(Math.random() * 25) + 5,
    claimsRatio: (Math.random() * 0.15 + 0.05).toFixed(3) // 5-20%
  };
}

function generateUserAnalytics(timeRange) {
  return {
    totalUsers: Math.floor(Math.random() * 800) + 200,
    newUsers: Math.floor(Math.random() * 50) + 10,
    activeUsers: Math.floor(Math.random() * 400) + 100,
    userGrowthRate: (Math.random() * 15 + 5).toFixed(1),
    averageQuotesPerUser: (Math.random() * 3 + 1).toFixed(1),
    averagePoliciesPerUser: (Math.random() * 1.5 + 0.5).toFixed(1),
    topUserSegments: [
      { segment: 'Young Professionals', count: 150, percentage: 35 },
      { segment: 'Families', count: 120, percentage: 28 },
      { segment: 'Small Business', count: 80, percentage: 19 },
      { segment: 'Seniors', count: 70, percentage: 16 },
      { segment: 'Students', count: 10, percentage: 2 }
    ],
    registrationSources: [
      { source: 'Organic Search', count: 200, percentage: 47 },
      { source: 'Social Media', count: 120, percentage: 28 },
      { source: 'Referral', count: 70, percentage: 16 },
      { source: 'Direct', count: 40, percentage: 9 }
    ]
  };
}

function generateProviderAnalytics(timeRange, providerId) {
  const providers = ['santam', 'discovery', 'outsurance'];
  
  return providers.map(provider => ({
    providerId: provider,
    name: provider.charAt(0).toUpperCase() + provider.slice(1),
    totalQuotes: Math.floor(Math.random() * 100) + 20,
    acceptedQuotes: Math.floor(Math.random() * 60) + 15,
    conversionRate: (Math.random() * 0.5 + 0.2).toFixed(2),
    averageQuoteValue: Math.floor(Math.random() * 800) + 600,
    customerRating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5-5.0
    responseTime: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
    claimsProcessingTime: Math.floor(Math.random() * 10) + 3 // 3-13 days
  }));
}

function generateConversionFunnel(timeRange) {
  const visitors = Math.floor(Math.random() * 1000) + 500;
  const quoteStarted = Math.floor(visitors * (Math.random() * 0.3 + 0.4)); // 40-70%
  const quoteCompleted = Math.floor(quoteStarted * (Math.random() * 0.4 + 0.6)); // 60-100%
  const quotesReceived = Math.floor(quoteCompleted * (Math.random() * 0.2 + 0.8)); // 80-100%
  const policyPurchased = Math.floor(quotesReceived * (Math.random() * 0.3 + 0.1)); // 10-40%

  return {
    stages: [
      {
        stage: 'Visitors',
        count: visitors,
        percentage: 100,
        dropOffRate: 0
      },
      {
        stage: 'Quote Started',
        count: quoteStarted,
        percentage: ((quoteStarted / visitors) * 100).toFixed(1),
        dropOffRate: (((visitors - quoteStarted) / visitors) * 100).toFixed(1)
      },
      {
        stage: 'Quote Completed',
        count: quoteCompleted,
        percentage: ((quoteCompleted / visitors) * 100).toFixed(1),
        dropOffRate: (((quoteStarted - quoteCompleted) / quoteStarted) * 100).toFixed(1)
      },
      {
        stage: 'Quotes Received',
        count: quotesReceived,
        percentage: ((quotesReceived / visitors) * 100).toFixed(1),
        dropOffRate: (((quoteCompleted - quotesReceived) / quoteCompleted) * 100).toFixed(1)
      },
      {
        stage: 'Policy Purchased',
        count: policyPurchased,
        percentage: ((policyPurchased / visitors) * 100).toFixed(1),
        dropOffRate: (((quotesReceived - policyPurchased) / quotesReceived) * 100).toFixed(1)
      }
    ],
    overallConversionRate: ((policyPurchased / visitors) * 100).toFixed(2)
  };
}

function generateRevenueAnalytics(timeRange, breakdown) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return {
    totalRevenue: Math.floor(Math.random() * 200000) + 100000,
    revenueGrowth: (Math.random() * 25 - 5).toFixed(1),
    averageRevenuePerUser: Math.floor(Math.random() * 500) + 300,
    monthlyRevenue: months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 20000) + 10000,
      policies: Math.floor(Math.random() * 50) + 20
    })),
    revenueByInsuranceType: {
      'auto': Math.floor(Math.random() * 80000) + 40000,
      'home': Math.floor(Math.random() * 50000) + 25000,
      'life': Math.floor(Math.random() * 30000) + 15000,
      'business': Math.floor(Math.random() * 40000) + 20000
    },
    projectedRevenue: Math.floor(Math.random() * 50000) + 120000
  };
}

function generateChartData(timeRange) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const data = [];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      quotes: Math.floor(Math.random() * 20) + 5,
      policies: Math.floor(Math.random() * 8) + 2,
      revenue: Math.floor(Math.random() * 5000) + 1000
    });
  }
  
  return data;
}

module.exports = router;