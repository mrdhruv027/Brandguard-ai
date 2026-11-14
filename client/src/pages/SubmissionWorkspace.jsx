import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  FileText,
  Upload,
  Sparkles,
  AlertCircle,
  FileCheck2,
  Share2,
  Mail,
  Megaphone,
  BookOpen
} from 'lucide-react';

export default function SubmissionWorkspace() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('Social Media Post');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sampleViolating = "🚀 Exciting news from brandguard!\n\nWe are thrilled to launch our next-gen solution that is 100% bug-free and dirt cheap compared to outdated alternatives. Over 9,000 teams trust us already for their marketing governance needs!! Sign up today for our zero risk guarantee and experience the difference.";

  const sampleCompliant = "Introducing BrandGuard AI: Intelligent Brand Governance.\n\nCatch inconsistencies before content is published. BrandGuard AI empowers modern marketing organizations to maintain institutional tone, adhere to approved facts, and eliminate off-brand claims.\n\nTrusted by over 450+ enterprise compliance teams worldwide, our grounded governance engine suggests actionable fixes while human reviewers retain final approval authority.";

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmitAndAnalyze = async (e) => {
    e.preventDefault();
    if (!content.trim() && !file) {
      setError('Please provide copy in the text editor or upload a document (.pdf, .docx, .txt).');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1. Submit content
      let subResponse;
      if (file) {
        const formData = new FormData();
        formData.append('title', title || file.name);
        formData.append('contentType', contentType);
        formData.append('content', content);
        formData.append('file', file);
        subResponse = await api.post('/submissions', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        subResponse = await api.post('/submissions', {
          title: title || 'Untitled Campaign Copy',
          contentType,
          content
        });
      }

      const submissionId = subResponse.data.submission._id || subResponse.data.submission.id;

      // 2. Trigger AI Brand Analysis immediately
      await api.post(`/submissions/${submissionId}/analyze`);

      // 3. Navigate to analysis results dashboard
      navigate(`/app/analysis/${submissionId}`);
    } catch (err) {
      console.error('[Submission Error]:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit and check content.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Creator Workspace · Content Brand Check
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Draft or upload marketing collateral, advertisements, or documents to verify adherence to approved brand rules.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmitAndAnalyze} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Title and Content Type Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700">Content Title</label>
            <input
              type="text"
              placeholder="e.g. Q1 Product Launch Announcement, Enterprise Security Email"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm shadow-xs focus:border-orange-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm shadow-xs focus:border-orange-500 focus:outline-hidden bg-white"
            >
              <option value="Social Media Post">Social Media Post</option>
              <option value="Advertisement">Advertisement</option>
              <option value="Email">Email</option>
              <option value="Document">Document</option>
            </select>
          </div>
        </div>

        {/* Demo Fast-Load Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Quick Sample Drafts:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTitle('Product Launch Ad Copy (With Violations)');
                setContentType('Social Media Post');
                setContent(sampleViolating);
                setFile(null);
              }}
              className="rounded-lg bg-white border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 shadow-2xs transition-colors"
            >
              Load Violating Copy
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle('Compliant Brand Announcement');
                setContentType('Social Media Post');
                setContent(sampleCompliant);
                setFile(null);
              }}
              className="rounded-lg bg-white border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 shadow-2xs transition-colors"
            >
              Load Compliant Copy
            </button>
          </div>
        </div>

        {/* Text Editor */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Content Editor
          </label>
          <textarea
            rows={8}
            placeholder="Paste your advertisement copy, social post, email body, or document text here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-3.5 text-sm font-sans shadow-xs focus:border-orange-500 focus:outline-hidden leading-relaxed resize-y"
          ></textarea>
        </div>

        {/* File Upload Dropzone (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Or Upload Document (PDF, DOCX, TXT)
          </label>
          <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-orange-400 transition-colors bg-slate-50/50">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <Upload className="h-6 w-6 text-slate-400 mb-1" />
              <p className="text-xs font-medium text-slate-700">
                {file ? (
                  <span className="text-orange-600 font-semibold">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                ) : (
                  <span>Click to browse or drag and drop PDF, DOCX, or TXT</span>
                )}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Up to 25MB · Text and page metadata will be extracted
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <div className="text-xs text-slate-500">
            AI checks tone, terminology, approved facts, prohibited claims & formatting.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-orange-700 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing with Grounded AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-white" />
                <span>Check with BrandGuard AI</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
