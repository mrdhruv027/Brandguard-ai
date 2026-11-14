const mongoose = require('mongoose');

const ContentSubmissionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  contentType: {
    type: String,
    enum: ['Social Media Post', 'Advertisement', 'Email', 'Document'],
    default: 'Social Media Post'
  },
  originalContent: { type: String, required: true },
  currentContent: { type: String, required: true },
  submittedBy: {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userRole: { type: String, default: 'creator' }
  },
  organizationId: { type: String, default: 'org-innovexa-001' },
  status: {
    type: String,
    enum: [
      'Draft',
      'Submitted',
      'Analyzing',
      'Issues Found',
      'Revised',
      'Under Review',
      'Changes Requested',
      'Approved',
      'Rejected'
    ],
    default: 'Submitted'
  },
  complianceScore: { type: Number, default: null },
  latestAnalysisId: { type: String },
  version: { type: Number, default: 1 },
  sourceFileName: { type: String },
  revisions: [
    {
      version: { type: Number },
      content: { type: String },
      updatedBy: { type: String },
      timestamp: { type: Date, default: Date.now },
      changeNote: { type: String }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContentSubmission', ContentSubmissionSchema);
