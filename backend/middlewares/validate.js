const { validationResult } = require('express-validator');
const { sendResponse } = require('../utils/apiResponse');

// @desc    Middleware to handle validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const message = errors.array().map(err => err.msg).join(', ');
        return sendResponse(res, 400, false, message);
    }
    next();
};

module.exports = validate;
