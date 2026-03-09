/**
 * Soft Delete / Archive Integration Tests
 * Tests: company archival, blocked company denied auth, mid-session blocking, status toggle
 */
const request = require('supertest');
const app = require('../../app');
const { createCompanyWithAdmin, createSuperadmin } = require('../helpers/db.helpers');
const { loginUser, authGet, authDelete, authPut } = require('../helpers/auth.helpers');
const Company = require('../../models/Company');

describe('Soft Delete / Archive', () => {
    let superCookies, superCsrf;

    beforeEach(async () => {
        await createSuperadmin({ username: 'superarch', password: 'Super1234' });
        const auth = await loginUser('superarch', 'Super1234');
        superCookies = auth.cookies;
        superCsrf = auth.csrfToken;
    });

    // ──────────── COMPANY ARCHIVAL ────────────
    describe('Company archival (soft delete)', () => {
        it('superadmin can archive a company', async () => {
            const { company } = await createCompanyWithAdmin(
                { name: 'ArchCo' }, { username: 'archadmin', password: 'Admin1234' }
            );

            const res = await authDelete(
                `/api/v1/superadmin/companies/${company._id}`,
                superCookies, superCsrf
            );
            expect(res.status).toBe(200);

            // Verify soft delete — record still exists with status 'deleted'
            const archived = await Company.findById(company._id);
            expect(archived).not.toBeNull();
            expect(archived.status).toBe('deleted');
            expect(archived.deletedAt).toBeDefined();
        });

        it('archived company is excluded from superadmin listing', async () => {
            const { company } = await createCompanyWithAdmin(
                { name: 'HiddenCo' }, { username: 'hideadmin', password: 'Admin1234' }
            );
            company.status = 'deleted';
            company.deletedAt = new Date();
            await company.save();

            const res = await authGet('/api/v1/superadmin/companies', superCookies);
            const names = res.body.data.map(c => c.name);
            expect(names).not.toContain('HiddenCo');
        });

        it('should reject double-delete of already archived company', async () => {
            const { company } = await createCompanyWithAdmin(
                { name: 'DoubleDel' }, { username: 'doubledel', password: 'Admin1234' }
            );
            company.status = 'deleted';
            company.deletedAt = new Date();
            await company.save();

            const res = await authDelete(
                `/api/v1/superadmin/companies/${company._id}`,
                superCookies, superCsrf
            );
            expect(res.status).toBe(400);
        });
    });

    // ──────────── BLOCKED/ARCHIVED AUTH DENIAL ────────────
    describe('Archived company auth denial', () => {
        it('should return 403 when deleted company admin tries to login', async () => {
            await createCompanyWithAdmin(
                { name: 'DeadCo', status: 'deleted', deletedAt: new Date() },
                { username: 'deadmin', password: 'Admin1234' }
            );
            const { status } = await loginUser('deadmin', 'Admin1234');
            expect(status).toBe(403);
        });

        it('should return 403 when blocked company admin tries to login', async () => {
            await createCompanyWithAdmin(
                { name: 'BlockLoginCo', status: 'blocked' },
                { username: 'blocklogin', password: 'Admin1234' }
            );
            const { status } = await loginUser('blocklogin', 'Admin1234');
            expect(status).toBe(403);
        });
    });

    // ──────────── MID-SESSION BLOCKING ────────────
    describe('Mid-session company blocking', () => {
        it('should deny token refresh after company is blocked', async () => {
            const { company } = await createCompanyWithAdmin({},
                { username: 'midblock', password: 'Admin1234' }
            );
            const { cookies } = await loginUser('midblock', 'Admin1234');

            company.status = 'blocked';
            await company.save();

            const res = await request(app)
                .post('/api/v1/auth/refresh')
                .set('Cookie', cookies);
            expect(res.status).toBe(403);
        });

        it('should deny protected route access after company is blocked', async () => {
            const { company } = await createCompanyWithAdmin({},
                { username: 'routeblock', password: 'Admin1234' }
            );
            const { cookies } = await loginUser('routeblock', 'Admin1234');

            company.status = 'blocked';
            await company.save();

            const res = await authGet('/api/v1/admin/employees', cookies);
            expect(res.status).toBe(403);
        });
    });

    // ──────────── STATUS TOGGLE ────────────
    describe('Status toggle', () => {
        it('superadmin can toggle active → blocked → active', async () => {
            const { company } = await createCompanyWithAdmin(
                { name: 'ToggleCo' }, { username: 'togadmin', password: 'Admin1234' }
            );

            let res = await authPut(
                `/api/v1/superadmin/companies/${company._id}/toggle-status`,
                superCookies, superCsrf
            );
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('blocked');

            res = await authPut(
                `/api/v1/superadmin/companies/${company._id}/toggle-status`,
                superCookies, superCsrf
            );
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('active');
        });

        it('cannot toggle a deleted company', async () => {
            const { company } = await createCompanyWithAdmin(
                { name: 'DelToggle', status: 'deleted' },
                { username: 'deltog', password: 'Admin1234' }
            );
            const res = await authPut(
                `/api/v1/superadmin/companies/${company._id}/toggle-status`,
                superCookies, superCsrf
            );
            expect(res.status).toBe(400);
        });
    });
});
