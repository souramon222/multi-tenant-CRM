const { body } = require('express-validator');

exports.registerValidation = [
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('adminName').trim().notEmpty().withMessage('Admin name is required'),
    body('adminUsername').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    body('adminEmail').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain a number')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
];

exports.loginValidation = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];

exports.employeeValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').optional()
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain a number')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
];

exports.updateEmployeeValidation = [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('serviceType').optional().trim().notEmpty().withMessage('Service type cannot be empty'),
    body('experience').optional().isNumeric().withMessage('Experience must be a number'),
];

exports.customerValidation = [
    body('name').trim().notEmpty().withMessage('Customer name is required'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email format'),
    body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Invalid phone number'),
    body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']).withMessage('Invalid priority level')
];

exports.updateCustomerValidation = [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email format'),
    body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Invalid phone number'),
    body('complaint').optional().trim(),
    body('status').optional().isIn(['New', 'Contacted', 'In Progress', 'On Hold', 'Resolved', 'Closed']).withMessage('Invalid status value'),
    body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']).withMessage('Invalid priority level'),
];
