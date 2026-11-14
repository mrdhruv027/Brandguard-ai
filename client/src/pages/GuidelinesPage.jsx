import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  BookOpenCheck,
  Upload,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  FileText,
  AlertCircle,
  Filter,
  Sparkles,
  Layers
} from 'lucide-react';

export default function GuidelinesPage() {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit / Create Rule Modal
  const [editingRule, setEditingRule] = useState(null);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    category: 'Brand tone',
    ruleText: '',
    explanation: '',
    sourceDoc: 'Brand Manual',
    pageNumber: 1
  });

  const categories = [
    'All',
    'Brand tone',
    'Terminology',
    'Messaging',
    'Approved facts',
    'Prohibited claims',
    'Formatting',
    'Visual identity'
  ];

  const fetchGuidelinesAndRules = async () => {
    try {
      setLoading(true);
      const [gRes, rRes] = await Promise.all([
        api.get('/guidelines'),
        api.get('/rules')
      ]);
      if (gRes.data.success) setGuidelines(gRes.data.guidelines);
      if (rRes.data.success) setRules(rRes.data.rules);
    } catch (err) {
      console.error('[Guidelines Fetch Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidelinesAndRules();
  }, []);

  // Upload Guideline File
  const handleUploadGuideline = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a PDF, DOCX, or TXT document.');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('title', uploadTitle || selectedFile.name);
      formData.append('file', selectedFile);

      const res = await api.post('/guidelines/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSuccessMsg(`Successfully uploaded and parsed ${res.data.rulesCount} brand rules from ${selectedFile.name}!`);
        setSelectedFile(null);
        setUploadTitle('');
        fetchGuidelinesAndRules();
        setTimeout(() => setSuccessMsg(''), 6000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // Save or Update Rule
  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        // Update
        const res = await api.put(`/rules/${editingRule._id || editingRule.id || editingRule.ruleId}`, ruleForm);
        if (res.data.success) {
          setSuccessMsg(`Rule ${editingRule.ruleId} updated.`);
          setEditingRule(null);
          fetchGuidelinesAndRules();
        }
      } else {
        // Create
        const res = await api.post('/rules', ruleForm);
        if (res.data.success) {
          setSuccessMsg(`New rule ${res.data.rule.ruleId} created.`);
          setIsCreatingRule(false);
          fetchGuidelinesAndRules();
        }
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // Delete Rule
  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm(`Are you sure you want to remove rule ${ruleId}?`)) return;
    try {
      const res = await api.delete(`/rules/${ruleId}`);
      if (res.data.success) {
        setSuccessMsg(`Rule ${ruleId} deleted.`);
        fetchGuidelinesAndRules();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const filteredRules = rules.filter((r) => {
    const matchesCat = categoryFilter === 'All' || r.category === categoryFilter;
    const matchesSearch = !search ||
      r.ruleId.toLowerCase().includes(search.toLowerCase()) ||
      r.ruleText.toLowerCase().includes(search.toLowerCase()) ||
      (r.explanation && r.explanation.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const canEdit = ['compliance_admin', 'brand_manager'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
            Approved Brand Guidelines & Rule Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ingest corporate brand manuals (PDF, DOCX, TXT) and manage grounded rules across 7 core governance pillars.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => {
              setRuleForm({
                category: 'Brand tone',
                ruleText: '',
                explanation: '',
                sourceDoc: 'Brand Manual 2026',
                pageNumber: 1
              });
              setEditingRule(null);
              setIsCreatingRule(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-700 shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Brand Rule Manually</span>
          </button>
        )}
      </div>

      {/* Notifications */}
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
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-700 font-bold">&times;</button>
        </div>
      )}

      {/* Upload Document Box (Compliance Admin / Manager) */}
      {canEdit && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Upload className="h-4 w-4 text-orange-600" />
            <span>Ingest Approved Brand Guideline Document</span>
          </div>

          <form onSubmit={handleUploadGuideline} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Guideline Manual Title
              </label>
              <input
                type="text"
                placeholder="e.g. Global Brand Guidelines 2026"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-hidden focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select File (.pdf, .docx, .txt)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    if (!uploadTitle) setUploadTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                  }
                }}
                className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white py-2.5 px-4 text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Extracting Rules with PyMuPDF...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-orange-400" />
                    <span>Upload & Auto-Extract Rules</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#0F172A] text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search rules, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-orange-500"
          />
        </div>
      </div>

      {/* Rules Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Rule ID</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Exact Approved Guideline Statement</th>
                <th className="py-3.5 px-4">Source & Page</th>
                <th className="py-3.5 px-4">Status</th>
                {canEdit && <th className="py-3.5 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Loading approved rules...</td>
                </tr>
              ) : filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No rules found matching this category filter.
                  </td>
                </tr>
              ) : (
                filteredRules.map((r) => (
                  <tr key={r._id || r.id || r.ruleId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-orange-950">
                      {r.ruleId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-semibold border border-slate-200">
                        {r.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-medium text-slate-900 leading-snug">{r.ruleText}</div>
                      {r.explanation && (
                        <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{r.explanation}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{r.sourceDoc}</div>
                      <div className="text-[10px] text-slate-400">Page {r.pageNumber || 1}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold border border-emerald-200">
                        {r.status || 'approved'}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingRule(r);
                            setRuleForm({
                              category: r.category,
                              ruleText: r.ruleText,
                              explanation: r.explanation || '',
                              sourceDoc: r.sourceDoc || '',
                              pageNumber: r.pageNumber || 1
                            });
                            setIsCreatingRule(true);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded"
                          title="Edit Rule"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(r._id || r.id || r.ruleId)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete Rule"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Rule Modal */}
      {isCreatingRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingRule ? `Edit Rule: ${editingRule.ruleId}` : 'Add New Approved Brand Rule'}
            </h3>

            <form onSubmit={handleSaveRule} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={ruleForm.category}
                  onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exact Approved Guideline Statement
                </label>
                <textarea
                  rows={3}
                  required
                  value={ruleForm.ruleText}
                  onChange={(e) => setRuleForm({ ...ruleForm, ruleText: e.target.value })}
                  placeholder="State the official brand requirement clearly..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Explanation & Usage Guidance
                </label>
                <textarea
                  rows={2}
                  value={ruleForm.explanation}
                  onChange={(e) => setRuleForm({ ...ruleForm, explanation: e.target.value })}
                  placeholder="Why this rule exists and how creators should apply it..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Source Document</label>
                  <input
                    type="text"
                    value={ruleForm.sourceDoc}
                    onChange={(e) => setRuleForm({ ...ruleForm, sourceDoc: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Page Number</label>
                  <input
                    type="number"
                    value={ruleForm.pageNumber}
                    onChange={(e) => setRuleForm({ ...ruleForm, pageNumber: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingRule(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-2xs"
                >
                  {editingRule ? 'Save Changes' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
