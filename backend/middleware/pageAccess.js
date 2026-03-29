const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check page access permissions
const checkPageAccess = (allowedRoles = [], requireAuth = true) => {
    return async (req, res, next) => {
        try {
            let token;

            // Extract token from various sources
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            } else if (req.cookies && req.cookies.token) {
                token = req.cookies.token;
            } else if (req.query.token) {
                token = req.query.token;
            }

            // If authentication is required but no token provided
            if (requireAuth && !token) {
                return res.status(401).json({
                    success: false,
                    message: 'Access denied. Please login to continue.',
                    code: 'AUTH_REQUIRED',
                    redirectTo: '/login'
                });
            }

            // If token exists, verify it
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await User.findById(decoded.id).select('-password');

                    if (!user) {
                        return res.status(401).json({
                            success: false,
                            message: 'User not found. Please login again.',
                            code: 'USER_NOT_FOUND',
                            redirectTo: '/login'
                        });
                    }

                    // Check if user account is blocked
                    if (user.isBlocked) {
                        return res.status(403).json({
                            success: false,
                            message: 'Your account has been suspended. Please contact support.',
                            code: 'ACCOUNT_BLOCKED',
                            redirectTo: '/login'
                        });
                    }

                    req.user = user;

                    // Check role permissions if specified
                    if (allowedRoles.length > 0 && !allowedRoles.includes(user.userType)) {
                        const redirectPath = user.userType === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard';
                        return res.status(403).json({
                            success: false,
                            message: `Access denied. This page is only accessible to ${allowedRoles.join(' or ')} users.`,
                            code: 'INSUFFICIENT_PERMISSIONS',
                            redirectTo: redirectPath
                        });
                    }

                } catch (tokenError) {
                    if (requireAuth) {
                        return res.status(401).json({
                            success: false,
                            message: 'Invalid or expired session. Please login again.',
                            code: 'INVALID_TOKEN',
                            redirectTo: '/login'
                        });
                    }
                }
            }

            next();
        } catch (error) {
            console.error('Page access check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error during authentication',
                code: 'SERVER_ERROR'
            });
        }
    };
};

// Specific page access middlewares
const pageAccessMiddleware = {
    // Public pages (no authentication required)
    public: checkPageAccess([], false),

    // Authentication required but any role
    authenticated: checkPageAccess([], true),

    // Farmer only pages
    farmerOnly: checkPageAccess(['farmer'], true),

    // Buyer only pages
    buyerOnly: checkPageAccess(['buyer'], true),

    // Admin only pages (for future use)
    adminOnly: checkPageAccess(['admin'], true),

    // Guest only pages (login, register - redirect if already logged in)
    guestOnly: (req, res, next) => {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded) {
                    return res.status(400).json({
                        success: false,
                        message: 'You are already logged in',
                        code: 'ALREADY_AUTHENTICATED',
                        redirectTo: '/dashboard'
                    });
                }
            } catch (error) {
                // Token is invalid, allow access
            }
        }
        next();
    }
};

module.exports = {
    checkPageAccess,
    pageAccessMiddleware
};