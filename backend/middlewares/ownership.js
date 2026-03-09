const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const asyncHandler = require('./asyncHandler');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');

// Verify customer belongs to authenticated user's company
exports.checkCustomerOwnership = asyncHandler(async (req, res, next) => {

    const customerId = req.params.id;
    if (!customerId) return next(); // Skip if no ID

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return next(new AppError('Invalid customer ID', 400));
    }

    // Fetch only company field for ownership check
    const customer = await Customer.findOne({ _id: customerId, isDeleted: { $ne: true } }).select('company').lean();
    if (!customer) {
        return next(new AppError('Customer not found', 404));
    }

    // Superadmin bypass
    if (req.user.role === 'superadmin') {
        req.customer = customer;
        return next();
    }

    // Ensure user has company assigned
    if (!req.user.company) {
        return next(new AppError('User company not assigned', 403));
    }

    // Tenant isolation check
    const userCompanyId = req.user.company._id?.toString() || req.user.company.toString();
    const customerCompanyId = customer.company.toString();

    if (customerCompanyId !== userCompanyId) {
        logger.warn({
            userId: req.user.id,
            customerId,
            companyId: req.user.company._id || req.user.company,
            url: req.originalUrl,
            method: req.method
        }, 'SECURITY ALERT: Cross-company access attempt');
        return next(new AppError('Unauthorized access', 403));
    }

    req.customer = customer; // Attach for controller reuse
    next();
});