const Store = require('../models/store');
const AIService = require('../services/aiService');

// Upload and ingest guidelines (PDF, DOCX, TXT)
const uploadGuideline = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!file && !req.body.rawContent) {
      return res.status(400).json({ success: false, message: 'Please upload a file (.pdf, .docx, .txt) or provide guideline text.' });
    }

    const docName = file ? file.originalname : (title || 'Brand Guidelines.txt');
    const ext = file ? file.originalname.split('.').pop().toLowerCase() : 'txt';

    // 1. Extract rules via Python AI / fallback parser
    let extraction;
    if (file) {
      extraction = await AIService.extractRules(file.buffer, file.originalname);
    } else {
      extraction = await AIService.extractRules(null, docName, req.body.rawContent);
    }

    const extractedRules = extraction.rules || [];

    // 2. Save Guideline document
    const guideline = await Store.guidelines.create({
      title: title || docName.replace(/\.[^/.]+$/, ''),
      description: description || `Ingested brand guidelines from ${docName}`,
      sourceDoc: docName,
      originalFileName: docName,
      fileType: ['pdf', 'docx', 'txt'].includes(ext) ? ext : 'txt',
      extractedRulesCount: extractedRules.length,
      uploadedBy: {
        userId: req.user._id || req.user.id,
        userName: req.user.name,
        userRole: req.user.role
      },
      status: 'active'
    });

    // 3. Store individual rules into DB with unique IDs
    const existingRules = await Store.rules.find();
    const existingIds = new Set(existingRules.map(r => r.ruleId));

    const rulesToInsert = extractedRules.map((r, i) => {
      let ruleId = r.rule_id;
      if (!ruleId || existingIds.has(ruleId)) {
        const catPrefixes = {
          'Brand tone': 'TONE',
          'Terminology': 'TERM',
          'Messaging': 'MESG',
          'Approved facts': 'FACT',
          'Prohibited claims': 'CLAIM',
          'Formatting': 'FORM',
          'Visual identity': 'VIS'
        };
        const prefix = catPrefixes[r.category] || 'RULE';
        ruleId = `RULE-${prefix}-${String(existingIds.size + 1 + i).padStart(3, '0')}`;
      }
      existingIds.add(ruleId);

      return {
        ruleId,
        category: r.category || 'Messaging',
        ruleText: r.rule_text,
        explanation: r.explanation || `Approved rule extracted from ${docName}`,
        sourceDoc: docName,
        pageNumber: r.page_number || 1,
        guidelineId: guideline._id || guideline.id,
        organizationId: req.user.organizationId || 'org-innovexa-001',
        status: 'approved',
        keywords: r.keywords || [],
        createdBy: req.user.name
      };
    });

    const savedRules = await Store.rules.insertMany(rulesToInsert);

    // 4. Record in Audit Log
    await Store.audit.log(
      'guideline_uploaded',
      'guideline',
      guideline._id || guideline.id,
      {
        userId: req.user._id || req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        organizationId: req.user.organizationId
      },
      {
        title: guideline.title,
        sourceDoc: docName,
        rulesExtracted: savedRules.length
      }
    );

    return res.status(201).json({
      success: true,
      guideline,
      rulesCount: savedRules.length,
      rules: savedRules
    });
  } catch (error) {
    console.error('[Guideline Upload Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// List guidelines
const getGuidelines = async (req, res) => {
  try {
    const list = await Store.guidelines.find();
    return res.json({ success: true, guidelines: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// List all rules (with category and keyword filters)
const getRules = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let rules = await Store.rules.find();

    if (category && category !== 'All') {
      rules = rules.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }

    if (status && status !== 'All') {
      rules = rules.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      rules = rules.filter(r =>
        r.ruleId.toLowerCase().includes(q) ||
        r.ruleText.toLowerCase().includes(q) ||
        (r.explanation && r.explanation.toLowerCase().includes(q)) ||
        (r.keywords && r.keywords.some(k => k.toLowerCase().includes(q)))
      );
    }

    return res.json({ success: true, count: rules.length, rules });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new rule manually
const createRule = async (req, res) => {
  try {
    const { category, ruleText, explanation, sourceDoc, pageNumber } = req.body;
    if (!category || !ruleText) {
      return res.status(400).json({ success: false, message: 'Category and Rule Text are required' });
    }

    const count = (await Store.rules.find({ category })).length + 1;
    const catPrefixes = {
      'Brand tone': 'TONE',
      'Terminology': 'TERM',
      'Messaging': 'MESG',
      'Approved facts': 'FACT',
      'Prohibited claims': 'CLAIM',
      'Formatting': 'FORM',
      'Visual identity': 'VIS'
    };
    const prefix = catPrefixes[category] || 'RULE';
    const ruleId = `RULE-${prefix}-${String(count).padStart(3, '0')}`;

    const newRule = await Store.rules.create({
      ruleId,
      category,
      ruleText,
      explanation: explanation || `Created manually by ${req.user.name}`,
      sourceDoc: sourceDoc || 'Brand Manual',
      pageNumber: Number(pageNumber) || 1,
      status: 'approved',
      createdBy: req.user.name,
      organizationId: req.user.organizationId || 'org-innovexa-001'
    });

    await Store.audit.log(
      'rule_created',
      'rule',
      newRule.ruleId,
      {
        userId: req.user._id || req.user.id,
        userName: req.user.name,
        userRole: req.user.role
      },
      { ruleId, category, ruleText }
    );

    return res.status(201).json({ success: true, rule: newRule });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update an existing rule
const updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { ruleText, explanation, category, status } = req.body;

    const existing = await Store.rules.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    const updated = await Store.rules.updateOne(id, {
      ruleText: ruleText || existing.ruleText,
      explanation: explanation || existing.explanation,
      category: category || existing.category,
      status: status || existing.status
    });

    await Store.audit.log(
      'rule_updated',
      'rule',
      existing.ruleId,
      {
        userId: req.user._id || req.user.id,
        userName: req.user.name,
        userRole: req.user.role
      },
      { ruleId: existing.ruleId, changes: req.body }
    );

    return res.json({ success: true, rule: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a rule
const deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await Store.rules.findById(id);
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    await Store.rules.delete(id);

    await Store.audit.log(
      'rule_deleted',
      'rule',
      rule.ruleId,
      {
        userId: req.user._id || req.user.id,
        userName: req.user.name,
        userRole: req.user.role
      },
      { ruleId: rule.ruleId }
    );

    return res.json({ success: true, message: `Rule ${rule.ruleId} removed.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadGuideline,
  getGuidelines,
  getRules,
  createRule,
  updateRule,
  deleteRule
};
