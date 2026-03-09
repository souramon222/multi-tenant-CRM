const companyService = require('../services/company.service');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/apiResponse');
const getPagination = require('../utils/pagination');

// @desc    Get all companies with admin count
// @route   GET /api/v1/superadmin/companies
// @access  Private/Superadmin
exports.getCompanies = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const result = await companyService.getCompanies({ page, limit, skip });
    sendResponse(res, 200, true, 'Companies retrieved', result.companies, null, result.pagination);
});

// @desc    Delete a company and its users
// @route   DELETE /api/v1/superadmin/companies/:id
// @access  Private/Superadmin
exports.deleteCompany = asyncHandler(async (req, res) => {
    const result = await companyService.deleteCompany(req.params.id);
    sendResponse(res, 200, true, `Company "${result.name}" has been archived`);
});

// @desc    Toggle company status (active/blocked)
// @route   PUT /api/v1/superadmin/companies/:id/toggle-status
// @access  Private/Superadmin
exports.toggleCompanyStatus = asyncHandler(async (req, res) => {
    const company = await companyService.toggleCompanyStatus(req.params.id);
    sendResponse(res, 200, true, `Company status updated to ${company.status}`, company);
});
