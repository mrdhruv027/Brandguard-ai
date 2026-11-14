const Store = require('../models/store');

// Add comment to submission
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, findingId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty' });
    }

    const submission = await Store.submissions.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const comment = await Store.comments.create({
      submissionId: id,
      authorId: req.user._id || req.user.id,
      authorName: req.user.name,
      authorRole: req.user.role,
      text: text.trim(),
      findingId: findingId || null
    });

    await Store.audit.log(
      'comment_added',
      'submission',
      id,
      {
        userId: req.user._id || req.user.id,
        userName: req.user.name,
        userRole: req.user.role
      },
      { commentId: comment._id || comment.id, text: text.substring(0, 100) }
    );

    return res.status(201).json({ success: true, comment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Manager or Compliance Admin approval/rejection decision
const submitDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, comments } = req.body;

    // Verify authorized role
    if (!['brand_manager', 'compliance_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Only Brand Managers and Compliance Admins have approval authority.'
      });
    }

    const allowedDecisions = ['Approved', 'Changes Requested', 'Rejected'];
    if (!allowedDecisions.includes(decision)) {
      return res.status(400).json({
        success: false,
        message: `Invalid decision. Allowed: ${allowedDecisions.join(', ')}`
      });
    }

    const submission = await Store.submissions.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Record formal approval record
    const approvalRecord = await Store.approvals.create({
      submissionId: id,
      reviewerId: req.user._id || req.user.id,
      reviewerName: req.user.name,
      reviewerRole: req.user.role,
      decision,
      comments: comments || '',
      submissionVersion: submission.version || 1,
      timestamp: new Date()
    });

    // Update submission status
    const updatedStatus = decision; // 'Approved', 'Changes Requested', or 'Rejected'
    const updatedSub = await Store.submissions.updateOne(id, {
      status: updatedStatus
    });

    // Map audit action
    const actionMap = {
      'Approved': 'content_approved',
      'Changes Requested': 'changes_requested',
      'Rejected': 'content_rejected'
    };

    await Store.audit.log(
      actionMap[decision] || 'review_submitted',
      'submission',
      id,
      {
        userId: req.user._id || req.user.id,
        userName: req.user.name,
        userRole: req.user.role
      },
      {
        decision,
        comments,
        submissionVersion: submission.version || 1
      }
    );

    return res.json({
      success: true,
      submission: updatedSub,
      approval: approvalRecord,
      message: `Review decision successfully recorded: ${decision}`
    });
  } catch (error) {
    console.error('[Submit Decision Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addComment,
  submitDecision
};
