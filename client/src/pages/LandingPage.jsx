import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const steps = [
    { title: '1. Ingest Guidelines', desc: 'Upload PDF, DOCX, or TXT brand manuals. AI automatically parses and indexes structured rules with source citations.', color: 'border-blue-500 text-blue-600 bg-blue-50' },
    { title: '2. Check Content', desc: 'Paste marketing copy or upload drafts. Analyze posts, ads, emails, and collateral against approved company policies.', color: 'border-indigo-500 text-indigo-600 bg-indigo-50' },
    { title: '3. Grounded AI Findings', desc: 'Detect off-brand tone, prohibited claims, and naming errors. Every flag cites the exact rule statement and document page.', color: 'border-orange-500 text-orange-600 bg-orange-50' },
    { title: '4. 1-Click Corrections', desc: 'Creators accept AI-suggested fixes or make manual revisions with automated version history tracking.', color: 'border-purple-500 text-purple-600 bg-purple-50' },
    { title: '5. Human Approval', desc: 'Brand managers review diffs, leave threaded comments, and authorize publishing with immutable audit logs.', color: 'border-emerald-500 text-emerald-600 bg-emerald-50' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Top Banner */}
      <div className="bg-[#0F172A] text-white text-xs py-2 px-4 text-center font-medium border-b border-slate-800">
        <span className="text-orange-400 font-bold mr-2">CodeNova India 2026</span>
        <span>Round 2 Prototype · Team Innovexa (Isha Upadhyay & Dhruv Sharma)</span>
      </div>

      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0F172A] flex items-center justify-center shadow-md">
              <ShieldCheck className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#0F172A]">
                BrandGuard<span className="text-orange-500"> AI</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 transition-colors"
            >
              <span>Launch App</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-semibold text-orange-800 mb-6">
          <Sparkles className="h-3.5 w-3.5 text-orange-600" />
          <span>Explainable, Human-Controlled Brand Governance</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] max-w-4xl mx-auto leading-tight">
          Catch brand inconsistencies <span className="text-orange-600 underline decoration-orange-300 underline-offset-8">before</span> content is published.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Brand drift damages institutional credibility. BrandGuard AI evaluates every advertisement, post, and document against your organization's approved guidelines with grounded citations and human sign-off.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/app/submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-slate-800 transition-all hover:scale-[1.02]"
          >
            <span>Test Brand Check with Sample Copy</span>
            <ArrowRight className="h-4 w-4 text-orange-400" />
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Explore Dashboard</span>
          </Link>
        </div>

        {/* Differentiator Callout Box */}
        <div className="mt-16 max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-[#0F172A] p-6 text-white text-left shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">
            <Lock className="h-4 w-4" />
            <span>Our Core Differentiator</span>
          </div>
          <p className="text-lg font-medium text-slate-100 leading-snug">
            “We don't just detect brand violations. We show the <span className="text-orange-400 font-semibold">exact approved rule</span> behind every finding, help creators fix it, and identify when the company's own guidelines are unclear.”
          </p>
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>AI suggests · Authorized human decides</span>
            <span className="text-slate-300 font-mono">Zero Hallucinated Citations</span>
          </div>
        </div>
      </section>

      {/* 5-Step Workflow Demonstration */}
      <section className="py-16 bg-[#F8FAFC] border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              The End-to-End Governance Workflow
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              From guideline upload to final human approval, every step is tracked with timestamps, comments, and audit logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((st, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mb-3 ${st.color}`}>
                  {i + 1}
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{st.title}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A]">Strict Citation Validation</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Every flagged passage must match a verified rule ID and approved quotation stored in MongoDB. Unverified or hallucinated findings are rejected by the RAG validator.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A]">Multi-Format Ingestion</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Upload PDF, DOCX, or TXT brand manuals. Python-based PyMuPDF and python-docx extract page numbers and structure rules into 7 canonical governance categories.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A]">Review & Sign-Off Workflow</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Brand managers inspect side-by-side diffs, post review comments, request changes, or grant formal approvals. Complete audit logs record every action.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500">
        <p>BrandGuard AI · CodeNova India 2026 Round 2 Submission</p>
        <p className="mt-1">Built with React, Node.js/Express, Python FastAPI, MongoDB & Grounded RAG</p>
      </footer>
    </div>
  );
}
