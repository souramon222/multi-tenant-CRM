const crypto = require('crypto');
const { sendResponse } = require('../utils/apiResponse');

const CSRF_COOKIE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

//Helper: Generate token and set cookie

const setCsrfCookie = (res) => {
    const token = crypto.randomUUID();

    res.cookie('csrfToken', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: CSRF_COOKIE_EXPIRY_MS,
        path: '/',
    });

    return token;
};

//Route handler: issue CSRF token

const issueCsrfToken = (req, res) => {
    const token = setCsrfCookie(res);

    return sendResponse(res, 200, true, 'CSRF token issued', {
        csrfToken: token
    });
};


//Middleware: verify CSRF

const verifyCsrf = (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const cookieToken = req.cookies?.csrfToken;
    const headerToken = req.headers['x-csrf-token'];

    if (!cookieToken || !headerToken) {
        return sendResponse(res, 403, false, 'CSRF token missing');
    }

    const cookieBuffer = Buffer.from(cookieToken);
    const headerBuffer = Buffer.from(headerToken);

    if (
        cookieBuffer.length !== headerBuffer.length ||
        !crypto.timingSafeEqual(cookieBuffer, headerBuffer)
    ) {
        return sendResponse(res, 403, false, 'Invalid CSRF token');
    }

    next();
};

module.exports = {
    setCsrfCookie,
    issueCsrfToken,
    verifyCsrf
};