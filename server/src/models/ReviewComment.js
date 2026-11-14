const mongoose = require('mongoose');

const ReviewCommentSchema = new mongoose.Schema({
  submissionId: { type: String, required: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, required: true },
  text: { type: String, required: true },
  findingId: { type: String }, // Optional link to specific finding
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReviewComment', ReviewCommentSchema);
