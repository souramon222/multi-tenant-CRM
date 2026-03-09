const mongoose = require('mongoose');
const crypto = require('crypto');

const companySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    companyId: {
        type: String,
        required: true,
        unique: true,
        default: () => 'CO-' + crypto.randomUUID().split('-')[0].toUpperCase()
    },
    status: { type: String, enum: ['active', 'blocked', 'deleted'], default: 'active' },
    deletedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
