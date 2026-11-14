const mongoose = require('mongoose');

const BrandRuleSchema = new mongoose.Schema({
  ruleId: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: [
      'Brand tone',
      'Terminology',
      'Messaging',
      'Approved facts',
      'Prohibited claims',
      'Formatting',
      'Visual identity'
    ],
    required: true
  },
  ruleText: { type: String, required: true },
  explanation: { type: String },
  sourceDoc: { type: String, default: 'Brand Guidelines' },
  pageNumber: { type: Number, default: 1 },
  guidelineId: { type: String },
  organizationId: { type: String, default: 'org-innovexa-001' },
  status: { type: String, enum: ['approved', 'draft', 'under_review', 'archived'], default: 'approved' },
  keywords: [{ type: String }],
  createdBy: { type: String },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BrandRule', BrandRuleSchema);
