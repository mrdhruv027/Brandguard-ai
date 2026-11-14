const mongoose = require('mongoose');

const ApprovalSchema = new mongoose.Schema({
  submissionId: { type: String, required: true },
  reviewerId: { type: String, required: true },
  reviewerName: { type: String, required: true },
  reviewerRole: { type: String, required: true },
  decision: {
    type: String,
    enum: ['Approved', 'Changes Requested', 'Rejected'],
    required: true
  },
  comments: { type: String, default: '' },
  submissionVersion: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Approval', ApprovalSchema);
