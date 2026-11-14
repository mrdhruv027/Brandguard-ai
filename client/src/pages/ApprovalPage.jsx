import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DiffViewer from '../components/DiffViewer';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MessageSquare,
  ShieldCheck,
  Send,
  UserCheck,
  FileCheck2,
  Clock,
  ArrowLeft,
  Lock
} from 'lucide-react';

export default function ApprovalPage() {
  const { id } = useParams();
  const { user, switchRole } = useAuth();

  const [submission, setSubmission] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [comments, setComments] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Comment State
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Decision State
  const [decision, setDecision] = useState('Approved');
  const [decisionComments, setDecisionComments] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/submissions/${id}`);
      if (res.data.success) {
        setSubmission(res.data.submission);
        setAnalysis(res.data.analysis);
        setComments(res.data.comments || []);
        setApprovals(res.data.approvals || []);
      }
    } catch (err) {
      console.error('[Approval Portal Error]:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Submit review comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await api.post(`/submissions/${id}/comments`, {
        text: commentText
      });
      if (res.data.success) {
        setComments(prev => [...prev, res.data.comment]);
        setCommentText('');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Submit formal decision
  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    try {
      setSubmittingDecision(true);
      setError('');

      const res = await api.post(`/submissions/${id}/decision`, {
        decision,
        comments: decisionComments
      });

      if (res.data.success) {
        setSubmission(res.data.submission);
        setApprovals(prev => [res.data.approval, ...prev]);
        setSuccessMsg(`Decision successfully recorded: ${decision}`);
        setDecisionComments('');
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmittingDecision(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-2">Loading Review Portal...</p>
      </div>
    );
  }

  if (!submission) {
    return <div className="p-8 text-center text-slate-500">Submission not found.</div>;
  }

  const isReviewer = ['brand_manager', 'compliance_admin'].includes(user?.role);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/queue"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Review Queue</span>
        </Link>
        <Link
          to={`/app/analysis/${submission._id || submission.id}`}
          className="text-xs font-semibold text-orange-600 hover:text-orange-700"
        >
          View Full AI Analysis
        </Link>
      </div>

      {/* Success / Error Alerts */}
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

      {/* Main Review Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
              Review Portal: {submission.title}
            </h1>
            <StatusBadge status={submission.status} size="lg" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>{submission.contentType}</span>
            <span>·</span>
            <span>Created by {submission.submittedBy?.userName}</span>
            <span>·</span>
            <span>Current Version: v{submission.version || 1}</span>
            <span>·</span>
            <span>Compliance Score: {submission.complianceScore ?? 100}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Active Reviewer:</span>
          <span className="rounded-lg bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 text-xs border border-slate-200">
            {user?.name} ({user?.role?.replace('_', ' ')})
          </span>
        </div>
      </div>

      {/* Step 5 Requirement: Compare original vs revised content */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-orange-600" />
          <span>Content Diff: Original Draft vs Current Revised Copy</span>
        </h2>
        <DiffViewer
          originalText={submission.originalContent}
          currentText={submission.currentContent}
          originalLabel="Initial Submission (Original Draft)"
          currentLabel={`Current Revision (Version ${submission.version || 1})`}
        />
      </div>

      {/* Grounded Citations & Findings Summary */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900">
          AI Compliance Grounding Summary
        </h2>
        {analysis?.findings?.length === 0 ? (
          <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
             No violations detected. Content complies with all approved corporate guidelines.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis?.findings?.map((f, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{f.category}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    f.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {f.status === 'accepted' ? 'Applied' : 'Open Finding'}
                  </span>
                </div>
                <div className="font-mono text-slate-600">Rule: {f.ruleId}</div>
                <p className="text-slate-600 text-[11px]">{f.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Comments Thread */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-600" />
          <span>Reviewer Collaboration & Comments</span>
        </h2>

        {/* Existing Comments */}
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No comments added yet.</p>
          ) : (
            comments.map((c, i) => (
              <div key={c._id || i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="font-bold text-slate-800">
                    {c.authorName} <span className="font-normal text-[10px] text-slate-400">({c.authorRole})</span>
                  </span>
                  <span className="text-[10px]">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{c.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
          <input
            type="text"
            placeholder="Add reviewer feedback or compliance guidance..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:outline-hidden focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white px-4 py-2 text-xs font-semibold shadow-xs disabled:opacity-50"
          >
            Post Comment
          </button>
        </form>
      </div>

      {/* Manager Decision Sign-off Box (Role Enforced) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Formal Governance Sign-Off & Decision</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Only authorized Brand Managers and Compliance Admins have approval authority.
            </p>
          </div>

          {!isReviewer && (
            <button
              onClick={() => switchRole('brand_manager')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 underline"
            >
              Switch to Brand Manager Persona
            </button>
          )}
        </div>

        {!isReviewer ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
            <Lock className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <div className="font-semibold">Reviewer Authority Required</div>
              <div>
                You are currently signed in as <strong>{user?.name} (Creator)</strong>. To record an official approval or request changes, switch to <strong>Brand Manager</strong> or <strong>Compliance Admin</strong> via the top role selector.
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitDecision} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Governance Decision
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  decision === 'Approved'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="Approved"
                    checked={decision === 'Approved'}
                    onChange={() => setDecision('Approved')}
                    className="text-emerald-600"
                  />
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs">Approve for Publishing</span>
                </label>

                <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  decision === 'Changes Requested'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="Changes Requested"
                    checked={decision === 'Changes Requested'}
                    onChange={() => setDecision('Changes Requested')}
                    className="text-amber-600"
                  />
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs">Request Changes</span>
                </label>

                <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  decision === 'Rejected'
                    ? 'border-rose-500 bg-rose-50 text-rose-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="Rejected"
                    checked={decision === 'Rejected'}
                    onChange={() => setDecision('Rejected')}
                    className="text-rose-600"
                  />
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span className="text-xs">Reject Content</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Decision Notes & Review Comments
              </label>
              <textarea
                rows={3}
                placeholder="State your compliance reasoning and directions for the creator..."
                value={decisionComments}
                onChange={(e) => setDecisionComments(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-hidden focus:border-orange-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-400">
                Action will be permanently recorded in MongoDB audit history with your identity.
              </div>

              <button
                type="submit"
                disabled={submittingDecision}
                className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {submittingDecision ? 'Recording Decision...' : `Submit Decision: ${decision}`}
              </button>
            </div>
          </form>
        )}

        {/* Historical Decisions Recorded */}
        {approvals.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Recorded Review Decisions
            </h3>
            <div className="space-y-2">
              {approvals.map((appr, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{appr.decision}</span> by {appr.reviewerName} ({appr.reviewerRole})
                    {appr.comments && <p className="text-slate-600 text-[11px] mt-0.5 font-normal">"{appr.comments}"</p>}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(appr.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
