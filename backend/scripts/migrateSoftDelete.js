const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Customer = require('../models/Customer');

const migrate = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        console.log('Migrating Users...');
        const userResult = await User.updateMany(
            { isDeleted: { $exists: false } },
            { $set: { isDeleted: false, deletedAt: null } }
        );
        console.log(`Users updated: ${userResult.modifiedCount}`);

        console.log('Migrating Customers...');
        const customerResult = await Customer.updateMany(
            { isDeleted: { $exists: false } },
            { $set: { isDeleted: false, deletedAt: null } }
        );
        console.log(`Customers updated: ${customerResult.modifiedCount}`);

        console.log('Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
};

migrate();
