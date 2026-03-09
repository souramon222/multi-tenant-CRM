const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    note: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['System', 'Manual'],
        default: 'Manual'
    },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
