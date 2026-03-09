const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    assignedAt: { type: Date, default: Date.now },
}, { timestamps: true });

assignmentSchema.index(
  { employee: 1, customer: 1, company: 1 },
  { unique: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);