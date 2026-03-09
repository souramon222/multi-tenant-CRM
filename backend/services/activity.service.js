const Activity = require('../models/Activity');
const Customer = require('../models/Customer');
const AppError = require('../utils/AppError');

/**
 * Add an activity
 * @param {Object} data - Activity data (customerId, note, type)
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Created activity
 */
exports.addActivity = async (data, user) => {
    const { customerId, note, type = 'Manual' } = data;

    // Verify customer belongs to user's company
    const customer = await Customer.findOne({ _id: customerId, company: user.company, isDeleted: { $ne: true } });
    if (!customer) {
        throw new AppError('Customer not found', 404);
    }

    const activity = await Activity.create({
        customer: customerId,
        user: user.id,
        note,
        type
    });

    return activity;
};

/**
 * Get activities for a customer
 * @param {string} customerId - ID of customer
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Activities and pagination
 */
exports.getActivities = async (customerId, options, user) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // Verify customer belongs to user's company
    const customer = await Customer.findOne({ _id: customerId, company: user.company, isDeleted: { $ne: true } });
    if (!customer) {
        throw new AppError('Customer not found', 404);
    }

    const filter = { customer: customerId };

    const total = await Activity.countDocuments(filter);
    const activities = await Activity.find(filter)
        .populate('user', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    return {
        activities,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        }
    };
};

/**
 * Update customer status/priority and log activity
 * @param {string} customerId - ID of customer
 * @param {Object} data - Update data (status, priority)
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Updated customer
 */
exports.updateCustomerStatus = async (customerId, data, user) => {
    const { status, priority } = data;

    const customer = await Customer.findOne({ _id: customerId, company: user.company, isDeleted: { $ne: true } });
    if (!customer) {
        throw new AppError('Customer not found', 404);
    }

    const oldStatus = customer.status;
    const oldPriority = customer.priority;

    if (status) customer.status = status;
    if (priority) customer.priority = priority;

    await customer.save();

    // Log activity
    if (status && status !== oldStatus) {
        await Activity.create({
            customer: customerId,
            user: user.id,
            note: `Status updated to ${status}`,
            type: 'System'
        });
    }
    if (priority && priority !== oldPriority) {
        await Activity.create({
            customer: customerId,
            user: user.id,
            note: `Priority updated to ${priority}`,
            type: 'System'
        });
    }

    return customer;
};
