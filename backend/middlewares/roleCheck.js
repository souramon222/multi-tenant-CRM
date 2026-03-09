const logger = require('../config/logger');
const { sendResponse } = require('../utils/apiResponse');

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            logger.warn({
                userId: req.user ? req.user.id : 'unauthenticated',
                role: req.user ? req.user.role : 'none',
                url: req.originalUrl,
                method: req.method,
                requiredRoles: roles
            }, 'Unauthorized role access attempt');
            return sendResponse(res, 403, false, `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`);
        }
        next();
    };
};

module.exports = { authorize };
