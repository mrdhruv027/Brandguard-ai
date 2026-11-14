import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  Edit3,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';

export default function AnalysisResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rerunning, setRerunning] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Manual Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  // Ignore Modal State
  const [ignoringFinding, setIgnoringFinding] = useState(null);
  const [ignoreReason, setIgnoreReason] = useState('');

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/submissions/${id}`);
      if (res.data.success) {
        setSubmission(res.data.submission);
        setAnalysis(res.data.analysis);
        setEditedText(res.data.submission.currentContent);
      }
    } catch (err) {
      console.error('[Fetch Results Error]:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [id]);

  // 1. Accept Suggestion
  const handleApplySuggestion = async (finding) => {
    try {
      setError('');
      const res = await api.post(`/submissions/${id}/apply-suggestion`, {
        findingId: finding.findingId,
        flaggedText: finding.flaggedText,
        suggestedCorrection: finding.suggestedCorrection
      });

      if (res.data.success) {
        setSubmission(res.data.submission);
        setAnalysis(res.data.analysis);
        setEditedText(res.data.submission.currentContent);
        setSuccessMsg(`Applied correction: "${finding.suggestedCorrection}"`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // 2. Ignore Finding
  const handleConfirmIgnore = async () => {
    if (!ignoreReason.trim()) {
      alert('Please provide a reason for ignoring this finding.');
      return;
    }
    try {
      const res = await api.post(`/submissions/${id}/ignore-finding`, {
        findingId: ignoringFinding.findingId,
        reason: ignoreReason
      });
      if (res.data.success) {
        setAnalysis(res.data.analysis);
        setIgnoringFinding(null);
        setIgnoreReason('');
        setSuccessMsg('Finding ignored.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // 3. Save Manual Revision
  const handleSaveManualRevision = async () => {
    try {
      const res = await api.post(`/submissions/${id}/revise`, {
        content: editedText,
        changeNote: 'Creator manual editorial revision'
      });
      if (res.data.success) {
        setSubmission(res.data.submission);
        setIsEditing(false);
        setSuccessMsg('Content revised. Rerun analysis to re-check compliance.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // 4. Rerun AI Analysis
  const handleRerunAnalysis = async () => {
    try {
      setRerunning(true);
      setError('');
      const res = await api.post(`/submissions/${id}/analyze`);
      if (res.data.success) {
        setSubmission(res.data.submission);
        setAnalysis(res.data.analysis);
        setSuccessMsg('AI Brand Analysis completed.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setRerunning(false);
    }
  };

  // 5. Submit for Review
  const handleSubmitForReview = async () => {
    try {
      const res = await api.post(`/submissions/${id}/submit-for-review`);
      if (res.data.success) {
        setSubmission(res.data.submission);
        setSuccessMsg('Submitted for Brand Manager review!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="h-8 w-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-600">Retrieving Grounded AI Findings...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        Submission not found.
      </div>
    );
  }

  const score = analysis?.complianceScore ?? submission.complianceScore ?? 100;
  const findings = analysis?.findings || [];
  const openFindings = findings.filter(f => f.status === 'open');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-bold">&times;</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-700 font-bold">&times;</button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
              {submission.title}
            </h1>
            <StatusBadge status={submission.status} size="lg" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>{submission.contentType}</span>
            <span>·</span>
            <span>Version {submission.version || 1}</span>
            <span>·</span>
            <span>Submitted by {submission.submittedBy?.userName}</span>
            <span>·</span>
            <span>Engine: {analysis?.modelUsed || 'Grounded RAG Engine'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRerunAnalysis}
            disabled={rerunning}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${rerunning ? 'animate-spin' : ''}`} />
            <span>{rerunning ? 'Re-analyzing...' : 'Rerun AI Check'}</span>
          </button>

          {['Draft', 'Issues Found', 'Revised'].includes(submission.status) && (
            <button
              onClick={handleSubmitForReview}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Send className="h-3.5 w-3.5 text-orange-400" />
              <span>Submit for Brand Review</span>
            </button>
          )}

          {['Under Review', 'Approved', 'Changes Requested'].includes(submission.status) && (
            <Link
              to={`/app/approval/${submission._id || submission.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-700 transition-colors shadow-xs"
            >
              <span>Open Review Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Compliance Overview Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Score Meter */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-black border-4 ${
              score >= 80 ? 'border-emerald-500 text-emerald-600 bg-emerald-50' :
              score >= 50 ? 'border-amber-500 text-amber-600 bg-amber-50' :
              'border-rose-500 text-rose-600 bg-rose-50'
            }`}>
              {score}%
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Compliance Score
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {score >= 80 ? 'Compliant' : score >= 50 ? 'Moderate Drift' : 'High Risk'}
            </div>
            <div className="text-[11px] text-slate-400">
              {analysis?.retrievedRulesCount || 7} rules evaluated
            </div>
          </div>
        </div>

        {/* High Severity */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="text-xs font-semibold text-rose-800 uppercase tracking-wider flex items-center justify-between">
            <span>High Severity</span>
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          </div>
          <div className="text-2xl font-extrabold text-rose-700 mt-2">
            {analysis?.severityBreakdown?.High ?? 0}
          </div>
          <p className="text-[11px] text-rose-600 mt-1">Prohibited claims / unapproved facts</p>
        </div>

        {/* Medium Severity */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>Medium Severity</span>
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2">
            {analysis?.severityBreakdown?.Medium ?? 0}
          </div>
          <p className="text-[11px] text-amber-600 mt-1">Terminology & brand voice drift</p>
        </div>

        {/* Low Severity */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="text-xs font-semibold text-blue-800 uppercase tracking-wider flex items-center justify-between">
            <span>Low Severity</span>
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="text-2xl font-extrabold text-blue-700 mt-2">
            {analysis?.severityBreakdown?.Low ?? 0}
          </div>
          <p className="text-[11px] text-blue-600 mt-1">Formatting & stylistic notes</p>
        </div>
      </div>

      {/* Content Preview with In-Place Highlight or Edit Mode */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Content Copy (Version {submission.version})
            </span>
            <span className="text-[11px] text-slate-400">
              {submission.currentContent.length} characters
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveManualRevision}
                  className="px-3 py-1 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-2xs"
                >
                  Save Revision
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <Edit3 className="h-3 w-3 text-slate-500" />
                <span>Edit Manually</span>
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <textarea
            rows={5}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full rounded-xl border border-orange-300 p-3 text-sm font-sans focus:outline-hidden leading-relaxed bg-orange-50/10"
          />
        ) : (
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-800">
            {submission.currentContent}
          </div>
        )}
      </div>

      {/* Findings Breakdown Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>AI Brand Findings & Grounded Citations</span>
            <span className="text-xs font-normal text-slate-500">
              ({openFindings.length} open, {findings.filter(f => f.status === 'accepted').length} accepted)
            </span>
          </h2>
        </div>

        {findings.length === 0 ? (
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 text-center text-emerald-900">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <div className="font-bold text-base">All Guidelines Compliant!</div>
            <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
              No brand violations or prohibited claims were detected. This copy meets all approved corporate standards.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {findings.map((f, idx) => {
              const isHigh = f.severity === 'High';
              const isMed = f.severity === 'Medium';
              const isAccepted = f.status === 'accepted';
              const isIgnored = f.status === 'ignored';

              return (
                <div
                  key={f.findingId || idx}
                  className={`rounded-2xl border transition-all p-5 bg-white shadow-xs ${
                    isAccepted ? 'border-emerald-200 bg-emerald-50/20 opacity-75' :
                    isIgnored ? 'border-slate-200 bg-slate-50/50 opacity-60' :
                    isHigh ? 'border-rose-200 hover:border-rose-300' :
                    isMed ? 'border-amber-200 hover:border-amber-300' :
                    'border-blue-200 hover:border-blue-300'
                  }`}
                >
                  {/* Finding Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        isHigh ? 'bg-rose-100 text-rose-800 border-rose-200' :
                        isMed ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {f.severity} Severity
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {f.category}
                      </span>
                      <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {f.findingId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAccepted && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Accepted & Applied
                        </span>
                      )}
                      {isIgnored && (
                        <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md">
                          Ignored: {f.ignoreReason}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        Confidence: {Math.round(f.confidenceScore * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Flagged Passage & Explanation */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Flagged Passage
                      </div>
                      <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/60 font-mono text-xs text-rose-900 font-semibold">
                        "{f.flaggedText}"
                      </div>
                      <p className="mt-2 text-xs text-slate-700 leading-relaxed">
                        {f.explanation}
                      </p>
                    </div>

                    {/* Exact Citation Box */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                        <span className="text-orange-950 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="h-3.5 w-3.5 text-orange-600" />
                          Approved Rule: {f.ruleId}
                        </span>
                        <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 font-semibold">
                          Verified Citation
                        </span>
                      </div>
                      <blockquote className="italic text-slate-600 border-l-2 border-orange-400 pl-2 py-0.5 text-[11px] leading-relaxed">
                        "{f.supportingQuotation}"
                      </blockquote>
                    </div>
                  </div>

                  {/* Suggested Correction & Action Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-700">Suggested Fix:</span>
                      <span className="font-mono font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        "{f.suggestedCorrection}"
                      </span>
                    </div>

                    {/* Action Buttons */}
                    {!isAccepted && !isIgnored && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApplySuggestion(f)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Accept & Apply</span>
                        </button>

                        <button
                          onClick={() => setIgnoringFinding(f)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors"
                        >
                          <XCircle className="h-3.5 w-3.5 text-slate-400" />
                          <span>Ignore</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ignore Reason Modal */}
      {ignoringFinding && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Ignore Finding ({ignoringFinding.findingId})
            </h3>
            <p className="text-xs text-slate-600">
              Please state why this finding is exempt or not applicable for this piece of content. This will be recorded in the audit trail.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Approved exception by VP of Marketing; specific legacy customer context."
              value={ignoreReason}
              onChange={(e) => setIgnoreReason(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-hidden focus:border-orange-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIgnoringFinding(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmIgnore}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0F172A] hover:bg-slate-800 rounded-lg"
              >
                Confirm Ignore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
