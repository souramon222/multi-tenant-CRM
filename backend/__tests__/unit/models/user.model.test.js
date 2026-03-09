/**
 * User Model Unit Tests
 * Tests: password hashing, matchPassword, role validation
 */
const User = require('../../../models/User');

describe('User Model', () => {
    it('should hash password on save', async () => {
        const user = new User({
            name: 'Test', username: 'hashtest', email: 'hash@t.com',
            password: 'Plain1234', role: 'admin',
        });
        await user.save();
        expect(user.password).not.toBe('Plain1234');
        expect(user.password.length).toBeGreaterThan(50);
    });

    it('should not re-hash password if not modified', async () => {
        const user = await User.create({
            name: 'NoRehash', username: 'norehash', email: 'nr@t.com',
            password: 'Pass1234', role: 'admin',
        });
        const originalHash = user.password;
        user.name = 'Updated Name';
        await user.save();
        expect(user.password).toBe(originalHash);
    });

    it('matchPassword should return true for correct password', async () => {
        const user = await User.create({
            name: 'Match', username: 'matchuser', email: 'match@t.com',
            password: 'Match1234', role: 'admin',
        });
        const isMatch = await user.matchPassword('Match1234');
        expect(isMatch).toBe(true);
    });

    it('matchPassword should return false for wrong password', async () => {
        const user = await User.create({
            name: 'NoMatch', username: 'nomatch', email: 'nm@t.com',
            password: 'Right1234', role: 'admin',
        });
        const isMatch = await user.matchPassword('Wrong1234');
        expect(isMatch).toBe(false);
    });

    it('should reject invalid role', async () => {
        const user = new User({
            name: 'Bad', username: 'badrole', email: 'br@t.com',
            password: 'Pass1234', role: 'hacker',
        });
        await expect(user.validate()).rejects.toThrow();
    });

    it('should require name, username, email, password, role', async () => {
        const user = new User({});
        const err = user.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.name).toBeDefined();
        expect(err.errors.username).toBeDefined();
        expect(err.errors.email).toBeDefined();
        expect(err.errors.password).toBeDefined();
        expect(err.errors.role).toBeDefined();
    });
});
