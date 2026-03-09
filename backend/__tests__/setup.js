/**
 * Global test setup — mongodb-memory-server lifecycle
 * This file is referenced by Jest's setupFilesAfterSetup config.
 */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Set test environment variables BEFORE any app code loads
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-12345';
process.env.JWT_EXPIRE = '15m';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-67890';
process.env.JWT_REFRESH_EXPIRE = '7d';

let mongoServer;

beforeAll(async () => {
    // Close any existing connections (safety net)
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
});

afterEach(async () => {
    // Clear all collections between tests for full isolation
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});
