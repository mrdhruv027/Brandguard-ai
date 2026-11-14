const Store = require('../models/store');
const AIService = require('../services/aiService');

// Create new submission (paste text or file upload)
const createSubmission = async (req, res) => {
  try {
    const { title, contentType } = req.body;
    let content = req.body.content || '';
    let sourceFileName = null;

    if (req.file) {
      sourceFileName = req.file.originalname;
      const extraction = await AIService.extractDocument(req.file.buffer, req.file.originalname, req.file.mimetype);
      content = extraction.full_text || content;
    }

    if (!content.trim()) {
      return res.status(400).json({ success: false, message: 'Content cannot be empty. Please enter text or upload a document.' });
    }

    const submission = await Store.submissions.create({
      title: title || 'Untitled Campaign Copy',
      contentType: contentType || 'Social Media Post',
      originalContent: content,
      currentContent: content,
      sourceFileName,
      submittedBy: {
        userId: req.user._id || req.user.id,
        userName: req.user.name,
        userRole: req.user.role
      },
      organizationId: req.user.organizationId || 'org-innovexa-001',
      status: 'Submitted'
    });

    await Store.audit.log(
      'content_submitted',
      'submission',
      submission._id || submission.id,
      {
        userId: req.user._id || req.user.id,
        userName: req.user.name,
        userRole: req.user.role
      },
      {
        title: submission.title,
        contentType: submission.contentType,
        length: content.length
      }
    );

    return res.status(201).json({ success: true, submission });
  } catch (error) {
    console.error('[Create Submission Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// List submissions
const getSubmissions = async (req, res) => {
  try {
    const { status, contentType } = req.query;
    let list = await Store.submissions.find();

    if (status && status !== 'All') {
      list = list.filter(s => s.status.toLowerCase() === status.toLowerCase());
    }

    if (contentType && contentType !== 'All') {
      list = list.filter(s => s.contentType.toLowerCase() === contentType.toLowerCase());
    }

    return res.json({ success: true, count: list.length, submissions: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get single submission with analysis, comments, and approvals
const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Store.submissions.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const analysis = await Store.analysis.findBySubmissionId(id);
    const comments = await Store.comments.findBySubmissionId(id);
    const approvals = await Store.approvals.findBySubmissionId(id);

    return res.json({
      success: true,
      submission,
      analysis,
      comments,
      approvals
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Trigger AI Brand Analysis against approved rules
const runAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Store.submissions.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Set status to Analyzing
    await Store.submissions.updateOne(id, { status: 'Analyzing' });

    // 1. Retrieve all approved rules
    const approvedRules = await Store.rules.find({ status: 'approved' });

    // 2. Run AI RAG analysis
    const analysisResponse = await AIService.analyzeContent(
      submission.title,
      submission.currentContent,
      submission.contentType,
      approvedRules
    );

    // 3. Save Analysis Result
    const newStatus = analysisResponse.total_issues > 0 ? 'Issues Found' : 'Draft';
    const analysisRecord = await Store.analysis.create({
      submissionId: id,
      complianceScore: analysisResponse.compliance_score,
      status: analysisResponse.status,
      summary: analysisResponse.summary,
      totalIssues: analysisResponse.total_issues,
      severityBreakdown: analysisResponse.severity_breakdown,
      findings: analysisResponse.findings.map(f => ({
        findingId: f.finding_id || f.findingId,
        flaggedText: f.flagged_text || f.flaggedText,
        category: f.category,
        severity: f.severity,
        ruleId: f.rule_id || f.ruleId,
        supportingQuotation: f.supporting_quotation || f.supportingQuotation,
        explanation: f.explanation,
        suggestedCorrection: f.suggested_correction || f.suggestedCorrection,
        confidenceScore: f.confidence_score || f.confidenceScore,
        verifiedCitation: f.verified_citation !== undefined ? f.verified_citation : true,
        status: f.status || 'open'
      })),
      unclearGuidelines: analysisResponse.unclear_guidelines || [],
      retrievedRulesCount: analysisResponse.retrieved_rules_count || approvedRules.length,
      modelUsed: analysisResponse.model_used,
      organizationId: submission.organizationId
    });

    // 4. Update Submission with new score & status
    const updatedSub = await Store.submissions.updateOne(id, {
      status: newStatus,
      complianceScore: analysisResponse.compliance_score,
      latestAnalysisId: analysisRecord._id || analysisRecord.id
    });

    // 5. Audit Log
    await Store.audit.log(
      'ai_analysis_completed',
      'submission',
      id,
      {
        userId: req.user._id || req.user.id,
        userName: req.user.name,
        userRole: req.user.role
      },
      {
        complianceScore: analysisResponse.compliance_score,
        totalIssues: analysisResponse.total_issues,
        modelUsed: analysisResponse.model_used
      }
    );

    return res.json({
      success: true,
      submission: updatedSub,
      analysis: analysisRecord
    });
  } catch (error) {
    console.error('[Run Analysis Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Accept AI suggestion: auto-patches text, records revision & updates finding
const applySuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { findingId, flaggedText, suggestedCorrection } = req.body;

    const submission = await Store.submissions.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (!flaggedText || !suggestedCorrection) {
      return res.status(400).json({ success: false, message: 'flaggedText and suggestedCorrection are required' });
    }

    // Replace first occurrence of flaggedText
    const current = submission.currentContent;
    let updatedContent = current;
    
    // Case-insensitive replacement if exact not found
    if (updatedContent.includes(flaggedText)) {
      updatedContent = updatedContent.replace(flaggedText, suggestedCorrection);
    } else {
      const regex = new RegExp(flaggedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      updatedContent = updatedContent.replace(regex, suggestedCorrection);
    }

    const newVersion = (submission.version || 1) + 1;
    const revisions = [...(submission.revisions || []), {
      version: newVersion,
      content: updatedContent,
      updatedBy: req.user.name,
      timestamp: new Date(),
      changeNote: `Applied suggested correction for ${findingId}: "${suggestedCorrection}"`
    }];

    // Update finding status
    await Store.analysis.updateFindingStatus(id, findingId, 'accepted');

    const updatedSub = await Store.submissions.updateOne(id, {
      currentContent: updatedContent,
      version: newVersion,
      status: 'Revised',
      revisions
    });

    await Store.audit.log(
      'suggestion_applied',
      'submission',
      id,
      {
        userId: req.user._id || req.user.id,
        userName: req.user.name,
        userRole: req.user.role
      },
      {
        findingId,
        replaced: flaggedText,
        correction: suggestedCorrection,
        version: newVersion
      }
    );

    const latestAnalysis = await Store.analysis.findBySubmissionId(id);

    return res.json({
      success: true,
      submission: updatedSub,
      analysis: latestAnalysis,
      message: 'Suggestion applied successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Ignore finding with mandatory reason
const ignoreFinding = async (req, res) => {
  try {
    const { id } = req.params;
    const { findingId, reason } = req.body;

    if (!findingId || !reason) {
      return res.status(400).json({ success: false, message: 'findingId and a justification reason are required' });
    }

    const updatedAnalysis = await Store.analysis.updateFindingStatus(id, findingId, 'ignored', reason);

    await Store.audit.log(
      'finding_ignored',
      'submission',
      id,
      {
        userId: req.user._id || req.user.id,
        userName: req.user.name,
        userRole: req.user.role
      },
      { findingId, reason }
    );

    return res.json({
      success: true,
      analysis: updatedAnalysis,
      message: 'Finding marked as ignored.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Creator manually edits content
const reviseContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, changeNote } = req.body;

    const submission = await Store.submissions.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Revised content cannot be empty' });
    }

    const newVersion = (submission.version || 1) + 1;
    const revisions = [...(submission.revisions || []), {
      version: newVersion,
      content,
      updatedBy: req.user.name,
      timestamp: new Date(),
      changeNote: changeNote || 'Manual editorial revision'
    }];

    const updatedSub = await Store.submissions.updateOne(id, {
      currentContent: content,
      version: newVersion,
      status: 'Revised',
      revisions
    });

    await Store.audit.log(
      'content_revised',
      'submission',
      id,
      {
        userId: req.user._id || req.user.id,
        userName: req.user.name,
        userRole: req.user.role
      },
      { version: newVersion, changeNote }
    );

    return res.json({ success: true, submission: updatedSub });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Submit for human review (Draft / Revised -> Under Review)
const submitForReview = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Store.submissions.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const updated = await Store.submissions.updateOne(id, { status: 'Under Review' });

    await Store.audit.log(
      'review_submitted',
      'submission',
      id,
      {
        userId: req.user._id || req.user.id,
        userName: req.user.name,
        userRole: req.user.role
      },
      { title: submission.title, version: submission.version }
    );

    return res.json({
      success: true,
      submission: updated,
      message: 'Content successfully queued for brand manager review.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  runAnalysis,
  applySuggestion,
  ignoreFinding,
  reviseContent,
  submitForReview
};
