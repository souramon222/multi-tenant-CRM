/**
 * apiResponse Utility Unit Tests
 * Tests: success/error format, data/error inclusion/exclusion
 */
const { sendResponse } = require('../../../utils/apiResponse');

describe('apiResponse utility', () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    it('should format success response with data', () => {
        const res = mockRes();
        sendResponse(res, 200, true, 'OK', { id: 1 });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'OK',
            data: { id: 1 },
        });
    });

    it('should include data as null even when not explicitly provided', () => {
        const res = mockRes();
        sendResponse(res, 400, false, 'Bad Request');
        const call = res.json.mock.calls[0][0];
        expect(call).toEqual({ success: false, message: 'Bad Request', data: null });
        expect(call).toHaveProperty('data');
        expect(call.data).toBeNull();
        expect(call).not.toHaveProperty('error');
    });

    it('should include error and keep data as null when provided', () => {
        const res = mockRes();
        sendResponse(res, 500, false, 'Internal Error', null, 'stack trace here');
        const call = res.json.mock.calls[0][0];
        expect(call.error).toBe('stack trace here');
        expect(call.data).toBeNull();
    });

    it('should include both data and error when provided', () => {
        const res = mockRes();
        sendResponse(res, 200, true, 'Partial', { items: [] }, 'some warning');
        const call = res.json.mock.calls[0][0];
        expect(call.data).toEqual({ items: [] });
        expect(call.error).toBe('some warning');
    });
});
