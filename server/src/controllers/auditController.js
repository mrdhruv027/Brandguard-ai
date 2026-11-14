const Store = require('../models/store');

// Full Audit Trail
const getAuditLogs = async (req, res) => {
  try {
    const { action, entityType, limit } = req.query;
    let query = {};
    if (action && action !== 'All') query.action = action;
    if (entityType && entityType !== 'All') query.entityType = entityType;

    const logs = await Store.audit.find(query, parseInt(limit) || 100);
    return res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Executive Compliance Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const submissions = await Store.submissions.find();
    const rules = await Store.rules.find();
    const guidelines = await Store.guidelines.find();

    const totalSubmissions = submissions.length;
    const approvedCount = submissions.filter(s => s.status === 'Approved').length;
    const underReviewCount = submissions.filter(s => s.status === 'Under Review').length;
    const issuesFoundCount = submissions.filter(s => s.status === 'Issues Found').length;
    const changesRequestedCount = submissions.filter(s => s.status === 'Changes Requested').length;

    // Average compliance score
    const scoredSubmissions = submissions.filter(s => s.complianceScore !== null && s.complianceScore !== undefined);
    const avgScore = scoredSubmissions.length > 0
      ? Math.round(scoredSubmissions.reduce((acc, s) => acc + s.complianceScore, 0) / scoredSubmissions.length)
      : 88;

    // Rules category breakdown
    const rulesByCategory = {};
    rules.forEach(r => {
      rulesByCategory[r.category] = (rulesByCategory[r.category] || 0) + 1;
    });

    return res.json({
      success: true,
      stats: {
        totalSubmissions,
        approvedCount,
        underReviewCount,
        issuesFoundCount,
        changesRequestedCount,
        averageComplianceScore: avgScore,
        activeRulesCount: rules.filter(r => r.status === 'approved').length,
        totalGuidelinesCount: guidelines.length,
        rulesByCategory,
        approvalRate: totalSubmissions > 0 ? Math.round((approvedCount / totalSubmissions) * 100) : 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAuditLogs,
  getDashboardStats
};
