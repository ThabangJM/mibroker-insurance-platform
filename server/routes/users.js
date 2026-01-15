const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Mock data storage (in production, this would be a database)
let users = [];

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, dateOfBirth } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, firstName, lastName',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists with this email',
        timestamp: new Date().toISOString()
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: uuidv4(),
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      role: 'customer',
      status: 'active',
      emailVerified: false,
      profile: {
        avatar: null,
        preferences: {
          notifications: true,
          marketing: false,
          language: 'en'
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        role: newUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      },
      message: 'User registered successfully',
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

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        timestamp: new Date().toISOString()
      });
    }

    // Find user
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Account is inactive',
        timestamp: new Date().toISOString()
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        timestamp: new Date().toISOString()
      });
    }

    // Update last login
    user.lastLogin = new Date();
    user.updatedAt = new Date();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      data: {
        user: userResponse,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      },
      message: 'Login successful',
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

// Get user profile
router.get('/profile/:userId', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user can access this profile (own profile or admin)
    if (req.user.userId !== user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      data: userResponse,
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

// Update user profile
router.put('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.params.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user can update this profile (own profile or admin)
    if (req.user.userId !== users[userIndex].id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    const updateData = { ...req.body };
    delete updateData.password; // Prevent password update through this endpoint
    delete updateData.id; // Prevent ID changes
    delete updateData.email; // Prevent email changes without verification

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date()
    };

    // Remove password from response
    const { password: _, ...userResponse } = users[userIndex];

    res.json({
      success: true,
      data: userResponse,
      message: 'Profile updated successfully',
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

// Change password
router.post('/change-password/:userId', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required',
        timestamp: new Date().toISOString()
      });
    }

    const userIndex = users.findIndex(u => u.id === req.params.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user can change this password (own profile only)
    if (req.user.userId !== users[userIndex].id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[userIndex].password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
        timestamp: new Date().toISOString()
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    users[userIndex].password = hashedPassword;
    users[userIndex].updatedAt = new Date();

    res.json({
      success: true,
      message: 'Password changed successfully',
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

// Delete user account
router.delete('/:userId', authenticateToken, (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.params.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user can delete this account (own profile or admin)
    if (req.user.userId !== users[userIndex].id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    // Soft delete - mark as inactive instead of removing
    users[userIndex].status = 'deleted';
    users[userIndex].deletedAt = new Date();
    users[userIndex].updatedAt = new Date();

    res.json({
      success: true,
      message: 'Account deleted successfully',
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

// Get user's activity (admin only)
router.get('/:userId/activity', authenticateToken, (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        timestamp: new Date().toISOString()
      });
    }

    const user = users.find(u => u.id === req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Mock activity data
    const activity = {
      userId: user.id,
      loginHistory: [
        { timestamp: user.lastLogin, ip: '192.168.1.1', userAgent: 'Chrome' }
      ],
      quotesRequested: Math.floor(Math.random() * 10),
      policiesPurchased: Math.floor(Math.random() * 5),
      claimsSubmitted: Math.floor(Math.random() * 3),
      lastActivity: user.updatedAt
    };

    res.json({
      success: true,
      data: activity,
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

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      timestamp: new Date().toISOString()
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      });
    }

    req.user = user;
    next();
  });
}

module.exports = router;