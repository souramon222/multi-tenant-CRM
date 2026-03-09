const { sendResponse } = require('../utils/apiResponse');
const logger = require('../config/logger');

const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.name = err.name;
    error.message = err.message;
    error.code = err.code;
    error.statusCode = err.statusCode || 500;

    // Mongoose bad ObjectId
    if (error.name === 'CastError') {
        const message = 'Resource not found';
        error = new AppError(message, 404);
    }

    // Mongoose duplicate key
    if (error.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        const value = Object.values(err.keyValue || {})[0];
        const message = `Duplicate field value entered: ${field} (${value})`;
        error = new AppError(message, 400);
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new AppError(message, 400);
    }

    // Structured logging for error
    const logData = {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl || req.url,
        userId: req.user ? req.user.id : undefined,
        statusCode: error.statusCode,
    };

    if (process.env.NODE_ENV === 'development') {
        logData.stack = err.stack;
    }

    if (error.isOperational) {
        logger.warn(logData, `CLIENT ERROR: ${error.message}`);
    } else {
        logger.error(logData, `SERVER ERROR: ${error.message}`);
    }

    sendResponse(
        res,
        error.statusCode,
        false,
        error.message || 'Server Error',
        null,
        process.env.NODE_ENV === 'development' ? err.stack : null
    );
};

module.exports = errorHandler;