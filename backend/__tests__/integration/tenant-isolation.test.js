/**
 * Multi-Tenant Isolation Integration Tests (CRITICAL)
 * Simulates real-world cross-tenant attack vectors:
 * - READ: Accessing another tenant's customers/employees/activities
 * - UPDATE: Modifying another tenant's data
 * - DELETE: Destroying another tenant's data
 * - ASSIGNMENT: Linking resources across tenant boundaries
 */
const request = require('supertest');
const app = require('../../app');
const {
    createCompanyWithAdmin, createUser, createCustomer,
} = require('../helpers/db.helpers');
const { loginUser, authGet, authPost, authPut, authPatch, authDelete } = require('../helpers/auth.helpers');

describe('Multi-Tenant Isolation (CRITICAL)', () => {
    let companyA, adminA, cookiesA, csrfA;
    let companyB, adminB, cookiesB, csrfB;
    let customerA, customerB;

    beforeEach(async () => {
        // Setup two completely isolated tenants
        const a = await createCompanyWithAdmin(
            { name: 'TenantA' }, { username: 'tenanta', password: 'Admin1234' }
        );
        companyA = a.company; adminA = a.admin;

        const b = await createCompanyWithAdmin(
            { name: 'TenantB' }, { username: 'tenantb', password: 'Admin1234' }
        );
        companyB = b.company; adminB = b.admin;

        // Each company has their own customer
        customerA = await createCustomer(companyA._id, { name: 'CustomerOfA' });
        customerB = await createCustomer(companyB._id, { name: 'CustomerOfB' });

        // Login both admins
        const authA = await loginUser('tenanta', 'Admin1234');
        cookiesA = authA.cookies; csrfA = authA.csrfToken;

        const authB = await loginUser('tenantb', 'Admin1234');
        cookiesB = authB.cookies; csrfB = authB.csrfToken;
    });

    // ──────────── CROSS-TENANT READ ────────────
    describe('Cross-tenant READ attacks', () => {
        it('Admin A customer list should NOT contain Company B customers', async () => {
            const res = await authGet('/api/v1/admin/customers', cookiesA);
            expect(res.status).toBe(200);
            const customerNames = res.body.data.map(c => c.name);
            expect(customerNames).toContain('CustomerOfA');
            expect(customerNames).not.toContain('CustomerOfB');
        });

        it('Admin A employee list should NOT contain Company B employees', async () => {
            await createUser({
                username: 'empofb', role: 'employee', company: companyB._id,
                password: 'Emp12345',
            });
            const res = await authGet('/api/v1/admin/employees', cookiesA);
            const usernames = res.body.data.map(e => e.username);
            expect(usernames).not.toContain('empofb');
        });

        it('Admin A cannot read activities for Company B customer', async () => {
            const res = await authGet(
                `/api/v1/customers/${customerB._id}/activities`, cookiesA
            );
            expect(res.status).toBe(403);
        });
    });

    // ──────────── CROSS-TENANT UPDATE ────────────
    describe('Cross-tenant UPDATE attacks', () => {
        it('Admin A cannot update Company B customer via admin route', async () => {
            const res = await authPut(
                `/api/v1/admin/customers/${customerB._id}`,
                cookiesA, csrfA,
                { name: 'HACKED' }
            );
            // Scoped query returns nothing — treated as not found
            expect(res.status).toBe(404);
        });

        it('Admin A cannot update Company B customer status via customer route', async () => {
            const res = await authPatch(
                `/api/v1/customers/${customerB._id}/status`,
                cookiesA, csrfA,
                { status: 'Closed' }
            );
            expect(res.status).toBe(403);
        });
    });

    // ──────────── CROSS-TENANT DELETE ────────────
    describe('Cross-tenant DELETE attacks', () => {
        it('Admin A cannot delete Company B customer', async () => {
            const res = await authDelete(
                `/api/v1/admin/customers/${customerB._id}`,
                cookiesA, csrfA
            );
            expect(res.status).toBe(404);
        });

        it('Admin A cannot delete Company B employee', async () => {
            const empB = await createUser({
                username: 'delempb', role: 'employee', company: companyB._id,
                password: 'Emp12345',
            });
            const res = await authDelete(
                `/api/v1/admin/employees/${empB._id}`,
                cookiesA, csrfA
            );
            expect(res.status).toBe(404);
        });
    });

    // ──────────── CROSS-TENANT ASSIGNMENT ────────────
    describe('Cross-tenant ASSIGNMENT attacks', () => {
        it('Admin A cannot assign own employee to Company B customer', async () => {
            const empA = await createUser({
                username: 'empofa', role: 'employee', company: companyA._id,
                password: 'Emp12345',
            });
            const res = await authPost('/api/v1/admin/assignments',
                cookiesA, csrfA,
                { employeeId: empA._id.toString(), customerId: customerB._id.toString() }
            );
            // Customer not found in Admin A's company
            expect(res.status).toBe(404);
        });

        it('Admin A cannot assign Company B employee to own customer', async () => {
            const empB = await createUser({
                username: 'empofb2', role: 'employee', company: companyB._id,
                password: 'Emp12345',
            });
            const res = await authPost('/api/v1/admin/assignments',
                cookiesA, csrfA,
                { employeeId: empB._id.toString(), customerId: customerA._id.toString() }
            );
            // Employee not found in Admin A's company
            expect(res.status).toBe(404);
        });
    });
});
