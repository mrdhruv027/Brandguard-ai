const mongoose = require('mongoose');

const BrandGuidelineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  sourceDoc: { type: String, required: true },
  originalFileName: { type: String },
  fileType: { type: String, enum: ['pdf', 'docx', 'txt', 'raw'], default: 'pdf' },
  filePath: { type: String },
  extractedRulesCount: { type: Number, default: 0 },
  organizationId: { type: String, default: 'org-innovexa-001' },
  uploadedBy: {
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String }
  },
  status: { type: String, enum: ['active', 'archived', 'processing'], default: 'active' },
  rawContent: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BrandGuideline', BrandGuidelineSchema);
