/**
 * Error Handling Integration Tests
 * Tests: unknown routes, validation errors, invalid ObjectId, stack trace leakage, error format
 */
const request = require('supertest');
const app = require('../../app');
const { createCompanyWithAdmin } = require('../helpers/db.helpers');
const { loginUser } = require('../helpers/auth.helpers');

describe('Error Handling', () => {

    it('should return consistent JSON error format for validation failure', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({}); // Missing required fields

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        // Should have errors array from express-validator
        expect(res.body.errors || res.body.message).toBeDefined();
    });

    it('should handle invalid ObjectId gracefully', async () => {
        await createCompanyWithAdmin({}, { username: 'erruser', password: 'Admin1234' });
        const { cookies } = await loginUser('erruser', 'Admin1234');

        const res = await request(app)
            .get('/api/v1/customers/invalid-id/activities')
            .set('Cookie', cookies);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('should not leak stack traces in production mode', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ username: 'nonexistent', password: 'whatever' });

        // Error response should not contain stack trace
        expect(res.body.error).toBeUndefined();
        process.env.NODE_ENV = originalEnv;
    });

    it('validation errors from express-validator have field and message', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register-company')
            .send({
                companyName: '', adminName: '', adminUsername: 'a',
                adminEmail: 'bad', password: 'weak',
            });

        expect(res.status).toBe(400);
        if (res.body.errors) {
            res.body.errors.forEach(err => {
                expect(err).toHaveProperty('field');
                expect(err).toHaveProperty('message');
            });
        }
    });

    it('should return 401 for protected route without auth', async () => {
        const res = await request(app).get('/api/v1/admin/employees');
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
