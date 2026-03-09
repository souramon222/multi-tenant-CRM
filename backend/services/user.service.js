const User = require('../models/User');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');

/**
 * Add a new employee
 * @param {Object} data - Employee data
 * @param {Object} user - Authenticated user (admin)
 * @returns {Promise<Object>} Created employee
 */
exports.addEmployee = async (data, user) => {
    const { name, username, email, password, serviceType, experience } = data;

    if (!password) {
        throw new AppError('Password is required', 400);
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
        throw new AppError('Email already exists', 400);
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
        throw new AppError('Username already exists', 400);
    }

    const employee = await User.create({
        name,
        username,
        email,
        password,
        role: 'employee',
        company: user.company,
        serviceType: serviceType || 'Full-time',
        experience: experience || 0,
    });

    logger.info({
        employeeId: employee._id,
        adminId: user.id || user._id,
        companyId: user.company
    }, `Employee added: ${employee.name}`);

    const { password: _, ...employeeData } = employee.toObject();
    return employeeData;
};

/**
 * Get employees for the admin's company
 * @param {Object} options - Pagination options
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Employees and pagination data
 */
exports.getEmployees = async (options, user) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const filter = {
        company: user.company,
        role: 'employee',
        isDeleted: { $ne: true }
    };

    const total = await User.countDocuments(filter);
    const employees = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    return {
        employees,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        }
    };
};

/**
 * Update an employee
 * @param {string} employeeId - ID of employee to update
 * @param {Object} data - Update data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Updated employee
 */
exports.updateEmployee = async (employeeId, data, user) => {
    const { name, email, serviceType, experience } = data;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (serviceType !== undefined) updateData.serviceType = serviceType;
    if (experience !== undefined) updateData.experience = experience;

    const employee = await User.findOneAndUpdate(
        { _id: employeeId, company: user.company, role: 'employee', isDeleted: { $ne: true } },
        updateData,
        { new: true, runValidators: true }
    ).select('-password');

    if (!employee) {
        throw new AppError('Employee not found', 404);
    }

    return employee;
};

/**
 * Delete an employee (soft delete)
 * @param {string} employeeId - ID of employee to delete
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Result
 */
exports.deleteEmployee = async (employeeId, user) => {
    const employee = await User.findOneAndUpdate(
        { _id: employeeId, company: user.company, role: 'employee', isDeleted: { $ne: true } },
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
    );

    if (!employee) {
        logger.warn({ employeeId, adminId: user.id || user._id, companyId: user.company }, `Employee deletion failure: Employee ${employeeId} not found or already deleted`);
        throw new AppError('Employee not found or already deleted', 404);
    }

    logger.info({ employeeId: employee._id, adminId: user.id || user._id, companyId: user.company }, `Employee deleted: ${employee.name} (${employee._id})`);

    return { success: true };
};

/**
 * Restore an employee
 * @param {string} employeeId - ID of employee to restore
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Restored employee
 */
exports.restoreEmployee = async (employeeId, user) => {
    const employee = await User.findOneAndUpdate(
        { _id: employeeId, company: user.company, role: 'employee', isDeleted: true },
        { isDeleted: false, deletedAt: null },
        { new: true }
    ).select('-password');

    if (!employee) {
        throw new AppError('Employee not found or not deleted', 404);
    }

    return employee;
};
