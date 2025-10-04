const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Mock data storage (in production, this would be a database)
let policies = [];

// Get all policies for a user
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { status, type, page = 1, limit = 10 } = req.query;
    
    let userPolicies = policies.filter(p => p.userId === userId);
    
    // Filter by status
    if (status) {
      userPolicies = userPolicies.filter(p => p.status === status);
    }
    
    // Filter by type
    if (type) {
      userPolicies = userPolicies.filter(p => p.type === type);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPolicies = userPolicies.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        policies: paginatedPolicies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: userPolicies.length,
          totalPages: Math.ceil(userPolicies.length / limit)
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

// Get specific policy by ID
router.get('/:policyId', (req, res) => {
  try {
    const policy = policies.find(p => p.id === req.params.policyId);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: policy,
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

// Create new policy from accepted quote
router.post('/', (req, res) => {
  try {
    const { quoteId, userId, personalInfo, paymentInfo } = req.body;
    
    // Validate required fields
    if (!quoteId || !userId || !personalInfo || !paymentInfo) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: quoteId, userId, personalInfo, paymentInfo',
        timestamp: new Date().toISOString()
      });
    }

    const newPolicy = {
      id: uuidv4(),
      policyNumber: `POL${Date.now()}${Math.floor(Math.random() * 1000)}`,
      quoteId,
      userId,
      status: 'active',
      type: personalInfo.insuranceType || 'auto',
      provider: personalInfo.provider || 'Unknown',
      premium: personalInfo.premium || 0,
      coverage: personalInfo.coverage || 'Standard',
      deductible: personalInfo.deductible || 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      paymentMethod: paymentInfo.method,
      paymentFrequency: paymentInfo.frequency || 'monthly',
      personalInfo,
      features: generatePolicyFeatures(personalInfo.insuranceType),
      documents: [],
      claims: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    policies.push(newPolicy);

    res.status(201).json({
      success: true,
      data: newPolicy,
      message: 'Policy created successfully',
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

// Update policy
router.put('/:policyId', (req, res) => {
  try {
    const policyIndex = policies.findIndex(p => p.id === req.params.policyId);
    
    if (policyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found',
        timestamp: new Date().toISOString()
      });
    }

    // Update policy with provided fields
    const updatedPolicy = {
      ...policies[policyIndex],
      ...req.body,
      updatedAt: new Date()
    };

    policies[policyIndex] = updatedPolicy;

    res.json({
      success: true,
      data: updatedPolicy,
      message: 'Policy updated successfully',
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

// Cancel policy
router.post('/:policyId/cancel', (req, res) => {
  try {
    const policyIndex = policies.findIndex(p => p.id === req.params.policyId);
    
    if (policyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found',
        timestamp: new Date().toISOString()
      });
    }

    const { reason, effectiveDate } = req.body;

    policies[policyIndex].status = 'cancelled';
    policies[policyIndex].cancellationReason = reason || 'Customer request';
    policies[policyIndex].cancellationDate = effectiveDate ? new Date(effectiveDate) : new Date();
    policies[policyIndex].updatedAt = new Date();

    res.json({
      success: true,
      data: policies[policyIndex],
      message: 'Policy cancelled successfully',
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

// Renew policy
router.post('/:policyId/renew', (req, res) => {
  try {
    const policyIndex = policies.findIndex(p => p.id === req.params.policyId);
    
    if (policyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found',
        timestamp: new Date().toISOString()
      });
    }

    const policy = policies[policyIndex];
    
    if (policy.status !== 'active' && policy.status !== 'expiring') {
      return res.status(400).json({
        success: false,
        error: 'Policy cannot be renewed in current status',
        timestamp: new Date().toISOString()
      });
    }

    // Create renewal
    const renewalData = req.body;
    const newEndDate = new Date(policy.endDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    policies[policyIndex] = {
      ...policy,
      status: 'active',
      premium: renewalData.premium || policy.premium,
      endDate: newEndDate,
      renewalDate: newEndDate,
      renewalHistory: [
        ...(policy.renewalHistory || []),
        {
          renewalDate: new Date(),
          previousEndDate: policy.endDate,
          newEndDate: newEndDate,
          premiumChange: (renewalData.premium || policy.premium) - policy.premium
        }
      ],
      updatedAt: new Date()
    };

    res.json({
      success: true,
      data: policies[policyIndex],
      message: 'Policy renewed successfully',
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

// Get policy documents
router.get('/:policyId/documents', (req, res) => {
  try {
    const policy = policies.find(p => p.id === req.params.policyId);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: policy.documents || [],
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

// Add policy document
router.post('/:policyId/documents', (req, res) => {
  try {
    const policyIndex = policies.findIndex(p => p.id === req.params.policyId);
    
    if (policyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found',
        timestamp: new Date().toISOString()
      });
    }

    const { name, type, url, description } = req.body;

    const newDocument = {
      id: uuidv4(),
      name,
      type,
      url,
      description,
      uploadDate: new Date(),
      size: req.body.size || 0
    };

    if (!policies[policyIndex].documents) {
      policies[policyIndex].documents = [];
    }

    policies[policyIndex].documents.push(newDocument);
    policies[policyIndex].updatedAt = new Date();

    res.status(201).json({
      success: true,
      data: newDocument,
      message: 'Document added successfully',
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

// Get policy claims
router.get('/:policyId/claims', (req, res) => {
  try {
    const policy = policies.find(p => p.id === req.params.policyId);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: policy.claims || [],
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

// Helper function to generate policy features
function generatePolicyFeatures(type) {
  const features = {
    auto: [
      { name: 'Comprehensive Cover', description: 'Full coverage for accidents, theft, and damage' },
      { name: '24/7 Roadside Assistance', description: 'Emergency roadside support nationwide' },
      { name: 'Rental Car Provision', description: 'Temporary replacement vehicle during repairs' }
    ],
    home: [
      { name: 'Building Insurance', description: 'Protection for the structure of your home' },
      { name: 'Contents Insurance', description: 'Coverage for personal belongings' },
      { name: 'Emergency Accommodation', description: 'Temporary housing if home becomes uninhabitable' }
    ],
    life: [
      { name: 'Death Benefit', description: 'Lump sum payment to beneficiaries' },
      { name: 'Disability Cover', description: 'Income protection for permanent disability' },
      { name: 'Critical Illness', description: 'Coverage for specified serious illnesses' }
    ],
    business: [
      { name: 'Public Liability', description: 'Protection against third-party claims' },
      { name: 'Business Interruption', description: 'Coverage for loss of income' },
      { name: 'Professional Indemnity', description: 'Protection against professional negligence claims' }
    ]
  };

  return features[type] || features.auto;
}

module.exports = router;