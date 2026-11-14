const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: [
      'guideline_uploaded',
      'rule_created',
      'rule_updated',
      'rule_deleted',
      'content_submitted',
      'ai_analysis_completed',
      'suggestion_applied',
      'finding_ignored',
      'content_revised',
      'review_submitted',
      'comment_added',
      'changes_requested',
      'content_approved',
      'content_rejected'
    ],
    required: true
  },
  entityType: { type: String, required: true }, // guideline, rule, submission, analysis, approval
  entityId: { type: String, required: true },
  performedBy: {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true }
  },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  organizationId: { type: String, default: 'org-innovexa-001' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
