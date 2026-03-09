/**
 * Company Model Unit Tests
 * Tests: default values, status enum, auto-generated companyId
 */
const Company = require('../../../models/Company');

describe('Company Model', () => {
    it('should create a company with default status "active"', async () => {
        const company = await Company.create({ name: 'TestCorp' });
        expect(company.status).toBe('active');
        expect(company.deletedAt).toBeNull();
    });

    it('should auto-generate a companyId starting with CO-', async () => {
        const company = await Company.create({ name: 'AutoIdCorp' });
        expect(company.companyId).toBeDefined();
        expect(company.companyId).toMatch(/^CO-/);
    });

    it('should reject invalid status value', async () => {
        const company = new Company({ name: 'BadStatus', status: 'suspended' });
        const err = company.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.status).toBeDefined();
    });

    it('should require name', async () => {
        const company = new Company({});
        const err = company.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.name).toBeDefined();
    });

    it('should allow valid statuses: active, blocked, deleted', async () => {
        for (const status of ['active', 'blocked', 'deleted']) {
            const company = new Company({ name: `${status}Co`, status });
            const err = company.validateSync();
            expect(err).toBeUndefined();
        }
    });
});
