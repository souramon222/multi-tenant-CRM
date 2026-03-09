class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        // This ensures the custom error knows it's an "Operational" error 
        // (meaning we predicted it, like validation failed, user not found, etc.)
        this.isOperational = true;

        // Captures the stack trace, excluding the constructor call from it
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
