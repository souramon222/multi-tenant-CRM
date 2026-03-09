/**
 * Database seed factories for test data creation.
 * All factories produce unique data using timestamps + random suffixes.
 */
const User = require('../../models/User');
const Company = require('../../models/Company');
const Customer = require('../../models/Customer');
const Assignment = require('../../models/Assignment');

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * Create a company with optional overrides
 */
const createCompany = async (overrides = {}) => {
    return Company.create({
        name: `TestCompany-${uid()}`,
        ...overrides,
    });
};

/**
 * Create a user (admin/employee/superadmin)
 */
const createUser = async (overrides = {}) => {
    const id = uid();
    const defaults = {
        name: 'Test User',
        username: `user-${id}`,
        email: `test-${id}@example.com`,
        password: 'Test1234',
        role: 'admin',
    };
    return User.create({ ...defaults, ...overrides });
};

/**
 * Create a full company + admin pair (most common test setup)
 */
const createCompanyWithAdmin = async (companyOverrides = {}, adminOverrides = {}) => {
    const company = await createCompany(companyOverrides);
    const admin = await createUser({
        role: 'admin',
        company: company._id,
        ...adminOverrides,
    });
    return { company, admin };
};

/**
 * Create a customer scoped to a company
 */
const createCustomer = async (companyId, overrides = {}) => {
    const id = uid();
    return Customer.create({
        name: `Customer-${id}`,
        email: `cust-${id}@example.com`,
        phone: '1234567890',
        company: companyId,
        ...overrides,
    });
};

/**
 * Create a superadmin (no company)
 */
const createSuperadmin = async (overrides = {}) => {
    return createUser({
        name: 'Superadmin',
        role: 'superadmin',
        company: null,
        ...overrides,
    });
};

/**
 * Create an assignment linking employee → customer within a company
 */
const createAssignment = async (employeeId, customerId, companyId) => {
    return Assignment.create({
        employee: employeeId,
        customer: customerId,
        company: companyId,
    });
};

module.exports = {
    createCompany,
    createUser,
    createCompanyWithAdmin,
    createCustomer,
    createSuperadmin,
    createAssignment,
};
