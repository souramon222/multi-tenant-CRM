const userService = require('../services/user.service');
const customerService = require('../services/customer.service');
const assignmentService = require('../services/assignment.service');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/apiResponse');
const getPagination = require('../utils/pagination');


// @desc    Add a new employee
// @route   POST /api/v1/admin/employees
exports.addEmployee = asyncHandler(async (req, res) => {
    const employee = await userService.addEmployee(req.body, req.user);
    sendResponse(res, 201, true, 'Employee created', employee);
});

// @desc    Get employees for the admin's company
// @route   GET /api/v1/admin/employees
exports.getEmployees = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const result = await userService.getEmployees({ page, limit, skip }, req.user);
    sendResponse(res, 200, true, 'Employees retrieved', result.employees, null, result.pagination);
});

// @desc    Update an employee
// @route   PUT /api/v1/admin/employees/:id
exports.updateEmployee = asyncHandler(async (req, res) => {
    const employee = await userService.updateEmployee(req.params.id, req.body, req.user);
    sendResponse(res, 200, true, 'Employee updated', employee);
});

// @desc    Delete an employee
// @route   DELETE /api/v1/admin/employees/:id
exports.deleteEmployee = asyncHandler(async (req, res) => {
    await userService.deleteEmployee(req.params.id, req.user);
    sendResponse(res, 200, true, 'Employee deleted');
});

// @desc    Restore an employee
// @route   PATCH /api/v1/admin/employees/:id/restore
exports.restoreEmployee = asyncHandler(async (req, res) => {
    const employee = await userService.restoreEmployee(req.params.id, req.user);
    sendResponse(res, 200, true, 'Employee restored', employee);
});

// @desc    Add a new customer
// @route   POST /api/v1/admin/customers
exports.addCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.addCustomer(req.body, req.user);
    sendResponse(res, 201, true, 'Customer created', customer);
});

// @desc    Get customers for the admin's company
// @route   GET /api/v1/admin/customers
exports.getCustomers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const result = await customerService.getCustomers({ page, limit, skip }, req.user);
    sendResponse(res, 200, true, 'Customers retrieved', result.customers, null, result.pagination);
});

// @desc    Update a customer
// @route   PUT /api/v1/admin/customers/:id
exports.updateCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.updateCustomer(req.params.id, req.body, req.user);
    sendResponse(res, 200, true, 'Customer updated', customer);
});

// @desc    Delete a customer
// @route   DELETE /api/v1/admin/customers/:id
exports.deleteCustomer = asyncHandler(async (req, res) => {
    await customerService.deleteCustomer(req.params.id, req.user);
    sendResponse(res, 200, true, 'Customer deleted');
});

// @desc    Restore a customer
// @route   PATCH /api/v1/admin/customers/:id/restore
exports.restoreCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.restoreCustomer(req.params.id, req.user);
    sendResponse(res, 200, true, 'Customer restored', customer);
});

// @desc    Assign candidate/customer to employee (direct association)
// @route   PUT /api/v1/admin/customers/:id/assign
exports.assignCustomerToEmployee = asyncHandler(async (req, res) => {
    const { employeeId } = req.body;
    const updatedCustomer = await customerService.assignToEmployee(req.params.id, employeeId, req.user);
    sendResponse(res, 200, true, `Customer assigned successfully`, updatedCustomer);
});

// @desc    Assign employee to customer
// @route   POST /api/v1/admin/assignments
exports.assignEmployee = asyncHandler(async (req, res) => {
    const assignment = await assignmentService.createAssignment(req.body, req.user);
    sendResponse(res, 201, true, 'Employee assigned to customer', assignment);
});

// @desc    Get assignments
// @route   GET /api/v1/admin/assignments
exports.getAssignments = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const result = await assignmentService.getAssignments({ page, limit, skip }, req.user);
    sendResponse(res, 200, true, 'Assignments retrieved', result.assignments, null, result.pagination);
});
