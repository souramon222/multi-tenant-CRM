const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'] },
    phone: { type: String },
    complaint: { type: String, default: '' },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'In Progress', 'On Hold', 'Resolved', 'Closed'],
        default: 'New',
        index: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium',
        index: true
    },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
