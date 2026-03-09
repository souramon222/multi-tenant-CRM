const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Company = require('../../models/Company');
const RefreshToken = require('../../models/RefreshToken');
const crypto = require('crypto');

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

describe('Refresh Token DB Persistence & Rotation', () => {
    let adminUser;
    let company;

    beforeEach(async () => {
        company = await Company.create({ name: 'Test Token Company' });
        adminUser = await User.create({
            name: 'Token Admin',
            username: 'tokenadmin',
            email: 'tokenadmin@test.com',
            password: 'Admin1234',
            role: 'admin',
            company: company._id
        });
    });

    const login = async () => {
        return await request(app)
            .post('/api/v1/auth/login')
            .send({ username: 'tokenadmin', password: 'Admin1234' });
    };

    it('should save hashed refresh token to DB on login', async () => {
        const res = await login();
        expect(res.status).toBe(200);

        const cookies = res.headers['set-cookie'].join(' ');
        const refreshTokenMatch = cookies.match(/refreshToken=([^;]+)/);
        const refreshToken = refreshTokenMatch[1];

        const hashed = hashToken(refreshToken);
        const record = await RefreshToken.findOne({ token: hashed });

        expect(record).toBeDefined();
        expect(record.user.toString()).toBe(adminUser._id.toString());
    });

    it('should rotate refresh token in DB (delete old, create new)', async () => {
        const loginRes = await login();
        const cookies = loginRes.headers['set-cookie'].join(' ');
        const oldToken = cookies.match(/refreshToken=([^;]+)/)[1];
        const oldHashed = hashToken(oldToken);

        // 1. Refresh
        const refreshRes = await request(app)
            .post('/api/v1/auth/refresh')
            .set('Cookie', loginRes.headers['set-cookie']);

        expect(refreshRes.status).toBe(200);

        // 2. Old token should be gone from DB
        const oldRecord = await RefreshToken.findOne({ token: oldHashed });
        expect(oldRecord).toBeNull();

        // 3. New token should be in DB
        const newCookies = refreshRes.headers['set-cookie'].join(' ');
        const newToken = newCookies.match(/refreshToken=([^;]+)/)[1];
        const newHashed = hashToken(newToken);
        const newRecord = await RefreshToken.findOne({ token: newHashed });

        expect(newRecord).toBeDefined();
        expect(newToken).not.toBe(oldToken);
    });

    it('should reject reuse of a rotated refresh token', async () => {
        const loginRes = await login();
        const cookies = loginRes.headers['set-cookie'];

        // 1. First refresh (succeeds, old token deleted)
        await request(app)
            .post('/api/v1/auth/refresh')
            .set('Cookie', cookies);

        // 2. Second refresh with SAME COOKIES (should fail)
        const res = await request(app)
            .post('/api/v1/auth/refresh')
            .set('Cookie', cookies);

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/Invalid or expired/i);
    });

    it('should delete record from DB on logout', async () => {
        const loginRes = await login();
        const cookies = loginRes.headers['set-cookie'];
        const token = cookies.join(' ').match(/refreshToken=([^;]+)/)[1];
        const hashed = hashToken(token);

        // Verify it exists first
        expect(await RefreshToken.findOne({ token: hashed })).not.toBeNull();

        // Logout
        await request(app)
            .post('/api/v1/auth/logout')
            .set('Cookie', cookies);

        // Verify it's gone
        expect(await RefreshToken.findOne({ token: hashed })).toBeNull();
    });
});
