/**
 * Authentication helpers for integration tests.
 * Handles login, registration, cookie extraction, and authenticated requests.
 */
const request = require('supertest');
const app = require('../../app');

/**
 * Extract cookies string and CSRF token from a response
 */
const extractAuth = (res) => {
    const rawCookies = res.headers['set-cookie'] || [];
    const cookieString = rawCookies.map(c => c.split(';')[0]).join('; ');

    // Extract CSRF token value from csrfToken cookie
    const csrfCookie = rawCookies.find(c => c.startsWith('csrfToken='));
    const csrfToken = csrfCookie ? csrfCookie.split('=')[1].split(';')[0] : null;

    return { cookies: cookieString, csrfToken };
};

/**
 * Login and return the full cookie string + CSRF token for subsequent requests.
 * @returns {{ cookies: string, csrfToken: string, body: object, status: number }}
 */
const loginUser = async (username, password, companyId = undefined) => {
    const payload = { username, password };
    if (companyId) payload.companyId = companyId;

    const res = await request(app)
        .post('/api/v1/auth/login')
        .send(payload);

    const { cookies, csrfToken } = extractAuth(res);
    return { cookies, csrfToken, body: res.body, status: res.status };
};

/**
 * Register a company and return auth context
 */
const registerCompany = async (data) => {
    const res = await request(app)
        .post('/api/v1/auth/register-company')
        .send(data);

    const { cookies, csrfToken } = extractAuth(res);
    return { cookies, csrfToken, body: res.body, status: res.status };
};

/**
 * Make an authenticated GET request
 */
const authGet = (url, cookies) => {
    return request(app)
        .get(url)
        .set('Cookie', cookies);
};

/**
 * Make an authenticated POST with CSRF token
 */
const authPost = (url, cookies, csrfToken, body = {}) => {
    return request(app)
        .post(url)
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken)
        .send(body);
};

/**
 * Make an authenticated PUT with CSRF token
 */
const authPut = (url, cookies, csrfToken, body = {}) => {
    return request(app)
        .put(url)
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken)
        .send(body);
};

/**
 * Make an authenticated PATCH with CSRF token
 */
const authPatch = (url, cookies, csrfToken, body = {}) => {
    return request(app)
        .patch(url)
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken)
        .send(body);
};

/**
 * Make an authenticated DELETE with CSRF token
 */
const authDelete = (url, cookies, csrfToken) => {
    return request(app)
        .delete(url)
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken);
};

module.exports = {
    extractAuth,
    loginUser,
    registerCompany,
    authGet,
    authPost,
    authPut,
    authPatch,
    authDelete,
};
