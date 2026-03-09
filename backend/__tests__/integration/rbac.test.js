/**
 * Role-Based Access Control Integration Tests
 * Tests: employee → admin escalation, admin → superadmin escalation, privilege enforcement
 */
const { createCompanyWithAdmin, createUser, createSuperadmin } = require('../helpers/db.helpers');
const { loginUser, authGet, authPost, authPut, authDelete } = require('../helpers/auth.helpers');

describe('Role-Based Access Control', () => {
    let adminCookies, adminCsrf;
    let employeeCookies, employeeCsrf;
    let superCookies, superCsrf;
    let company;

    beforeEach(async () => {
        const result = await createCompanyWithAdmin(
            { name: 'RBAC-Co' },
            { username: 'rbacadmin', password: 'Admin1234' }
        );
        company = result.company;

        await createUser({
            username: 'rbacemp', password: 'Emp12345', role: 'employee',
            company: company._id,
        });

        await createSuperadmin({ username: 'rbacsuper', password: 'Super1234' });

        const adminAuth = await loginUser('rbacadmin', 'Admin1234');
        adminCookies = adminAuth.cookies;
        adminCsrf = adminAuth.csrfToken;

        const empAuth = await loginUser('rbacemp', 'Emp12345', company.companyId);
        employeeCookies = empAuth.cookies;
        employeeCsrf = empAuth.csrfToken;

        const superAuth = await loginUser('rbacsuper', 'Super1234');
        superCookies = superAuth.cookies;
        superCsrf = superAuth.csrfToken;
    });

    // ──────────── EMPLOYEE → ADMIN ESCALATION ────────────
    describe('Employee cannot access admin routes', () => {
        it('should return 403 when employee tries to add an employee', async () => {
            const res = await authPost('/api/v1/admin/employees',
                employeeCookies, employeeCsrf,
                { name: 'Hack', username: 'hack1', email: 'h@t.com', password: 'Hack1234' }
            );
            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should return 403 when employee tries to list employees', async () => {
            const res = await authGet('/api/v1/admin/employees', employeeCookies);
            expect(res.status).toBe(403);
        });

        it('should return 403 when employee tries to add customer via admin route', async () => {
            const res = await authPost('/api/v1/admin/customers',
                employeeCookies, employeeCsrf,
                { name: 'AttackCustomer' }
            );
            expect(res.status).toBe(403);
        });

        it('should return 403 when employee tries to delete a customer', async () => {
            const res = await authDelete(
                '/api/v1/admin/customers/000000000000000000000000',
                employeeCookies, employeeCsrf
            );
            expect(res.status).toBe(403);
        });
    });

    // ──────────── ADMIN → SUPERADMIN ESCALATION ────────────
    describe('Admin cannot access superadmin routes', () => {
        it('should return 403 when admin tries to list all companies', async () => {
            const res = await authGet('/api/v1/superadmin/companies', adminCookies);
            expect(res.status).toBe(403);
        });

        it('should return 403 when admin tries to delete a company', async () => {
            const res = await authDelete(
                `/api/v1/superadmin/companies/${company._id}`,
                adminCookies, adminCsrf
            );
            expect(res.status).toBe(403);
        });

        it('should return 403 when admin tries to toggle company status', async () => {
            const res = await authPut(
                `/api/v1/superadmin/companies/${company._id}/toggle-status`,
                adminCookies, adminCsrf
            );
            expect(res.status).toBe(403);
        });
    });

    // ──────────── EMPLOYEE → SUPERADMIN ESCALATION ────────────
    describe('Employee cannot access superadmin routes', () => {
        it('should return 403 for employee accessing superadmin companies', async () => {
            const res = await authGet('/api/v1/superadmin/companies', employeeCookies);
            expect(res.status).toBe(403);
        });
    });

    // ──────────── POSITIVE TEST ────────────
    describe('Authorized access succeeds', () => {
        it('should return 200 when superadmin lists companies', async () => {
            const res = await authGet('/api/v1/superadmin/companies', superCookies);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 200 when admin lists own employees', async () => {
            const res = await authGet('/api/v1/admin/employees', adminCookies);
            expect(res.status).toBe(200);
        });
    });
});
