const fs = require('fs');
const path = require('path');

// Test end-to-end against the Express app directly using supertest-like or native http
const http = require('http');

async function runEndToEndTests() {
  console.log('====================================================');
  console.log('  🧪 RUNNING BRANDGUARD AI END-TO-END TEST SUITE');
  console.log('====================================================');

  const { app, server } = require('./src/index');
  const Store = require('./src/models/store');

  const TEST_PORT = process.env.PORT || 5000;
  console.log(`[Test Harness] Testing server on port ${TEST_PORT}`);
  // Give server brief moment to initialize
  await new Promise(r => setTimeout(r, 800));

  const baseUrl = `http://127.0.0.1:${TEST_PORT}/api`;

  try {
    // 1. Health Check
    console.log('\n--> Step 1: Health Check Endpoint');
    const healthRes = await fetch(`${baseUrl}/health`).then(r => r.json());
    console.log('Health status:', healthRes.status, '| DB:', healthRes.database);
    if (healthRes.status !== 'online') throw new Error('Health check failed');

    // 2. Demo Users
    console.log('\n--> Step 2: Retrieve Demo Users');
    const usersRes = await fetch(`${baseUrl}/auth/demo-users`).then(r => r.json());
    console.log(`Retrieved ${usersRes.users.length} demo users:`);
    usersRes.users.forEach(u => console.log(`  - ${u.name} (${u.role}): ${u.email}`));
    if (usersRes.users.length < 3) throw new Error('Missing demo users');

    const creator = usersRes.users.find(u => u.role === 'creator');
    const manager = usersRes.users.find(u => u.role === 'brand_manager');

    // 3. Guideline Ingestion
    console.log('\n--> Step 3: Ingest Approved Brand Guidelines');
    const guidelineText = `
SECTION 1: BRAND TONE & VOICE
1. Rule 1: Brand voice must remain confident, empathetic, and professional. Avoid aggressive sales slang like 'dirt cheap', 'kill the competition', or 'crappy'.

SECTION 2: TERMINOLOGY & PRODUCT NAMING
2. Rule 2: Always spell the product name as 'BrandGuard AI' with uppercase B, G, and AI. Never spell it as 'brandguard' or 'Brandguard'.

SECTION 3: PROHIBITED CLAIMS & LEGAL COMPLIANCE
3. Rule 3: Never claim '100% bug-free' or make absolute guarantees such as 'zero risk guarantee'. All performance claims must be qualified.

SECTION 4: APPROVED FACTS & INSTITUTIONAL METRICS
4. Rule 4: Approved institutional metric: BrandGuard AI is trusted by over 450+ enterprise compliance teams worldwide. Do not fabricate unverified customer figures.
`;

    const uploadRes = await fetch(`${baseUrl}/guidelines/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-role': 'compliance_admin'
      },
      body: JSON.stringify({
        title: 'Innovexa Brand Guidelines 2026',
        rawContent: guidelineText
      })
    }).then(r => r.json());

    console.log(`Guideline ingested: ${uploadRes.guideline.title}, Extracted Rules: ${uploadRes.rulesCount}`);
    if (!uploadRes.success || uploadRes.rulesCount < 4) throw new Error('Guideline ingestion failed');

    // 4. Verify Rules Endpoint
    console.log('\n--> Step 4: Verify Rules Listing');
    const rulesRes = await fetch(`${baseUrl}/rules`).then(r => r.json());
    console.log(`Total rules in system: ${rulesRes.count}`);
    if (rulesRes.count < 4) throw new Error('Rules count mismatch');

    // 5. Submit Off-Brand Content
    console.log('\n--> Step 5: Submit Off-Brand Social Media Post');
    const subRes = await fetch(`${baseUrl}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-role': 'creator'
      },
      body: JSON.stringify({
        title: 'Q1 Product Launch Tweet',
        contentType: 'Social Media Post',
        content: 'Check out brandguard! Our software is 100% bug-free and dirt cheap. Over 9,000 teams trust us already!!'
      })
    }).then(r => r.json());

    const submissionId = subRes.submission._id || subRes.submission.id;
    console.log(`Content submitted: ${subRes.submission.title} (ID: ${submissionId})`);
    if (!subRes.success) throw new Error('Submission failed');

    // 6. Run AI Brand Analysis
    console.log('\n--> Step 6: Trigger Grounded AI Brand Check');
    const analysisRes = await fetch(`${baseUrl}/submissions/${submissionId}/analyze`, {
      method: 'POST',
      headers: { 'x-demo-role': 'creator' }
    }).then(r => r.json());

    console.log(`Analysis Status: ${analysisRes.analysis.status}, Compliance Score: ${analysisRes.analysis.complianceScore}%`);
    console.log(`Issues Detected: ${analysisRes.analysis.totalIssues}, Model: ${analysisRes.analysis.modelUsed}`);
    analysisRes.analysis.findings.forEach(f => {
      console.log(`  - [${f.severity}] Flagged: "${f.flaggedText}" -> Rule: ${f.ruleId} (${f.category})`);
      console.log(`    Quotation: "${f.supportingQuotation.substring(0, 60)}..."`);
      console.log(`    Suggested Fix: "${f.suggestedCorrection}"`);
    });

    if (analysisRes.analysis.totalIssues === 0) throw new Error('Failed to catch genuine violations');
    if (analysisRes.analysis.complianceScore > 70) throw new Error('Compliance score should be low for multiple violations');

    // 7. Apply Suggestion
    console.log('\n--> Step 7: Apply Suggested Correction');
    const targetFinding = analysisRes.analysis.findings[0];
    const applyRes = await fetch(`${baseUrl}/submissions/${submissionId}/apply-suggestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-role': 'creator'
      },
      body: JSON.stringify({
        findingId: targetFinding.findingId,
        flaggedText: targetFinding.flaggedText,
        suggestedCorrection: targetFinding.suggestedCorrection
      })
    }).then(r => r.json());

    console.log(`Applied fix! New version: v${applyRes.submission.version}`);
    console.log(`Updated Content: "${applyRes.submission.currentContent}"`);
    if (applyRes.submission.version !== 2) throw new Error('Version increment failed');

    // 8. Submit for Human Review
    console.log('\n--> Step 8: Submit for Human Review');
    const reviewQueueRes = await fetch(`${baseUrl}/submissions/${submissionId}/submit-for-review`, {
      method: 'POST',
      headers: { 'x-demo-role': 'creator' }
    }).then(r => r.json());

    console.log(`Queue Status: ${reviewQueueRes.submission.status}`);
    if (reviewQueueRes.submission.status !== 'Under Review') throw new Error('Status should be Under Review');

    // 9. Unauthorized Approval Attempt (Creator attempts to approve)
    console.log('\n--> Step 9: Test Role Permission Enforcement (Creator attempts approval)');
    const unauthorizedRes = await fetch(`${baseUrl}/submissions/${submissionId}/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-role': 'creator'
      },
      body: JSON.stringify({
        decision: 'Approved',
        comments: 'I approve my own post!'
      })
    });

    console.log(`Unauthorized attempt response status: ${unauthorizedRes.status}`);
    if (unauthorizedRes.status !== 403) throw new Error('Creator should be forbidden from approving');
    console.log(' Access control correctly blocked unauthorized approval.');

    // 10. Authorized Reviewer (Brand Manager) Adds Comment and Approves
    console.log('\n--> Step 10: Authorized Brand Manager Decision');
    const commentRes = await fetch(`${baseUrl}/submissions/${submissionId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-role': 'brand_manager'
      },
      body: JSON.stringify({
        text: 'Terminology fix looks verified. Approved for marketing deployment.'
      })
    }).then(r => r.json());

    console.log(`Comment added: "${commentRes.comment.text}" by ${commentRes.comment.authorName}`);

    const decisionRes = await fetch(`${baseUrl}/submissions/${submissionId}/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-role': 'brand_manager'
      },
      body: JSON.stringify({
        decision: 'Approved',
        comments: 'Meets BrandGuard AI governance standards. Signed off.'
      })
    }).then(r => r.json());

    console.log(`Formal Decision Recorded: ${decisionRes.approval.decision} by ${decisionRes.approval.reviewerName}`);
    console.log(`Final Submission Status: ${decisionRes.submission.status}`);
    if (decisionRes.submission.status !== 'Approved') throw new Error('Final status should be Approved');

    // 11. Verify Audit History
    console.log('\n--> Step 11: Verify Complete Audit Trail');
    const auditRes = await fetch(`${baseUrl}/audit-logs?limit=20`).then(r => r.json());
    console.log(`Total Audit Log Entries: ${auditRes.count}`);
    const actions = auditRes.logs.map(l => l.action);
    console.log('Audited Actions:', actions.slice(0, 6));

    if (!actions.includes('guideline_uploaded')) throw new Error('Missing guideline_uploaded in audit log');
    if (!actions.includes('content_submitted')) throw new Error('Missing content_submitted in audit log');
    if (!actions.includes('ai_analysis_completed')) throw new Error('Missing ai_analysis_completed in audit log');
    if (!actions.includes('suggestion_applied')) throw new Error('Missing suggestion_applied in audit log');
    if (!actions.includes('content_approved')) throw new Error('Missing content_approved in audit log');

    console.log('\n====================================================');
    console.log('   ALL 11 END-TO-END INTEGRATION TESTS PASSED!');
    console.log('====================================================');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runEndToEndTests();
