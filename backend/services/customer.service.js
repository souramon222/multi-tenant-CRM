const Customer = require('../models/Customer');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Assignment = require('../models/Assignment');
const mongoose = require('mongoose');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');

/**
 * Add a new customer
 * @param {Object} data - Customer data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Created customer
 */
exports.addCustomer = async (data, user) => {
    const { name, email, phone, complaint, priority } = data;

    const customer = await Customer.create({
        name,
        email,
        phone,
        complaint: complaint || '',
        priority: priority || 'Medium',
        company: user.company,
    });

    // Log system activity
    await Activity.create({
        customer: customer._id,
        user: user.id,
        note: `Customer created with ${priority || 'Medium'} priority.`,
        type: 'System'
    });

    logger.info({
        customerId: customer._id,
        userId: user.id || user._id,
        companyId: user.company,
        priority: priority || 'Medium'
    }, `Customer created: ${customer.name}`);

    return customer;
};

/**
 * Get customers for the admin's company
 * @param {Object} options - Pagination options
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Customers and pagination data
 */
exports.getCustomers = async (options, user) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const filter = {
        company: user.company,
        isDeleted: { $ne: true }
    };

    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
        .populate('assignedEmployee', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    return {
        customers,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        }
    };
};

/**
 * Update a customer
 * @param {string} customerId - ID of customer to update
 * @param {Object} data - Update data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Updated customer
 */
exports.updateCustomer = async (customerId, data, user) => {
    const { name, email, phone, complaint, status, priority } = data;

    // Find current state for activity logging
    const oldCustomer = await Customer.findOne({ _id: customerId, company: user.company, isDeleted: { $ne: true } });
    if (!oldCustomer) {
        throw new AppError('Customer not found', 404);
    }

    const customer = await Customer.findOneAndUpdate(
        { _id: customerId, company: user.company, isDeleted: { $ne: true } },
        { name, email, phone, complaint, status, priority },
        { new: true, runValidators: true }
    );

    // Log if status or priority changed
    if (status && status !== oldCustomer.status) {
        await Activity.create({
            customer: customer._id,
            user: user.id,
            note: `Status updated from ${oldCustomer.status} to ${status}`,
            type: 'System'
        });
    }
    if (priority && priority !== oldCustomer.priority) {
        await Activity.create({
            customer: customer._id,
            user: user.id,
            note: `Priority updated from ${oldCustomer.priority} to ${priority}`,
            type: 'System'
        });
    }

    return customer;
};

/**
 * Delete a customer (soft delete)
 * @param {string} customerId - ID of customer to delete
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Result
 */
exports.deleteCustomer = async (customerId, user) => {
    const customer = await Customer.findOneAndUpdate(
        { _id: customerId, company: user.company, isDeleted: { $ne: true } },
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
    );

    if (!customer) {
        logger.warn({ customerId, userId: user.id || user._id, companyId: user.company }, `Customer deletion failure: Customer ${customerId} not found or already deleted`);
        throw new AppError('Customer not found or already deleted', 404);
    }

    logger.info({ customerId: customer._id, userId: user.id || user._id, companyId: user.company }, `Customer deleted: ${customer.name} (${customer._id})`);

    return { success: true };
};

/**
 * Restore a customer
 * @param {string} customerId - ID of customer to restore
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Restored customer
 */
exports.restoreCustomer = async (customerId, user) => {
    const customer = await Customer.findOneAndUpdate(
        { _id: customerId, company: user.company, isDeleted: true },
        { isDeleted: false, deletedAt: null },
        { new: true }
    );

    if (!customer) {
        throw new AppError('Customer not found or not deleted', 404);
    }

    return customer;
};

/**
 * Assign customer to employee
 * @param {string} customerId - ID of customer
 * @param {string} employeeId - ID of employee
 * @param {Object} user - Authenticated user (admin)
 * @returns {Promise<Object>} Updated customer
 */
exports.assignToEmployee = async (customerId, employeeId, user) => {
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        throw new AppError('Invalid employee ID', 400);
    }

    const customer = await Customer.findOne({ _id: customerId, company: user.company, isDeleted: { $ne: true } });
    if (!customer) {
        throw new AppError('Customer not found', 404);
    }

    if (customer.assignedEmployee) {
        throw new AppError('Employee already assigned to this customer', 400);
    }

    const employee = await User.findOne({ _id: employeeId, company: user.company, role: 'employee', isDeleted: { $ne: true } });
    if (!employee) {
        throw new AppError('Employee not found in your company', 404);
    }

    customer.assignedEmployee = employeeId;
    await customer.save();

    // Create a legacy assignment record
    await Assignment.create({
        employee: employeeId,
        customer: customer._id,
        company: user.company
    });

    // Log Activity
    await Activity.create({
        customer: customer._id,
        user: user.id,
        note: `Customer assigned to ${employee.name}`,
        type: 'System'
    });

    return await Customer.findOne({ _id: customer._id, company: user.company, isDeleted: { $ne: true } }).populate('assignedEmployee', 'name email');
};
