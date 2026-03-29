const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user is authenticated for any protected route
const requireAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in various places
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login to continue.',
        redirectTo: '/login'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Please login again.',
          redirectTo: '/login'
        });
      }

      // Check if user account is active
      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been blocked. Please contact support.',
          redirectTo: '/login'
        });
      }

      req.user = user;
      next();
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.',
        redirectTo: '/login'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      redirectTo: '/login'
    });
  }
};

// Middleware to check specific user roles
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        redirectTo: '/login'
      });
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This page is only accessible to ${allowedRoles.join(' or ')} users.`,
        redirectTo: req.user.userType === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource
const requireOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check ownership based on different resource types
      let isOwner = false;
      
      if (resource.farmer && resource.farmer.toString() === req.user._id.toString()) {
        isOwner = true;
      } else if (resource.buyer && resource.buyer.toString() === req.user._id.toString()) {
        isOwner = true;
      } else if (resource._id.toString() === req.user._id.toString()) {
        isOwner = true;
      }

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.',
          redirectTo: req.user.userType === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error while checking ownership'
      });
    }
  };
};

// Middleware to prevent access to auth pages when already logged in
const requireGuest = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      // If token is valid, user is already logged in
      return res.status(400).json({
        success: false,
        message: 'You are already logged in',
        redirectTo: '/dashboard'
      });
    } catch (error) {
      // Token is invalid, allow access to auth pages
      next();
    }
  } else {
    // No token, allow access to auth pages
    next();
  }
};

// Middleware to check if user's account is verified for sensitive operations
const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your account to access this feature.',
      redirectTo: '/verify-account'
    });
  }
  next();
};

module.exports = {
  requireAuth,
  requireRole,
  requireOwnership,
  requireGuest,
  requireVerification
};