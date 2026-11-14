import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  ListOrdered,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Search
} from 'lucide-react';

export default function ReviewQueuePage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/submissions');
      if (res.data.success) {
        setSubmissions(res.data.submissions);
      }
    } catch (err) {
      console.error('[Queue Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const statuses = [
    'All',
    'Under Review',
    'Issues Found',
    'Revised',
    'Submitted',
    'Changes Requested',
    'Approved',
    'Rejected'
  ];

  const filtered = submissions.filter((sub) => {
    const matchesStatus = statusFilter === 'All' || sub.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = !search ||
      sub.title.toLowerCase().includes(search.toLowerCase()) ||
      sub.contentType.toLowerCase().includes(search.toLowerCase()) ||
      (sub.submittedBy?.userName && sub.submittedBy.userName.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
            Governance & Content Review Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorised Brand Managers and Compliance Admins review AI findings, inspect diffs, and approve content for publication.
          </p>
        </div>

        <Link
          to="/app/submit"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-700 shadow-xs transition-colors"
        >
          <span>Submit New Copy</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-[#0F172A] text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search copy or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-orange-500"
          />
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Title & Channel</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">Compliance Score</th>
                <th className="py-3.5 px-4">Version</th>
                <th className="py-3.5 px-4">Submitted By</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Loading queue submissions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No submissions found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => {
                  const isUnderReview = sub.status === 'Under Review';
                  return (
                    <tr
                      key={sub._id || sub.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isUnderReview ? 'bg-orange-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{sub.title}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {sub.contentType}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="py-3.5 px-4 font-bold">
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
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        v{sub.version || 1}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {sub.submittedBy?.userName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(sub.updatedAt || sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <Link
                          to={`/app/analysis/${sub._id || sub.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 hover:bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors"
                        >
                          <span>Findings</span>
                        </Link>
                        <Link
                          to={`/app/approval/${sub._id || sub.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white px-2.5 py-1 text-[11px] font-semibold transition-colors"
                        >
                          <span>Review & Approve</span>
                          <ArrowRight className="h-3 w-3 text-orange-400" />
                        </Link>
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
