const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

/**
 * Assign employee to customer
 * @param {Object} data - Assignment data (employeeId, customerId)
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Created assignment
 */
exports.createAssignment = async (data, user) => {
    const { employeeId, customerId } = data;

    if (!mongoose.Types.ObjectId.isValid(employeeId) || !mongoose.Types.ObjectId.isValid(customerId)) {
        throw new AppError('Invalid employee or customer ID', 400);
    }

    const employee = await User.findOne({ _id: employeeId, company: user.company, role: 'employee', isDeleted: { $ne: true } });
    if (!employee) {
        throw new AppError('Employee not found in your company', 404);
    }

    const customer = await Customer.findOne({ _id: customerId, company: user.company, isDeleted: { $ne: true } });
    if (!customer) {
        throw new AppError('Customer not found in your company', 404);
    }

    const existing = await Assignment.findOne({ employee: employeeId, customer: customerId, company: user.company });
    if (existing) {
        throw new AppError('Already assigned', 400);
    }

    const assignment = await Assignment.create({
        employee: employeeId,
        customer: customerId,
        company: user.company,
    });

    return assignment;
};

/**
 * Get assignments for a company
 * @param {Object} options - Pagination options
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Assignments and pagination
 */
exports.getAssignments = async (options, user) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const filter = { company: user.company };

    const total = await Assignment.countDocuments(filter);
    let assignments = await Assignment.find(filter)
        .populate({ path: 'employee', select: 'name serviceType experience', match: { isDeleted: false } })
        .populate({ path: 'customer', select: 'name', match: { isDeleted: false } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    // Filter out assignments where employee or customer is soft-deleted
    assignments = assignments.filter(a => a.employee !== null && a.customer !== null);

    const filteredTotal = assignments.length;

    return {
        assignments,
        pagination: {
            total: filteredTotal,
            page,
            pages: Math.ceil(filteredTotal / limit),
            limit
        }
    };
};

/**
 * Get assigned customers for employee
 * @param {Object} options - Pagination options
 * @param {Object} user - Authenticated user (employee)
 * @returns {Promise<Object>} Customers and pagination
 */
exports.getEmployeeAssignments = async (options, user) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const filter = { employee: user.id };

    const total = await Assignment.countDocuments(filter);
    const assignments = await Assignment.find(filter)
        .populate({ path: 'customer', match: { isDeleted: { $ne: true } } })
        .sort({ assignedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const customers = assignments
        .map(a => a.customer)
        .filter(c => c !== null);

    const filteredTotal = customers.length;

    return {
        customers,
        pagination: {
            total: filteredTotal,
            page,
            pages: Math.ceil(filteredTotal / limit),
            limit
        }
    };
};
