/**
 * Security Integration Tests
 * Tests: auth bypass, JWT manipulation, CSRF protection, mass assignment, cross-tenant injection
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../../app');
const { createCompanyWithAdmin } = require('../helpers/db.helpers');
const { loginUser } = require('../helpers/auth.helpers');

describe('Security', () => {

    // ──────────── AUTH BYPASS ────────────
    describe('Authentication bypass attempts', () => {
        it('should reject requests with no token', async () => {
            const res = await request(app).get('/api/v1/admin/employees');
            expect(res.status).toBe(401);
        });

        it('should reject requests with invalid token', async () => {
            const res = await request(app)
                .get('/api/v1/admin/employees')
                .set('Cookie', 'accessToken=not.a.real.jwt.token');
            expect(res.status).toBe(401);
        });

        it('should reject requests with expired token', async () => {
            const token = jwt.sign({ id: '000000000000000000000000' }, process.env.JWT_SECRET, {
                expiresIn: '0s',
            });
            // Wait a moment to ensure expiry
            await new Promise(r => setTimeout(r, 100));
            const res = await request(app)
                .get('/api/v1/admin/employees')
                .set('Cookie', `accessToken=${token}`);
            expect(res.status).toBe(401);
        });

        it('should reject token signed with wrong secret', async () => {
            const token = jwt.sign({ id: '000000000000000000000000' }, 'wrong-secret-key', {
                expiresIn: '1h',
            });
            const res = await request(app)
                .get('/api/v1/admin/employees')
                .set('Cookie', `accessToken=${token}`);
            expect(res.status).toBe(401);
        });
    });

    // ──────────── JWT PAYLOAD MANIPULATION ────────────
    describe('JWT payload manipulation', () => {
        it('should reject token with non-existent user ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const token = jwt.sign({ id: fakeId }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });
            const res = await request(app)
                .get('/api/v1/admin/employees')
                .set('Cookie', `accessToken=${token}`);
            expect(res.status).toBe(401);
        });
    });

    // ──────────── CSRF PROTECTION ────────────
    describe('CSRF protection', () => {
        let cookies;

        beforeEach(async () => {
            await createCompanyWithAdmin({}, { username: 'csrfuser', password: 'Admin1234' });
            const auth = await loginUser('csrfuser', 'Admin1234');
            cookies = auth.cookies;
        });

        it('should reject POST without CSRF token header', async () => {
            const res = await request(app)
                .post('/api/v1/admin/employees')
                .set('Cookie', cookies)
                .send({ name: 'Hack', username: 'csrfhack', email: 'h@t.com', password: 'Hack1234' });
            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/csrf/i);
        });

        it('should reject mismatched CSRF token', async () => {
            const res = await request(app)
                .post('/api/v1/admin/employees')
                .set('Cookie', cookies)
                .set('X-CSRF-Token', 'totally-wrong-value')
                .send({ name: 'Hack2', username: 'csrfhack2', email: 'h2@t.com', password: 'Hack1234' });
            expect(res.status).toBe(403);
        });

        it('should allow GET requests without CSRF token', async () => {
            const res = await request(app)
                .get('/api/v1/admin/employees')
                .set('Cookie', cookies);
            expect(res.status).toBe(200);
        });
    });

    // ──────────── MASS ASSIGNMENT ────────────
    describe('Mass assignment prevention', () => {
        it('should not allow role escalation via request body', async () => {
            await createCompanyWithAdmin({}, { username: 'massadmin', password: 'Admin1234' });
            const { cookies, csrfToken } = await loginUser('massadmin', 'Admin1234');

            const res = await request(app)
                .post('/api/v1/admin/employees')
                .set('Cookie', cookies)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    name: 'Evil', username: 'massevil', email: 'evil@t.com',
                    password: 'Evil1234',
                    role: 'superadmin', // Attempted escalation
                });

            // Controller hardcodes role: 'employee' — body.role should be ignored
            if (res.status === 201) {
                expect(res.body.data.role).toBe('employee');
            }
        });
    });

    // ──────────── CROSS-TENANT INJECTION ────────────
    describe('Cross-tenant data injection', () => {
        it('should not allow injecting a different companyId in request body', async () => {
            const a = await createCompanyWithAdmin(
                { name: 'InjectA' }, { username: 'injectadmin', password: 'Admin1234' }
            );
            const b = await createCompanyWithAdmin(
                { name: 'InjectB' }, { username: 'injectadminb', password: 'Admin1234' }
            );
            const { cookies, csrfToken } = await loginUser('injectadmin', 'Admin1234');

            const res = await request(app)
                .post('/api/v1/admin/customers')
                .set('Cookie', cookies)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    name: 'Injected Customer',
                    company: b.company._id.toString(), // Injecting Company B's ID
                });

            // Controller uses req.user.company, not req.body.company
            if (res.status === 201) {
                const actualCompanyId = res.body.data.company._id || res.body.data.company;
                expect(actualCompanyId.toString()).toBe(a.company._id.toString());
            }
        });
    });
});
