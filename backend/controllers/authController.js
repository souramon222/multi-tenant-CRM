const authService = require('../services/auth.service');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/apiResponse');
const { setCsrfCookie } = require('../middlewares/csrf');

// --- Helpers ---

const cookieOptions = (maxAgeMs) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: maxAgeMs,
    path: '/',
});

const setAuthCookies = (res, tokens) => {
    res.cookie('accessToken', tokens.accessToken, cookieOptions(60 * 60 * 1000)); // 1 hour
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days
    setCsrfCookie(res); // CSRF token for double-submit pattern
};

const clearAuthCookies = (res) => {
    const clearOptions = {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };

    res.clearCookie('accessToken', clearOptions);
    res.clearCookie('refreshToken', clearOptions);
    res.clearCookie('csrfToken', { ...clearOptions, httpOnly: false });
};

// @desc    Register company and admin
// @route   POST /api/v1/auth/register-company
// @access  Public
exports.registerCompany = asyncHandler(async (req, res) => {
    const result = await authService.registerCompany(req.body);
    setAuthCookies(res, result.tokens);

    sendResponse(res, 201, true, 'Company registered successfully', {
        ...result.user,
        company: result.company,
    });
});

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    setAuthCookies(res, result.tokens);

    sendResponse(res, 200, true, 'Login successful', {
        ...result.user,
        company: result.company,
    });
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public (uses refresh cookie)
exports.refreshToken = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
        return sendResponse(res, 401, false, 'No refresh token');
    }

    try {
        const result = await authService.refreshToken(token);
        setAuthCookies(res, result.tokens);
        sendResponse(res, 200, true, 'Token refreshed');
    } catch (error) {
        clearAuthCookies(res);
        next(error);
    }
});

// @desc    Logout user (clear all auth cookies)
// @route   POST /api/v1/auth/logout
// @access  Public
exports.logoutUser = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (token) {
        await authService.logout(token);
    }
    clearAuthCookies(res);
    sendResponse(res, 200, true, 'Logged out successfully');
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
    if (!req.user) {
        return sendResponse(res, 200, true, 'No active session', null);
    }

    const user = await authService.getCurrentUser(req.user.id);

    // Ensure CSRF cookie exists (covers sessions established before CSRF was deployed)
    if (!req.cookies?.csrfToken) {
        setCsrfCookie(res);
    }

    sendResponse(res, 200, true, 'User data retrieved', user);
});
