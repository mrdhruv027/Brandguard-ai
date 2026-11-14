const mongoose = require('mongoose');

const FindingSchema = new mongoose.Schema({
  findingId: { type: String, required: true },
  flaggedText: { type: String, required: true },
  category: { type: String, required: true },
  severity: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  ruleId: { type: String, required: true },
  supportingQuotation: { type: String, required: true },
  explanation: { type: String, required: true },
  suggestedCorrection: { type: String, required: true },
  confidenceScore: { type: Number, required: true },
  engine: { type: String, default: 'Local Deterministic Rule Engine' },
  verifiedCitation: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['open', 'accepted', 'ignored', 'flagged_for_review'],
    default: 'open'
  },
  ignoreReason: { type: String }
});

const AnalysisResultSchema = new mongoose.Schema({
  submissionId: { type: String, required: true },
  complianceScore: { type: Number, required: true },
  status: { type: String, required: true },
  summary: { type: String, required: true },
  totalIssues: { type: Number, default: 0 },
  severityBreakdown: {
    High: { type: Number, default: 0 },
    Medium: { type: Number, default: 0 },
    Low: { type: Number, default: 0 }
  },
  findings: [FindingSchema],
  unclearGuidelines: [
    {
      ruleId: { type: String },
      category: { type: String },
      issue: { type: String },
      recommendation: { type: String }
    }
  ],
  retrievedRulesCount: { type: Number, default: 0 },
  modelUsed: { type: String, default: 'Local Deterministic Rule Engine' },
  organizationId: { type: String, default: 'org-innovexa-001' },
  analyzedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AnalysisResult', AnalysisResultSchema);
