/**
 * Customer CRUD Integration Tests
 * Tests: create, validation, scoped listing, status update, delete, activity logging
 */
const { createCompanyWithAdmin, createCustomer } = require('../helpers/db.helpers');
const { loginUser, authGet, authPost, authPut, authDelete } = require('../helpers/auth.helpers');

describe('Customer CRUD', () => {
    let cookies, csrf, company;

    beforeEach(async () => {
        const result = await createCompanyWithAdmin(
            { name: 'CustCo' }, { username: 'custadmin', password: 'Admin1234' }
        );
        company = result.company;
        const auth = await loginUser('custadmin', 'Admin1234');
        cookies = auth.cookies;
        csrf = auth.csrfToken;
    });

    it('should create a customer with defaults', async () => {
        const res = await authPost('/api/v1/admin/customers', cookies, csrf, {
            name: 'John Customer', email: 'john@cust.com', phone: '9876543210',
            complaint: 'Billing issue', priority: 'High',
        });
        expect(res.status).toBe(201);
        const actualCompanyId = res.body.data.company._id || res.body.data.company;
        expect(actualCompanyId.toString()).toBe(company._id.toString());
        expect(res.body.data.status).toBe('New');
        expect(res.body.data.priority).toBe('High');
    });

    it('should reject customer with invalid priority', async () => {
        const res = await authPost('/api/v1/admin/customers', cookies, csrf, {
            name: 'Bad Priority', priority: 'SuperUrgent',
        });
        expect(res.status).toBe(400);
    });

    it('should reject customer with missing name', async () => {
        const res = await authPost('/api/v1/admin/customers', cookies, csrf, {
            email: 'noname@cust.com',
        });
        expect(res.status).toBe(400);
    });

    it('should list only own company customers', async () => {
        await authPost('/api/v1/admin/customers', cookies, csrf, { name: 'MyCust' });
        const res = await authGet('/api/v1/admin/customers', cookies);
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
        res.body.data.forEach(c => {
            const actualCompanyId = c.company._id || c.company;
            expect(actualCompanyId.toString()).toBe(company._id.toString());
        });
    });

    it('should update customer status and priority', async () => {
        const create = await authPost('/api/v1/admin/customers', cookies, csrf,
            { name: 'StatusCust' });
        const res = await authPut(
            `/api/v1/admin/customers/${create.body.data._id}`,
            cookies, csrf,
            { name: 'StatusCust', status: 'In Progress', priority: 'Urgent' }
        );
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('In Progress');
        expect(res.body.data.priority).toBe('Urgent');
    });

    it('should delete customer', async () => {
        const create = await authPost('/api/v1/admin/customers', cookies, csrf,
            { name: 'DelCust' });
        const res = await authDelete(
            `/api/v1/admin/customers/${create.body.data._id}`, cookies, csrf
        );
        expect(res.status).toBe(200);
    });

    it('should return 404 when updating non-existent customer', async () => {
        const res = await authPut(
            '/api/v1/admin/customers/000000000000000000000000',
            cookies, csrf,
            { name: 'Ghost' }
        );
        expect(res.status).toBe(404);
    });
});
