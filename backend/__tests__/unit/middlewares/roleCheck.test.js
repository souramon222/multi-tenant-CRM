/**
 * roleCheck Middleware Unit Tests
 * Tests: authorized roles, unauthorized roles, multiple role support
 */
const { authorize } = require('../../../middlewares/roleCheck');

describe('roleCheck middleware', () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    it('should call next() for authorized role', () => {
        const req = { user: { role: 'admin' } };
        const res = mockRes();
        const next = jest.fn();

        authorize('admin')(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should return 403 for unauthorized role', () => {
        const req = { user: { role: 'employee' } };
        const res = mockRes();
        const next = jest.fn();

        authorize('admin')(req, res, next);
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should allow when role is one of multiple authorized roles', () => {
        const req = { user: { role: 'employee' } };
        const res = mockRes();
        const next = jest.fn();

        authorize('admin', 'employee')(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should return 403 when no user on request', () => {
        const req = { user: null };
        const res = mockRes();
        const next = jest.fn();

        authorize('admin')(req, res, next);
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });
});
