const User = require('../models/User');
const Company = require('../models/Company');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');

const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Hash a token using SHA-256 for DB storage
 * @param {string} token 
 * @returns {string} Hashed token
 */
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate Access Token
 * @param {string} id - User ID
 * @returns {string} JWT access token
 */
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

/**
 * Generate Refresh Token
 * @param {string} id - User ID
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (id) => {
    return jwt.sign({ id, jti: uuidv4() }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE,
    });
};

/**
 * Register Company and Admin
 * @param {Object} data - Registration data
 * @returns {Promise<Object>} Created user and company
 */
exports.registerCompany = async (data) => {
    const { companyName, adminName, adminUsername, adminEmail, password } = data;

    const companyExists = await Company.findOne({ name: companyName });
    if (companyExists) {
        throw new AppError('Company already exists', 400);
    }

    const emailExists = await User.findOne({ email: adminEmail });
    if (emailExists) {
        throw new AppError('Email already exists', 400);
    }

    const usernameExists = await User.findOne({ username: adminUsername });
    if (usernameExists) {
        throw new AppError('Username already exists', 400);
    }

    const company = await Company.create({ name: companyName });

    const user = await User.create({
        name: adminName,
        username: adminUsername,
        email: adminEmail,
        password,
        role: 'admin',
        company: company._id
    });

    const result = {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        company,
        tokens: {
            accessToken: generateAccessToken(user._id),
            refreshToken: generateRefreshToken(user._id)
        }
    };

    // Save refresh token to DB (hashed)
    await RefreshToken.create({
        token: hashToken(result.tokens.refreshToken),
        user: user._id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    return result;
};

/**
 * Login User
 * @param {Object} credentials - Login credentials
 * @returns {Promise<Object>} User and tokens
 */
exports.login = async (credentials) => {
    const { username, password, companyId } = credentials;
    const user = await User.findOne({ username, isDeleted: { $ne: true } }).populate('company');

    if (!user) {
        logger.warn({ username, companyId }, `Login failure: User not found for username ${username}`);
        throw new AppError('Invalid credentials', 401);
    }

    if (user.role === 'employee') {
        if (!companyId) {
            throw new AppError('Company ID is required for employee login', 400);
        }
        if (!user.company || user.company.companyId !== companyId) {
            logger.warn({ userId: user._id, role: user.role, providedCompanyId: companyId }, `Login failure: Invalid Company ID for user ${user.username}`);
            throw new AppError('Invalid Company ID for this account', 401);
        }
    }

    if (user.company && user.company.status === 'deleted') {
        throw new AppError('This company account has been removed. Please contact support.', 403);
    }

    if (user.company && user.company.status === 'blocked') {
        logger.warn({ userId: user._id, companyId: user.company._id }, `Login failure: Company ${user.company.name} is blocked`);
        throw new AppError('Your company has been blocked. Please contact support.', 403);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        logger.warn({ userId: user._id, username: user.username }, `Login failure: Incorrect password for user ${user.username}`);
        throw new AppError('Invalid credentials', 401);
    }

    logger.info({ userId: user._id, role: user.role, companyId: user.company?._id }, `Login success: User ${user.username} logged in`);

    const result = {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        company: user.company,
        tokens: {
            accessToken: generateAccessToken(user._id),
            refreshToken: generateRefreshToken(user._id)
        }
    };

    // Save refresh token to DB (hashed)
    await RefreshToken.create({
        token: hashToken(result.tokens.refreshToken),
        user: user._id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    return result;
};

/**
 * Refresh Access Token
 * @param {string} token - Refresh token
 * @returns {Promise<Object>} New tokens or error
 */
exports.refreshToken = async (token) => {
    try {
        // 1. Verify JWT signature and expiration
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        // 2. Hash and check if token exists in DB (Family rotation pattern)
        const hashedToken = hashToken(token);
        const tokenRecord = await RefreshToken.findOne({ token: hashedToken });

        if (!tokenRecord) {
            logger.warn({ userId: decoded.id }, `Refresh token failure: Token not found in DB (already used or revoked)`);
            throw new AppError('Invalid or expired refresh token', 401);
        }

        // 3. Immediatly delete the used token (One-time use)
        await RefreshToken.deleteOne({ _id: tokenRecord._id });

        // 4. Check user existence
        const user = await User.findOne({ _id: decoded.id, isDeleted: { $ne: true } }).populate('company');

        if (!user) {
            logger.warn({ userId: decoded.id }, `Refresh token failure: User no longer exists`);
            throw new AppError('User no longer exists', 401);
        }

        // 5. Tenant check
        if (user.company && user.company.status !== 'active') {
            logger.warn({ userId: user._id, companyStatus: user.company.status }, `Refresh token failure: Company is ${user.company.status}`);
            throw new AppError(`Access denied. Company is ${user.company.status}.`, 403);
        }

        // 6. Generate and save new token
        const tokens = {
            accessToken: generateAccessToken(user._id),
            refreshToken: generateRefreshToken(user._id)
        };

        await RefreshToken.create({
            token: hashToken(tokens.refreshToken),
            user: user._id,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
        });

        logger.info({ userId: user._id }, `Refresh token success: Tokens rotated for user ${user.username}`);

        return {
            userId: user._id,
            tokens
        };
    } catch (error) {
        if (error.isOperational) throw error;
        logger.warn({ err: error.message }, `Refresh token failure: ${error.message}`);
        throw new AppError('Invalid or expired refresh token', 401);
    }
};

/**
 * Logout User
 * @param {string} token - Refresh token to invalidate
 */
exports.logout = async (token) => {
    if (!token) return;
    const hashedToken = hashToken(token);
    await RefreshToken.deleteOne({ token: hashedToken });
};

/**
 * Get Current User
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 */
exports.getCurrentUser = async (userId) => {
    const user = await User.findOne({ _id: userId, isDeleted: { $ne: true } })
        .select('-password')
        .populate('company');
    return user;
};
