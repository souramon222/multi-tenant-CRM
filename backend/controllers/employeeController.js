const assignmentService = require('../services/assignment.service');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/apiResponse');
const getPagination = require('../utils/pagination');

// @desc    Get assigned customers for employee
// @route   GET /api/v1/employee/assignments
// @access  Private/Employee
exports.getAssignedCustomers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const result = await assignmentService.getEmployeeAssignments({ page, limit, skip }, req.user);
    sendResponse(res, 200, true, 'Assigned customers retrieved', result.customers, null, result.pagination);
});
