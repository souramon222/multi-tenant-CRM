const logger = require('../config/logger');

/**
 * Middleware to log incoming requests and outgoing responses
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log request start
    logger.info({
        requestId: req.id,
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        tenantId: req.user ? req.user.company : undefined,
    }, `Incoming ${req.method} ${req.originalUrl || req.url}`);

    // Capture response finish
    res.on('finish', () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 400 ? 'warn' : 'info';

        logger[level]({
            requestId: req.id,
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user ? req.user.id : undefined,
        }, `Response ${res.statusCode} ${req.method} ${req.originalUrl || req.url} - ${duration}ms`);
    });

    next();
};

module.exports = requestLogger;
