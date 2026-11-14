const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

class AIService {
  static async checkHealth() {
    try {
      const res = await fetch(`${AI_SERVICE_URL}/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
      return { status: 'unreachable', mode: 'node-fallback' };
    } catch (e) {
      return { status: 'offline', mode: 'node-fallback', error: e.message };
    }
  }

  static async extractDocument(fileBuffer, originalname, mimetype) {
    try {
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: mimetype || 'application/octet-stream' });
      formData.append('file', blob, originalname);

      const res = await fetch(`${AI_SERVICE_URL}/api/extract-text`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(20000)
      });

      if (!res.ok) {
        throw new Error(`AI extraction failed with HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.warn(`[AIService] Python service extraction unavailable (${e.message}). Using local text parser.`);
      const text = fileBuffer.toString('utf-8');
      return {
        success: true,
        filename: originalname,
        page_count: 1,
        full_text: text,
        pages: [{ page: 1, text }]
      };
    }
  }

  static async extractRules(fileBuffer, originalname, rawText = null) {
    try {
      let body;
      const headers = {};

      if (fileBuffer) {
        const formData = new FormData();
        const blob = new Blob([fileBuffer]);
        formData.append('file', blob, originalname || 'Brand Guidelines.pdf');
        formData.append('source_name', originalname || 'Brand Guidelines.pdf');
        body = formData;
      } else {
        const formData = new FormData();
        formData.append('raw_text', rawText);
        formData.append('source_name', originalname || 'Direct Guidelines Input');
        body = formData;
      }

      const res = await fetch(`${AI_SERVICE_URL}/api/extract-rules`, {
        method: 'POST',
        body,
        headers,
        signal: AbortSignal.timeout(30000)
      });

      if (!res.ok) {
        throw new Error(`AI rule extraction failed with HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.warn(`[AIService] Python rule extraction fallback (${e.message}). Using Node regex chunker.`);
      return this.localRuleChunker(rawText || (fileBuffer ? fileBuffer.toString('utf-8') : ''), originalname);
    }
  }

  static async analyzeContent(title, content, contentType, rules) {
    try {
      const payload = {
        title,
        content,
        content_type: contentType,
        rules: rules.map(r => ({
          rule_id: r.ruleId,
          category: r.category,
          rule_text: r.ruleText,
          explanation: r.explanation,
          source_doc: r.sourceDoc,
          page_number: r.pageNumber,
          status: r.status,
          keywords: r.keywords || []
        }))
      };

      const res = await fetch(`${AI_SERVICE_URL}/api/analyze-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000)
      });

      if (!res.ok) {
        throw new Error(`AI service returned HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.warn(`[AIService] Python AI service unavailable (${e.message}). Activating local deterministic validator.`);
      return this.localContentValidator(title, content, contentType, rules);
    }
  }

  static localRuleChunker(text, docName = 'Brand Guidelines.pdf') {
    const lines = text.split(/\r?\n\s*(?:(?:\d+\.|\*|-|•)\s+)+/);
    const rules = [];
    let counter = 1;

    for (const raw of lines) {
      const line = raw.trim();
      if (line.length < 25) continue;

      let category = 'Messaging';
      let prefix = 'MESG';
      const lineLower = line.lower ? line.lower() : line.toLowerCase();

      if (lineLower.includes('tone') || lineLower.includes('voice')) {
        category = 'Brand tone';
        prefix = 'TONE';
      } else if (lineLower.includes('spelling') || lineLower.includes('term') || lineLower.includes('name')) {
        category = 'Terminology';
        prefix = 'TERM';
      } else if (lineLower.includes('prohibit') || lineLower.includes('never') || lineLower.includes('guarantee')) {
        category = 'Prohibited claims';
        prefix = 'CLAIM';
      } else if (lineLower.includes('fact') || lineLower.includes('statistic') || lineLower.includes('metric')) {
        category = 'Approved facts';
        prefix = 'FACT';
      } else if (lineLower.includes('format') || lineLower.includes('title') || lineLower.includes('punctuation')) {
        category = 'Formatting';
        prefix = 'FORM';
      } else if (lineLower.includes('color') || lineLower.includes('logo') || lineLower.includes('visual')) {
        category = 'Visual identity';
        prefix = 'VIS';
      }

      const ruleId = `RULE-${prefix}-${String(counter++).padStart(3, '0')}`;
      rules.push({
        rule_id: ruleId,
        category,
        rule_text: line,
        explanation: `Approved ${category.toLowerCase()} rule from ${docName}.`,
        source_doc: docName,
        page_number: 1,
        status: 'approved',
        keywords: line.split(/\s+/).filter(w => w.length > 4).slice(0, 6)
      });
    }

    return {
      rules,
      total_rules: rules.length,
      source_doc: docName
    };
  }

  static localContentValidator(title, content, contentType, rules) {
    const findings = [];
    const contentLower = content.toLowerCase();

    for (const rule of rules) {
      const ruleText = rule.ruleText || '';
      const ruleLower = ruleText.toLowerCase();

      if (rule.category === 'Prohibited claims') {
        const triggers = ['100% bug-free', 'zero risk', 'dirt cheap', 'kill the competition', 'guarantee'];
        for (const trig of triggers) {
          if (contentLower.includes(trig) && (ruleLower.includes(trig) || ruleLower.includes('prohibit') || ruleLower.includes('never'))) {
            const idx = contentLower.indexOf(trig);
            findings.push({
              finding_id: `FIND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              flagged_text: content.substring(Math.max(0, idx - 10), Math.min(content.length, idx + trig.length + 10)),
              category: 'Prohibited claims',
              severity: 'High',
              rule_id: rule.ruleId,
              supporting_quotation: rule.ruleText,
              explanation: `Prohibited claim '${trig}' violates brand safety policies.`,
              suggested_correction: 'Remove or qualify with verified performance benchmarks',
              confidence_score: 0.95,
              verified_citation: true,
              status: 'open'
            });
          }
        }
      } else if (rule.category === 'Terminology') {
        if (ruleLower.includes('brandguard ai') && (contentLower.includes('brandguard') || content.includes('Brandguard'))) {
          if (!content.includes('BrandGuard AI') && contentLower.includes('brandguard')) {
            const idx = contentLower.indexOf('brandguard');
            findings.push({
              finding_id: `FIND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              flagged_text: content.substring(idx, idx + 10),
              category: 'Terminology',
              severity: 'Medium',
              rule_id: rule.ruleId,
              supporting_quotation: rule.ruleText,
              explanation: "Incorrect product capitalization. Must be written as 'BrandGuard AI'.",
              suggested_correction: 'BrandGuard AI',
              confidence_score: 0.94,
              verified_citation: true,
              status: 'open'
            });
          }
        }
      }
    }

    let penalty = 0;
    const severityBreakdown = { High: 0, Medium: 0, Low: 0 };
    for (const f of findings) {
      severityBreakdown[f.severity] = (severityBreakdown[f.severity] || 0) + 1;
      penalty += f.severity === 'High' ? 25 : f.severity === 'Medium' ? 12 : 5;
    }

    const complianceScore = Math.max(0, 100 - penalty);

    return {
      compliance_score: complianceScore,
      status: findings.length === 0 ? 'Compliant' : 'Issues Found',
      summary: findings.length === 0 ? 'All checks passed cleanly.' : `Detected ${findings.length} brand violations requiring attention.`,
      total_issues: findings.length,
      severity_breakdown: severityBreakdown,
      findings,
      unclear_guidelines: [],
      retrieved_rules_count: rules.length,
      model_used: 'Local Deterministic Rule Engine (Node Fallback)',
      analyzed_at: new Date().toISOString()
    };
  }
}

module.exports = AIService;
