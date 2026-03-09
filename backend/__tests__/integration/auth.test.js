/**
 * Authentication Integration Tests
 * Tests: registration, login, refresh token rotation, logout, getMe
 */
const request = require('supertest');
const app = require('../../app');
const { createCompanyWithAdmin, createSuperadmin } = require('../helpers/db.helpers');
const { loginUser, registerCompany } = require('../helpers/auth.helpers');

describe('Authentication', () => {

    // ──────────── REGISTRATION ────────────
    describe('POST /api/v1/auth/register-company', () => {
        it('should register a new company and admin', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register-company')
                .send({
                    companyName: 'Acme Corp',
                    adminName: 'John Doe',
                    adminUsername: 'johndoe',
                    adminEmail: 'john@acme.com',
                    password: 'Secure1234',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.role).toBe('admin');
            expect(res.body.data.company.name).toBe('Acme Corp');

            // Verify auth cookies are set
            expect(res.headers['set-cookie']).toBeDefined();
            const cookies = res.headers['set-cookie'].join(' ');
            expect(cookies).toMatch(/accessToken/);
            expect(cookies).toMatch(/refreshToken/);
            expect(cookies).toMatch(/csrfToken/);
        });

        it('should reject duplicate company name', async () => {
            await registerCompany({
                companyName: 'DupeCo', adminName: 'A', adminUsername: 'a1dupetest',
                adminEmail: 'a1dupe@test.com', password: 'Test1234',
            });

            const res = await request(app)
                .post('/api/v1/auth/register-company')
                .send({
                    companyName: 'DupeCo', adminName: 'B', adminUsername: 'b1dupetest',
                    adminEmail: 'b1dupe@test.com', password: 'Test1234',
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/already exists/i);
        });

        it('should reject duplicate email', async () => {
            await registerCompany({
                companyName: 'EmailCo1', adminName: 'A', adminUsername: 'emaila1',
                adminEmail: 'shared@test.com', password: 'Test1234',
            });

            const res = await request(app)
                .post('/api/v1/auth/register-company')
                .send({
                    companyName: 'EmailCo2', adminName: 'B', adminUsername: 'emailb1',
                    adminEmail: 'shared@test.com', password: 'Test1234',
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/already exists/i);
        });

        it('should reject invalid email format', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register-company')
                .send({
                    companyName: 'BadEmailCo', adminName: 'X', adminUsername: 'bademailx1',
                    adminEmail: 'not-an-email', password: 'Test1234',
                });

            expect(res.status).toBe(400);
        });

        it('should reject weak password (no uppercase/no digit)', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register-company')
                .send({
                    companyName: 'WeakPwCo', adminName: 'Y', adminUsername: 'weakpwy1',
                    adminEmail: 'weakpw@test.com', password: 'weakpass',
                });

            expect(res.status).toBe(400);
        });

        it('should reject missing required fields', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register-company')
                .send({});

            expect(res.status).toBe(400);
        });
    });

    // ──────────── LOGIN ────────────
    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            await createCompanyWithAdmin({}, {
                username: 'loginadmin',
                password: 'Admin1234',
            });
        });

        it('should login with correct credentials', async () => {
            const { status, body, cookies } = await loginUser('loginadmin', 'Admin1234');

            expect(status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.data.role).toBe('admin');
            expect(cookies).toMatch(/accessToken/);
            expect(cookies).toMatch(/refreshToken/);
        });

        it('should return 401 for wrong password', async () => {
            const { status, body } = await loginUser('loginadmin', 'WrongPass1');

            expect(status).toBe(401);
            expect(body.success).toBe(false);
        });

        it('should return 401 for non-existent user', async () => {
            const { status } = await loginUser('ghostuser', 'Ghost1234');
            expect(status).toBe(401);
        });

        it('should return 403 for blocked company', async () => {
            await createCompanyWithAdmin(
                { name: 'BlockedCo', status: 'blocked' },
                { username: 'blockedadmin', password: 'Admin1234' }
            );

            const { status, body } = await loginUser('blockedadmin', 'Admin1234');
            expect(status).toBe(403);
            expect(body.message).toMatch(/blocked/i);
        });

        it('should return 403 for deleted (archived) company', async () => {
            await createCompanyWithAdmin(
                { name: 'DeletedCo', status: 'deleted', deletedAt: new Date() },
                { username: 'deletedadmin', password: 'Admin1234' }
            );

            const { status, body } = await loginUser('deletedadmin', 'Admin1234');
            expect(status).toBe(403);
            expect(body.message).toMatch(/removed/i);
        });
    });

    // ──────────── REFRESH TOKEN ────────────
    describe('POST /api/v1/auth/refresh', () => {
        it('should refresh tokens using valid refresh cookie (rotation)', async () => {
            await createCompanyWithAdmin({}, {
                username: 'refreshuser', password: 'Admin1234',
            });
            const { cookies } = await loginUser('refreshuser', 'Admin1234');

            const res = await request(app)
                .post('/api/v1/auth/refresh')
                .set('Cookie', cookies);

            expect(res.status).toBe(200);
            expect(res.headers['set-cookie']).toBeDefined();
            const newCookies = res.headers['set-cookie'].join(' ');
            expect(newCookies).toMatch(/accessToken/);
            expect(newCookies).toMatch(/refreshToken/);
        });

        it('should return 401 when no refresh token cookie present', async () => {
            const res = await request(app).post('/api/v1/auth/refresh');
            expect(res.status).toBe(401);
        });

        it('should return 401 for tampered/invalid refresh token', async () => {
            const res = await request(app)
                .post('/api/v1/auth/refresh')
                .set('Cookie', 'refreshToken=this.is.a.fake.token');
            expect(res.status).toBe(401);
        });

        it('should return 403 when company is blocked during refresh', async () => {
            const { company } = await createCompanyWithAdmin({}, {
                username: 'blockrefresh', password: 'Admin1234',
            });
            const { cookies } = await loginUser('blockrefresh', 'Admin1234');

            // Block company AFTER login (simulates superadmin action mid-session)
            company.status = 'blocked';
            await company.save();

            const res = await request(app)
                .post('/api/v1/auth/refresh')
                .set('Cookie', cookies);
            expect(res.status).toBe(403);
        });
    });

    // ──────────── LOGOUT ────────────
    describe('POST /api/v1/auth/logout', () => {
        it('should clear auth cookies on logout', async () => {
            await createCompanyWithAdmin({}, {
                username: 'logoutuser', password: 'Admin1234',
            });
            const { cookies } = await loginUser('logoutuser', 'Admin1234');

            const res = await request(app)
                .post('/api/v1/auth/logout')
                .set('Cookie', cookies);

            expect(res.status).toBe(200);
            const setCookies = res.headers['set-cookie'].join(' ');
            expect(setCookies).toMatch(/accessToken=/);
            expect(setCookies).toMatch(/refreshToken=/);
        });
    });

    // ──────────── GET ME ────────────
    describe('GET /api/v1/auth/me', () => {
        it('should return user data for authenticated user', async () => {
            await createCompanyWithAdmin({}, {
                username: 'meuser', password: 'Admin1234',
            });
            const { cookies } = await loginUser('meuser', 'Admin1234');

            const res = await request(app)
                .get('/api/v1/auth/me')
                .set('Cookie', cookies);

            expect(res.status).toBe(200);
            expect(res.body.data.username).toBe('meuser');
            expect(res.body.data.password).toBeUndefined();
        });

        it('should return null data when not authenticated', async () => {
            const res = await request(app).get('/api/v1/auth/me');
            expect(res.status).toBe(200);
            expect(res.body.data).toBeNull();
        });
    });
});
