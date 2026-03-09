const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');
const { sendResponse } = require('../utils/apiResponse');

// Extract user from JWT token
const getUserFromToken = async (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify and decode token

    const user = await User.findOne({
        _id: decoded.id,
        isDeleted: { $ne: true } // ignore soft-deleted users
    })
    .select('_id role company') // only select required fields
    .populate({
        path: 'company',
        select: 'status name' // needed to check company status
    });

    return user;
};

// Middleware to protect private routes
const protect = async (req, res, next) => {
    const token = req.cookies?.accessToken; // read JWT from cookie

    if (!token) {
        return sendResponse(res, 401, false, 'Not authorized, no token');
    }
    
    try {
        const user = await getUserFromToken(token);
        if (!user) {
            return sendResponse(res, 401, false, 'User no longer exists');
        }
        // Block access if company is suspended/inactive
        if (user.company && user.company.status !== 'active') {
            return sendResponse(
                res,
                403,
                false,
                `Access denied. Company ${user.company.name} is ${user.company.status}.`
            );
        }
        req.user = user; // attach user to request for controllers
        next();

    } catch (error) {
        logger.warn(
            { requestId: req.id, error: error.message },
            'Auth failure: invalid or expired token'
        );
        return sendResponse(res, 401, false, 'Invalid or expired authentication token');
    }
};

// Optional auth middleware (route works with or without login)
const optionalProtect = async (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const user = await getUserFromToken(token);
        if (!user || (user.company && user.company.status !== 'active')) {
            req.user = null;
            return next();
        }
        req.user = user;
        next();

    } catch {
        req.user = null;
        next();
    }
};

module.exports = { protect, optionalProtect };