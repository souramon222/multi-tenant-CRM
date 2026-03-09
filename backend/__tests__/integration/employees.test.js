/**
 * Employee CRUD Integration Tests
 * Tests: create, validation, duplicate, list scoping, update, delete, unauthorized access
 */
const request = require('supertest');
const app = require('../../app');
const { createCompanyWithAdmin } = require('../helpers/db.helpers');
const { loginUser, authGet, authPost, authPut, authDelete } = require('../helpers/auth.helpers');

describe('Employee CRUD', () => {
    let cookies, csrf, company;

    beforeEach(async () => {
        const result = await createCompanyWithAdmin(
            { name: 'EmpCo' }, { username: 'empadmin', password: 'Admin1234' }
        );
        company = result.company;
        const auth = await loginUser('empadmin', 'Admin1234');
        cookies = auth.cookies;
        csrf = auth.csrfToken;
    });

    it('should create an employee', async () => {
        const res = await authPost('/api/v1/admin/employees', cookies, csrf, {
            name: 'Jane Doe', username: 'janedoe', email: 'jane@emp.com',
            password: 'Jane1234', serviceType: 'Full-time', experience: 3,
        });
        expect(res.status).toBe(201);
        expect(res.body.data.role).toBe('employee');
        const actualCompanyId = res.body.data.company._id || res.body.data.company;
        expect(actualCompanyId.toString()).toBe(company._id.toString());
        expect(res.body.data.password).toBeUndefined();
    });

    it('should reject employee with validation failures', async () => {
        const res = await authPost('/api/v1/admin/employees', cookies, csrf, {
            name: '', username: 'x', email: 'not-email',
        });
        expect(res.status).toBe(400);
    });

    it('should reject duplicate email', async () => {
        await authPost('/api/v1/admin/employees', cookies, csrf, {
            name: 'E1', username: 'empdup1', email: 'dup@emp.com', password: 'Pass1234',
        });
        const res = await authPost('/api/v1/admin/employees', cookies, csrf, {
            name: 'E2', username: 'empdup2', email: 'dup@emp.com', password: 'Pass1234',
        });
        expect(res.status).toBe(400);
    });

    it('should list only own company employees', async () => {
        await authPost('/api/v1/admin/employees', cookies, csrf, {
            name: 'Mine', username: 'empmine', email: 'mine@emp.com', password: 'Pass1234',
        });
        const res = await authGet('/api/v1/admin/employees', cookies);
        expect(res.status).toBe(200);
        res.body.data.forEach(emp => {
            const actualCompanyId = emp.company._id || emp.company;
            expect(actualCompanyId.toString()).toBe(company._id.toString());
        });
    });

    it('should update an employee', async () => {
        const create = await authPost('/api/v1/admin/employees', cookies, csrf, {
            name: 'Old Name', username: 'empupd', email: 'upd@emp.com', password: 'Pass1234',
        });
        const res = await authPut(
            `/api/v1/admin/employees/${create.body.data._id}`,
            cookies, csrf,
            { name: 'New Name', username: 'empupd', email: 'upd@emp.com' }
        );
        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe('New Name');
    });

    it('should delete an employee', async () => {
        const create = await authPost('/api/v1/admin/employees', cookies, csrf, {
            name: 'Delete Me', username: 'empdel', email: 'del@emp.com', password: 'Pass1234',
        });
        const res = await authDelete(
            `/api/v1/admin/employees/${create.body.data._id}`, cookies, csrf
        );
        expect(res.status).toBe(200);
    });

    it('should return 401 for unauthenticated access', async () => {
        const res = await request(app).get('/api/v1/admin/employees');
        expect(res.status).toBe(401);
    });
});
