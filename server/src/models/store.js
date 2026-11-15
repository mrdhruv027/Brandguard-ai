const crypto = require('crypto');
const { getDBStatus } = require('../config/db');

// Import Mongoose Models
const User = require('./User');
const BrandGuideline = require('./BrandGuideline');
const BrandRule = require('./BrandRule');
const ContentSubmission = require('./ContentSubmission');
const AnalysisResult = require('./AnalysisResult');
const ReviewComment = require('./ReviewComment');
const Approval = require('./Approval');
const AuditLog = require('./AuditLog');

// In-Memory Storage Arrays (automatic fallback)
const inMemory = {
  users: [
    {
      _id: 'usr-creator-01',
      id: 'usr-creator-01',
      name: 'Dhruv Sharma',
      email: 'creator@brandguard.ai',
      password: 'password123',
      role: 'creator',
      organizationId: 'org-innovexa-001',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv',
      createdAt: new Date('2026-01-01')
    },
    {
      _id: 'usr-manager-02',
      id: 'usr-manager-02',
      name: 'Isha Upadhyay',
      email: 'manager@brandguard.ai',
      password: 'password123',
      role: 'brand_manager',
      organizationId: 'org-innovexa-001',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isha',
      createdAt: new Date('2026-01-01')
    },
    {
      _id: 'usr-admin-03',
      id: 'usr-admin-03',
      name: 'Compliance Officer',
      email: 'admin@brandguard.ai',
      password: 'password123',
      role: 'compliance_admin',
      organizationId: 'org-innovexa-001',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      createdAt: new Date('2026-01-01')
    }
  ],
  guidelines: [
    {
      _id: 'gl-001',
      id: 'gl-001',
      title: 'Global Enterprise Brand Guidelines 2026',
      description: 'Official corporate voice, messaging pillars, approved claims, and terminology standard.',
      sourceDoc: 'Brand_Governance_Manual_2026.pdf',
      originalFileName: 'Brand_Governance_Manual_2026.pdf',
      fileType: 'pdf',
      extractedRulesCount: 7,
      organizationId: 'org-innovexa-001',
      uploadedBy: {
        userId: 'usr-admin-03',
        userName: 'Compliance Officer',
        userRole: 'compliance_admin'
      },
      status: 'active',
      createdAt: new Date('2026-01-15')
    }
  ],
  rules: [
    {
      _id: 'rule-001',
      id: 'rule-001',
      ruleId: 'RULE-TONE-001',
      category: 'Brand tone',
      ruleText: "Brand voice must remain confident, empathetic, and professional. Avoid aggressive sales slang like 'dirt cheap', 'kill the competition', or 'crappy'.",
      explanation: "Approved brand tone requirement from Brand_Governance_Manual_2026.pdf (Page 2). Creators must maintain enterprise respectfulness.",
      sourceDoc: 'Brand_Governance_Manual_2026.pdf',
      pageNumber: 2,
      guidelineId: 'gl-001',
      organizationId: 'org-innovexa-001',
      status: 'approved',
      keywords: ['tone', 'voice', 'professional', 'cheap', 'slang', 'respectful'],
      createdBy: 'usr-admin-03',
      createdAt: new Date('2026-01-15')
    },
    {
      _id: 'rule-002',
      id: 'rule-002',
      ruleId: 'RULE-TERM-002',
      category: 'Terminology',
      ruleText: "Always spell the product name as 'BrandGuard AI' with uppercase B, G, and AI. Never spell it as 'brandguard' or 'Brandguard'.",
      explanation: "Official product naming convention from Brand_Governance_Manual_2026.pdf (Page 3). Consistent trademark capitalization is mandatory.",
      sourceDoc: 'Brand_Governance_Manual_2026.pdf',
      pageNumber: 3,
      guidelineId: 'gl-001',
      organizationId: 'org-innovexa-001',
      status: 'approved',
      keywords: ['brandguard', 'brandguard ai', 'naming', 'spelling', 'trademark'],
      createdBy: 'usr-admin-03',
      createdAt: new Date('2026-01-15')
    },
    {
      _id: 'rule-003',
      id: 'rule-003',
      ruleId: 'RULE-MESG-003',
      category: 'Messaging',
      ruleText: "Our core value proposition statement is: 'Intelligent brand governance – catch inconsistencies before content is published.' Use this exact wording across campaigns.",
      explanation: "Core brand pillar approved by marketing leadership (Page 4). Reinforces pre-publication governance positioning.",
      sourceDoc: 'Brand_Governance_Manual_2026.pdf',
      pageNumber: 4,
      guidelineId: 'gl-001',
      organizationId: 'org-innovexa-001',
      status: 'approved',
      keywords: ['messaging', 'governance', 'tagline', 'inconsistencies', 'published'],
      createdBy: 'usr-admin-03',
      createdAt: new Date('2026-01-15')
    },
    {
      _id: 'rule-004',
      id: 'rule-004',
      ruleId: 'RULE-CLAIM-004',
      category: 'Prohibited claims',
      ruleText: "Never claim '100% bug-free' or make absolute guarantees such as 'zero risk guarantee'. All performance claims must be qualified with empirical benchmarks.",
      explanation: "Legal and compliance restriction (Page 5). Absolute guarantees create regulatory and liability risks.",
      sourceDoc: 'Brand_Governance_Manual_2026.pdf',
      pageNumber: 5,
      guidelineId: 'gl-001',
      organizationId: 'org-innovexa-001',
      status: 'approved',
      keywords: ['100%', 'bug-free', 'zero risk', 'guarantee', 'prohibited', 'claims'],
      createdBy: 'usr-admin-03',
      createdAt: new Date('2026-01-15')
    },
    {
      _id: 'rule-005',
      id: 'rule-005',
      ruleId: 'RULE-FACT-005',
      category: 'Approved facts',
      ruleText: "Approved institutional metric: BrandGuard AI is trusted by over 450+ enterprise compliance teams worldwide. Do not fabricate unverified customer figures.",
      explanation: "Audited corporate statistic from Q4 2025 report (Page 6).",
      sourceDoc: 'Brand_Governance_Manual_2026.pdf',
      pageNumber: 6,
      guidelineId: 'gl-001',
      organizationId: 'org-innovexa-001',
      status: 'approved',
      keywords: ['450+', 'enterprise', 'metric', 'facts', 'statistic', 'teams'],
      createdBy: 'usr-admin-03',
      createdAt: new Date('2026-01-15')
    },
    {
      _id: 'rule-006',
      id: 'rule-006',
      ruleId: 'RULE-FORM-006',
      category: 'Formatting',
      ruleText: "All social media and ad headlines must use Title Case capitalization and never terminate with double exclamation marks (!!).",
      explanation: "Editorial styling standard (Page 7). Prevents spam-like communication.",
      sourceDoc: 'Brand_Governance_Manual_2026.pdf',
      pageNumber: 7,
      guidelineId: 'gl-001',
      organizationId: 'org-innovexa-001',
      status: 'approved',
      keywords: ['formatting', 'title case', 'exclamation', 'punctuation', 'headline'],
      createdBy: 'usr-admin-03',
      createdAt: new Date('2026-01-15')
    },
    {
      _id: 'rule-007',
      id: 'rule-007',
      ruleId: 'RULE-VIS-007',
      category: 'Visual identity',
      ruleText: "Official Brand Colors: Approved primary brand colors are Deep Navy (#0F172A) and Electric Orange (#F97316). Background surfaces must remain clean white (#FFFFFF) or Soft Slate (#F8FAFC). Never use neon or unapproved accent colors.",
      explanation: "Design palette specifications from Brand_Governance_Manual_2026.pdf (Page 8). Maintains enterprise aesthetic.",
      sourceDoc: 'Brand_Governance_Manual_2026.pdf',
      pageNumber: 8,
      guidelineId: 'gl-001',
      organizationId: 'org-innovexa-001',
      status: 'approved',
      keywords: ['color', 'hex', 'deep navy', 'electric orange', 'visual', 'palette', 'neon'],
      createdBy: 'usr-admin-03',
      createdAt: new Date('2026-01-15')
    },
    {
      _id: 'rule-008',
      id: 'rule-008',
      ruleId: 'RULE-VIS-008',
      category: 'Visual identity',
      ruleText: "Official Brand Logo: The BrandGuard AI logo consists of the dual-tone shield emblem with orange accent. The logo must never be distorted, stretched, recolored, tilted, or placed on busy backgrounds with less than 24px of clear padding.",
      explanation: "Trademark logo integrity standards from Brand_Governance_Manual_2026.pdf (Page 9).",
      sourceDoc: 'Brand_Governance_Manual_2026.pdf',
      pageNumber: 9,
      guidelineId: 'gl-001',
      organizationId: 'org-innovexa-001',
      status: 'approved',
      keywords: ['logo', 'shield', 'emblem', 'padding', 'distorted', 'stretched'],
      createdBy: 'usr-admin-03',
      createdAt: new Date('2026-01-15')
    },
    {
      _id: 'rule-009',
      id: 'rule-009',
      ruleId: 'RULE-MESG-009',
      category: 'Messaging',
      ruleText: "Brand messaging regarding software performance should generally feel appropriate depending on audience segment and campaign context.",
      explanation: "Marketing flexibility note (Page 10). Marked as ambiguous by BrandGuard AI compliance auditor.",
      sourceDoc: 'Brand_Governance_Manual_2026.pdf',
      pageNumber: 10,
      guidelineId: 'gl-001',
      organizationId: 'org-innovexa-001',
      status: 'approved',
      keywords: ['generally', 'appropriate', 'performance', 'audience', 'messaging'],
      createdBy: 'usr-admin-03',
      createdAt: new Date('2026-01-15')
    }
  ],
  submissions: [],
  analysisResults: [],
  comments: [],
  approvals: [],
  auditLogs: [
    {
      _id: 'log-seed-01',
      action: 'guideline_uploaded',
      entityType: 'guideline',
      entityId: 'gl-001',
      performedBy: {
        userId: 'usr-admin-03',
        userName: 'Compliance Officer',
        userRole: 'compliance_admin'
      },
      details: {
        title: 'Global Enterprise Brand Guidelines 2026',
        extractedRules: 7
      },
      organizationId: 'org-innovexa-001',
      timestamp: new Date('2026-01-15')
    }
  ]
};

// Seed an initial demo submission for immediate judge testing
const initialSubmission = {
  _id: 'sub-demo-001',
  id: 'sub-demo-001',
  title: 'Q1 Product Launch Announcement',
  contentType: 'Social Media Post',
  originalContent: "Switch to brandguard today! Our software is 100% bug-free and dirt cheap compared to others. Over 9,000 teams trust us already!!",
  currentContent: "Switch to brandguard today! Our software is 100% bug-free and dirt cheap compared to others. Over 9,000 teams trust us already!!",
  submittedBy: {
    userId: 'usr-creator-01',
    userName: 'Dhruv Sharma',
    userRole: 'creator'
  },
  organizationId: 'org-innovexa-001',
  status: 'Issues Found',
  complianceScore: 38,
  latestAnalysisId: 'res-demo-001',
  version: 1,
  revisions: [
    {
      version: 1,
      content: "Switch to brandguard today! Our software is 100% bug-free and dirt cheap compared to others. Over 9,000 teams trust us already!!",
      updatedBy: 'usr-creator-01',
      timestamp: new Date(),
      changeNote: 'Initial draft submission'
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

const initialAnalysis = {
  _id: 'res-demo-001',
  submissionId: 'sub-demo-001',
  complianceScore: 38,
  status: 'Issues Found',
  summary: 'Detected 4 brand inconsistency issues (2 High severity). Critical corrections required before publishing.',
  totalIssues: 4,
  severityBreakdown: { High: 2, Medium: 2, Low: 0 },
  findings: [
    {
      findingId: 'FIND-DEMO-01',
      flaggedText: 'brandguard',
      category: 'Terminology',
      severity: 'Medium',
      ruleId: 'RULE-TERM-002',
      supportingQuotation: "Always spell the product name as 'BrandGuard AI' with uppercase B, G, and AI. Never spell it as 'brandguard' or 'Brandguard'.",
      explanation: "Improper product naming capitalization detected. Official trademark spelling is 'BrandGuard AI'.",
      suggestedCorrection: 'BrandGuard AI',
      confidenceScore: 0.95,
      engine: 'Local Deterministic Rule Engine',
      verifiedCitation: true,
      status: 'open'
    },
    {
      findingId: 'FIND-DEMO-02',
      flaggedText: '100% bug-free',
      category: 'Prohibited claims',
      severity: 'High',
      ruleId: 'RULE-CLAIM-004',
      supportingQuotation: "Never claim '100% bug-free' or make absolute guarantees such as 'zero risk guarantee'. All performance claims must be qualified with empirical benchmarks.",
      explanation: "Contains absolute guarantee '100% bug-free' which violates regulatory guidelines and enterprise risk policy.",
      suggestedCorrection: 'engineered for 99.9% uptime and enterprise-grade reliability',
      confidenceScore: 0.98,
      engine: 'Local Deterministic Rule Engine',
      verifiedCitation: true,
      status: 'open'
    },
    {
      findingId: 'FIND-DEMO-03',
      flaggedText: 'dirt cheap',
      category: 'Brand tone',
      severity: 'Medium',
      ruleId: 'RULE-TONE-001',
      supportingQuotation: "Brand voice must remain confident, empathetic, and professional. Avoid aggressive sales slang like 'dirt cheap', 'kill the competition', or 'crappy'.",
      explanation: "Tone deviation: 'dirt cheap' is unapproved aggressive sales slang.",
      suggestedCorrection: 'highly cost-effective',
      confidenceScore: 0.92,
      engine: 'Local Deterministic Rule Engine',
      verifiedCitation: true,
      status: 'open'
    },
    {
      findingId: 'FIND-DEMO-04',
      flaggedText: '9,000 teams',
      category: 'Approved facts',
      severity: 'High',
      ruleId: 'RULE-FACT-005',
      supportingQuotation: "Approved institutional metric: BrandGuard AI is trusted by over 450+ enterprise compliance teams worldwide. Do not fabricate unverified customer figures.",
      explanation: "Unverified statistic '9,000 teams' contradicts verified company metric of '450+ enterprise compliance teams'.",
      suggestedCorrection: 'trusted by over 450+ enterprise compliance teams worldwide',
      confidenceScore: 0.90,
      engine: 'Local Deterministic Rule Engine',
      verifiedCitation: true,
      status: 'open'
    },
    {
      findingId: 'FIND-DEMO-05',
      flaggedText: 'already!!',
      category: 'Formatting',
      severity: 'Low',
      ruleId: 'RULE-FORM-006',
      supportingQuotation: "All social media and ad headlines must use Title Case capitalization and never terminate with double exclamation marks (!!).",
      explanation: "Double exclamation mark (!!) violates editorial style standard. Marginal context score.",
      suggestedCorrection: 'already.',
      confidenceScore: 0.74,
      engine: 'Local Deterministic Rule Engine',
      verifiedCitation: true,
      status: 'open'
    }
  ],
  unclearGuidelines: [
    {
      ruleId: 'RULE-MESG-009',
      category: 'Messaging',
      issue: "Subjective guideline phrasing ('should generally feel appropriate depending on audience segment') lacks concrete compliance criteria.",
      recommendation: 'Replace subjective terminology with specific approved messaging claims and demographic guidelines.'
    }
  ],
  retrievedRulesCount: 7,
  modelUsed: 'Local Deterministic Rule Engine (Offline Verified)',
  organizationId: 'org-innovexa-001',
  analyzedAt: new Date()
};

inMemory.submissions.push(initialSubmission);
inMemory.analysisResults.push(initialAnalysis);

// Socket.io broadcaster reference
let socketBroadcaster = null;
const setSocketBroadcaster = (io) => {
  socketBroadcaster = io;
};

// Seed Real MongoDB if connected and empty
const seedDatabaseIfEmpty = async () => {
  try {
    const { isConnected } = getDBStatus();
    if (!isConnected) return;

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[BrandGuard Seed] Populating initial demo users into MongoDB...');
      await User.insertMany(inMemory.users.map(u => ({ ...u, _id: undefined })));
    }

    const guidelineCount = await BrandGuideline.countDocuments();
    if (guidelineCount === 0) {
      console.log('[BrandGuard Seed] Populating initial brand guideline manual into MongoDB...');
      await BrandGuideline.insertMany(inMemory.guidelines.map(g => ({ ...g, _id: undefined })));
    }

    const ruleCount = await BrandRule.countDocuments();
    if (ruleCount === 0) {
      console.log('[BrandGuard Seed] Populating 7 approved brand rules into MongoDB...');
      await BrandRule.insertMany(inMemory.rules.map(r => ({ ...r, _id: undefined })));
    }

    const subCount = await ContentSubmission.countDocuments();
    if (subCount === 0) {
      console.log('[BrandGuard Seed] Populating initial demo submission and findings into MongoDB...');
      await ContentSubmission.create({ ...initialSubmission, _id: undefined });
      await AnalysisResult.create({ ...initialAnalysis, _id: undefined });
    }

    const auditCount = await AuditLog.countDocuments();
    if (auditCount === 0) {
      await AuditLog.insertMany(inMemory.auditLogs.map(l => ({ ...l, _id: undefined })));
    }

    console.log('[BrandGuard Seed] MongoDB seed synchronization complete!');
  } catch (err) {
    console.warn('[BrandGuard Seed Error]:', err.message);
  }
};

// Unified Repository Manager
const Store = {
  seedDatabaseIfEmpty,
  // DB status
  getStatus: () => getDBStatus(),

  // Users
  users: {
    find: async (query = {}) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await User.find(query);
      return inMemory.users.filter(u => {
        for (let k in query) {
          if (u[k] !== query[k]) return false;
        }
        return true;
      });
    },
    findOne: async (query) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await User.findOne(query);
      return inMemory.users.find(u => {
        for (let k in query) {
          if (u[k] !== query[k]) return false;
        }
        return true;
      }) || null;
    },
    findById: async (id) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await User.findById(id);
      return inMemory.users.find(u => u._id === id || u.id === id) || null;
    },
    create: async (data) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await User.create(data);
      const newUser = {
        _id: `usr-${crypto.randomBytes(4).toString('hex')}`,
        id: `usr-${crypto.randomBytes(4).toString('hex')}`,
        ...data,
        createdAt: new Date()
      };
      inMemory.users.push(newUser);
      return newUser;
    }
  },

  // Guidelines
  guidelines: {
    find: async (query = {}) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await BrandGuideline.find(query).sort({ createdAt: -1 });
      return [...inMemory.guidelines].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    findById: async (id) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await BrandGuideline.findById(id);
      return inMemory.guidelines.find(g => g._id === id || g.id === id) || null;
    },
    create: async (data) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await BrandGuideline.create(data);
      const newG = {
        _id: `gl-${crypto.randomBytes(4).toString('hex')}`,
        id: `gl-${crypto.randomBytes(4).toString('hex')}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemory.guidelines.unshift(newG);
      return newG;
    },
    delete: async (id) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await BrandGuideline.findByIdAndDelete(id);
      inMemory.guidelines = inMemory.guidelines.filter(g => g._id !== id && g.id !== id);
      return true;
    }
  },

  // Rules
  rules: {
    find: async (query = {}) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await BrandRule.find(query).sort({ ruleId: 1 });
      return inMemory.rules.filter(r => {
        for (let k in query) {
          if (r[k] !== query[k]) return false;
        }
        return true;
      });
    },
    findById: async (id) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await BrandRule.findById(id);
      return inMemory.rules.find(r => r._id === id || r.id === id || r.ruleId === id) || null;
    },
    create: async (data) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await BrandRule.create(data);
      const newRule = {
        _id: `rule-${crypto.randomBytes(4).toString('hex')}`,
        id: `rule-${crypto.randomBytes(4).toString('hex')}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemory.rules.push(newRule);
      return newRule;
    },
    insertMany: async (rulesArr) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await BrandRule.insertMany(rulesArr);
      const inserted = rulesArr.map(r => ({
        _id: `rule-${crypto.randomBytes(4).toString('hex')}`,
        id: `rule-${crypto.randomBytes(4).toString('hex')}`,
        ...r,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      inMemory.rules.push(...inserted);
      return inserted;
    },
    updateOne: async (id, data) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await BrandRule.findByIdAndUpdate(id, data, { new: true });
      const idx = inMemory.rules.findIndex(r => r._id === id || r.id === id || r.ruleId === id);
      if (idx !== -1) {
        inMemory.rules[idx] = { ...inMemory.rules[idx], ...data, updatedAt: new Date() };
        return inMemory.rules[idx];
      }
      return null;
    },
    delete: async (id) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await BrandRule.findByIdAndDelete(id);
      inMemory.rules = inMemory.rules.filter(r => r._id !== id && r.id !== id && r.ruleId !== id);
      return true;
    }
  },

  // Submissions
  submissions: {
    find: async (query = {}) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await ContentSubmission.find(query).sort({ updatedAt: -1 });
      return [...inMemory.submissions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    },
    findById: async (id) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await ContentSubmission.findById(id);
      return inMemory.submissions.find(s => s._id === id || s.id === id) || null;
    },
    create: async (data) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await ContentSubmission.create(data);
      const newSub = {
        _id: `sub-${crypto.randomBytes(4).toString('hex')}`,
        id: `sub-${crypto.randomBytes(4).toString('hex')}`,
        version: 1,
        revisions: [
          {
            version: 1,
            content: data.originalContent,
            updatedBy: data.submittedBy.userId,
            timestamp: new Date(),
            changeNote: 'Initial submission'
          }
        ],
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemory.submissions.unshift(newSub);
      return newSub;
    },
    updateOne: async (id, data) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await ContentSubmission.findByIdAndUpdate(id, data, { new: true });
      const idx = inMemory.submissions.findIndex(s => s._id === id || s.id === id);
      if (idx !== -1) {
        inMemory.submissions[idx] = { ...inMemory.submissions[idx], ...data, updatedAt: new Date() };
        return inMemory.submissions[idx];
      }
      return null;
    }
  },

  // Analysis Results
  analysis: {
    findBySubmissionId: async (subId) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await AnalysisResult.findOne({ submissionId: subId }).sort({ analyzedAt: -1 });
      return inMemory.analysisResults.find(a => a.submissionId === subId) || null;
    },
    create: async (data) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await AnalysisResult.create(data);
      const newAnalysis = {
        _id: `res-${crypto.randomBytes(4).toString('hex')}`,
        id: `res-${crypto.randomBytes(4).toString('hex')}`,
        ...data,
        analyzedAt: new Date()
      };
      // Replace existing for this submission or append
      const idx = inMemory.analysisResults.findIndex(a => a.submissionId === data.submissionId);
      if (idx !== -1) {
        inMemory.analysisResults[idx] = newAnalysis;
      } else {
        inMemory.analysisResults.unshift(newAnalysis);
      }
      return newAnalysis;
    },
    updateFindingStatus: async (subId, findingId, status, ignoreReason = null) => {
      const { isConnected } = getDBStatus();
      if (isConnected) {
        return await AnalysisResult.findOneAndUpdate(
          { submissionId: subId, 'findings.findingId': findingId },
          {
            $set: {
              'findings.$.status': status,
              'findings.$.ignoreReason': ignoreReason
            }
          },
          { new: true }
        );
      }
      const res = inMemory.analysisResults.find(a => a.submissionId === subId);
      if (res && res.findings) {
        const f = res.findings.find(item => item.findingId === findingId);
        if (f) {
          f.status = status;
          if (ignoreReason) f.ignoreReason = ignoreReason;
          return res;
        }
      }
      return null;
    }
  },

  // Review Comments
  comments: {
    findBySubmissionId: async (subId) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await ReviewComment.find({ submissionId: subId }).sort({ createdAt: 1 });
      return inMemory.comments.filter(c => c.submissionId === subId);
    },
    create: async (data) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await ReviewComment.create(data);
      const newC = {
        _id: `comm-${crypto.randomBytes(4).toString('hex')}`,
        id: `comm-${crypto.randomBytes(4).toString('hex')}`,
        ...data,
        createdAt: new Date()
      };
      inMemory.comments.push(newC);
      return newC;
    }
  },

  // Approvals
  approvals: {
    findBySubmissionId: async (subId) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await Approval.find({ submissionId: subId }).sort({ timestamp: -1 });
      return inMemory.approvals.filter(a => a.submissionId === subId);
    },
    create: async (data) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await Approval.create(data);
      const newApp = {
        _id: `appr-${crypto.randomBytes(4).toString('hex')}`,
        id: `appr-${crypto.randomBytes(4).toString('hex')}`,
        ...data,
        timestamp: new Date()
      };
      inMemory.approvals.unshift(newApp);
      return newApp;
    }
  },

  // Audit Logs
  audit: {
    find: async (query = {}, limit = 50) => {
      const { isConnected } = getDBStatus();
      if (isConnected) return await AuditLog.find(query).sort({ timestamp: -1 }).limit(limit);
      return [...inMemory.auditLogs]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    },
    log: async (action, entityType, entityId, performedBy, details = {}) => {
      const logEntry = {
        action,
        entityType,
        entityId,
        performedBy,
        details,
        organizationId: performedBy.organizationId || 'org-innovexa-001',
        timestamp: new Date()
      };

      const { isConnected } = getDBStatus();
      let created;
      if (isConnected) {
        created = await AuditLog.create(logEntry);
      } else {
        created = {
          _id: `log-${crypto.randomBytes(4).toString('hex')}`,
          ...logEntry
        };
        inMemory.auditLogs.unshift(created);
      }

      // Real-time broadcast through Socket.IO
      if (socketBroadcaster) {
        socketBroadcaster.emit('audit:new', created);
        socketBroadcaster.emit('workflow:update', { action, entityType, entityId, performedBy });
      }
      return created;
    }
  },

  setSocketBroadcaster
};

module.exports = Store;
