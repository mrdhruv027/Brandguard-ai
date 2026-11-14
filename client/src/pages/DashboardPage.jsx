import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  FileCheck2,
  BookOpenCheck,
  ListOrdered,
  History,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, subsRes, logsRes] = await Promise.all([
        api.get('/stats/dashboard'),
        api.get('/submissions'),
        api.get('/audit-logs?limit=5')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (subsRes.data.success) setSubmissions(subsRes.data.submissions);
      if (logsRes.data.success) setRecentLogs(logsRes.data.logs);
    } catch (err) {
      console.error('[Dashboard Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Welcome back, {user?.name}
            </h1>
            <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-semibold capitalize border border-slate-200">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise Brand Governance · 100% Grounded Citations · Human Review Control
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/submit"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-700 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Check Content Now</span>
          </Link>
          <Link
            to="/app/guidelines"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <BookOpenCheck className="h-4 w-4 text-slate-500" />
            <span>View Guidelines</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Compliance Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Avg Compliance</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0F172A]">
              {stats?.averageComplianceScore ?? 88}%
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Audited
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats?.averageComplianceScore ?? 88}%` }}
            ></div>
          </div>
        </div>

        {/* Total Submissions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Submissions</span>
            <FileText className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0F172A]">
              {stats?.totalSubmissions ?? submissions.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Drafts & Posts</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {stats?.approvedCount ?? 0} Approved · {stats?.issuesFoundCount ?? 0} Issues
          </p>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Pending Review</span>
            <Clock className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-orange-600">
              {stats?.underReviewCount ?? 0}
            </span>
            <span className="text-xs font-medium text-orange-800 bg-orange-50 px-1.5 py-0.5 rounded">
              Requires Sign-off
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Awaiting Brand Manager approval
          </p>
        </div>

        {/* Active Rules */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Approved Rules</span>
            <BookOpenCheck className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0F172A]">
              {stats?.activeRulesCount ?? 7}
            </span>
            <span className="text-xs font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              Indexed
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Across 7 governance categories
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Submissions & Live Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Content Submissions</h2>
              <p className="text-xs text-slate-500">Marketing copy, ad creatives, and document checks</p>
            </div>
            <Link
              to="/app/queue"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Title & Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No submissions found. Click "Check Content Now" to analyze your first copy!
                    </td>
                  </tr>
                ) : (
                  submissions.slice(0, 6).map((sub) => (
                    <tr key={sub._id || sub.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div>{sub.title}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{sub.contentType}</div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {sub.complianceScore !== null && sub.complianceScore !== undefined ? (
                          <span
                            className={
                              sub.complianceScore >= 80
                                ? 'text-emerald-600'
                                : sub.complianceScore >= 50
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }
                          >
                            {sub.complianceScore}%
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {sub.submittedBy?.userName || 'Dhruv Sharma'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/app/analysis/${sub._id || sub.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-[#0F172A] hover:text-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors"
                        >
                          <span>Review</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Audit Log Feed (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-orange-600" />
              <h2 className="text-sm font-bold text-slate-900">Audit Trail Feed</h2>
            </div>
            <Link
              to="/app/audit"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Full Log
            </Link>
          </div>

          <div className="mt-4 space-y-3.5">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent audit logs.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log._id} className="flex gap-3 text-xs">
                  <div className="h-2 w-2 rounded-full bg-orange-500 mt-1.5 shrink-0"></div>
                  <div>
                    <div className="font-semibold text-slate-800">
                      {log.action.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      By {log.performedBy?.userName} ({log.performedBy?.userRole})
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
