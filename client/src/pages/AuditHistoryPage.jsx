import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  History,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  User,
  ArrowRight,
  Sparkles,
  Search
} from 'lucide-react';

export default function AuditHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('All');
  const [entityFilter, setEntityFilter] = useState('All');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs?limit=100');
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error('[Audit Log Fetch Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionColors = {
    'guideline_uploaded': 'bg-blue-50 text-blue-700 border-blue-200',
    'rule_created': 'bg-purple-50 text-purple-700 border-purple-200',
    'rule_updated': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'rule_deleted': 'bg-rose-50 text-rose-700 border-rose-200',
    'content_submitted': 'bg-slate-100 text-slate-800 border-slate-300',
    'ai_analysis_completed': 'bg-amber-50 text-amber-800 border-amber-200',
    'suggestion_applied': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'finding_ignored': 'bg-slate-100 text-slate-600 border-slate-200',
    'content_revised': 'bg-purple-50 text-purple-700 border-purple-200',
    'review_submitted': 'bg-blue-50 text-blue-700 border-blue-200',
    'comment_added': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'content_approved': 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    'changes_requested': 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
    'content_rejected': 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
  };

  const filteredLogs = logs.filter((l) => {
    const matchesAction = actionFilter === 'All' || l.action === actionFilter;
    const matchesEntity = entityFilter === 'All' || l.entityType === entityFilter;
    return matchesAction && matchesEntity;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-orange-600" />
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
              Immutable Governance Audit Trail
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chronological audit log tracking every guideline ingestion, AI check, suggestion acceptance, review comment, and formal approval decision.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-semibold">
            {logs.length} Total Audited Events
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Filter Actions:
        </span>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-xl border border-slate-300 text-xs px-3 py-1.5 focus:outline-hidden focus:border-orange-500 bg-white"
        >
          <option value="All">All Actions</option>
          <option value="guideline_uploaded">Guideline Uploaded</option>
          <option value="content_submitted">Content Submitted</option>
          <option value="ai_analysis_completed">AI Analysis Completed</option>
          <option value="suggestion_applied">Suggestion Applied</option>
          <option value="content_revised">Content Revised</option>
          <option value="comment_added">Comment Added</option>
          <option value="content_approved">Content Approved</option>
          <option value="changes_requested">Changes Requested</option>
          <option value="content_rejected">Content Rejected</option>
        </select>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="rounded-xl border border-slate-300 text-xs px-3 py-1.5 focus:outline-hidden focus:border-orange-500 bg-white"
        >
          <option value="All">All Entity Types</option>
          <option value="submission">Submissions</option>
          <option value="guideline">Guidelines</option>
          <option value="rule">Rules</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Actor & Role</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Details & Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">Loading audit history...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">No audit logs matching this filter.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badgeColor = actionColors[log.action] || 'bg-slate-100 text-slate-700 border-slate-200';
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] border capitalize ${badgeColor}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div>{log.performedBy?.userName || 'System'}</div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {log.performedBy?.userRole?.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        <span className="capitalize">{log.entityType}</span>: {log.entityId}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
