const { v4: uuidv4 } = require('uuid');

/**
 * Middleware to add a unique request ID to each request
 */
const requestId = (req, res, next) => {
    const id = uuidv4();
    req.id = id;
    res.setHeader('X-Request-Id', id);
    next();
};

module.exports = requestId;
