const activityService = require('../services/activity.service');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/apiResponse');
const getPagination = require('../utils/pagination');

// @desc    Add a note/activity to a customer
// @route   POST /api/v1/customers/:id/activities
// @access  Private
exports.addActivity = asyncHandler(async (req, res) => {
    const { note } = req.body;
    const activity = await activityService.addActivity({
        customerId: req.params.id,
        note,
        type: 'Manual'
    }, req.user);
    sendResponse(res, 201, true, 'Activity added', activity);
});

// @desc    Get activities for a customer
// @route   GET /api/v1/customers/:id/activities
// @access  Private
exports.getActivities = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const result = await activityService.getActivities(req.params.id, {
        page,
        limit,
        skip
    }, req.user);
    sendResponse(res, 200, true, 'Activities retrieved', result.activities, null, result.pagination);
});

// @desc    Update customer status/priority (shortcut for employees)
// @route   PATCH /api/v1/customers/:id/status
// @access  Private
exports.updateStatus = asyncHandler(async (req, res) => {
    const customer = await activityService.updateCustomerStatus(req.params.id, req.body, req.user);
    sendResponse(res, 200, true, 'Customer status/priority updated', customer);
});
