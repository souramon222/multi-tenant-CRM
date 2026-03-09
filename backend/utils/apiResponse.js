/**
 * Standard API Response Helper
 * @param {boolean} success - Operation status
 * @param {string} message - User-friendly message
 * @param {any} data - Payload
 * @param {any} error - Error details (optional)
 */
const sendResponse = (res, statusCode, success, message, data = null, error = null, pagination = null) => {
    const response = {
        success,
        message,
    };

    response.data = data !== undefined ? data : null;
    if (pagination !== null) response.pagination = pagination;
    if (error !== null) response.error = error;

    return res.status(statusCode).json(response);
};

module.exports = { sendResponse };
