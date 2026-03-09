const Company = require('../models/Company');
const User = require('../models/User');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');

/**
 * Get all companies with stats
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Companies and pagination
 */
exports.getCompanies = async (options) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const filter = { status: { $ne: 'deleted' } };

    const total = await Company.countDocuments(filter);
    const companies = await Company.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const companiesWithStats = await Promise.all(
        companies.map(async (company) => {
            const adminCount = await User.countDocuments({ company: company._id, role: 'admin', isDeleted: { $ne: true } });
            const employeeCount = await User.countDocuments({ company: company._id, role: 'employee', isDeleted: { $ne: true } });
            return {
                ...company,
                adminCount,
                employeeCount,
            };
        })
    );

    return {
        companies: companiesWithStats,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        }
    };
};

/**
 * Delete a company (archive)
 * @param {string} companyId - ID of company
 * @returns {Promise<Object>} Result
 */
exports.deleteCompany = async (companyId) => {
    const company = await Company.findById(companyId);
    if (!company) {
        throw new AppError('Company not found', 404);
    }

    if (company.status === 'deleted') {
        throw new AppError('Company is already deleted', 400);
    }

    company.status = 'deleted';
    company.deletedAt = Date.now();
    await company.save();

    logger.info({ companyId: company._id }, `Company deleted: ${company.name}`);

    return { name: company.name };
};

/**
 * Toggle company status
 * @param {string} companyId - ID of company
 * @returns {Promise<Object>} Updated company
 */
exports.toggleCompanyStatus = async (companyId) => {
    const company = await Company.findById(companyId);
    if (!company) {
        throw new AppError('Company not found', 404);
    }

    if (company.status === 'deleted') {
        throw new AppError('Cannot toggle a deleted company', 400);
    }

    company.status = company.status === 'active' ? 'blocked' : 'active';
    await company.save();

    logger.warn({ companyId: company._id, status: company.status }, `Company status toggled to ${company.status} for ${company.name}`);

    return company;
};
