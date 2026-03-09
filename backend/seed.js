const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Company = require('./models/Company');
const Customer = require('./models/Customer');
const Assignment = require('./models/Assignment');
const Activity = require('./models/Activity');
const connectDB = require('./config/db');

connectDB();

const importData = async () => {
    try {
        // Delete all data except superadmin
        await User.deleteMany({ role: { $ne: 'superadmin' } });
        await Company.deleteMany();
        await Customer.deleteMany();
        await Assignment.deleteMany();
        await Activity.deleteMany();

        // Check if superadmin already exists
        const superadminExists = await User.findOne({ role: 'superadmin' });

        if (!superadminExists) {
            await User.create({
                name: process.env.SUPERADMIN_NAME,
                username: process.env.SUPERADMIN_USERNAME,
                email: process.env.SUPERADMIN_EMAIL,
                password: process.env.SUPERADMIN_PASSWORD,
                role: 'superadmin'
            });
            console.log('Superadmin created successfully');
        } else {
            console.log('Superadmin already exists, skipping creation');
        }

        console.log('Data cleared successfully');
        process.exit();
    } catch (error) {
        console.error(`Error with data import: ${error}`);
        process.exit(1);
    }
};

importData();