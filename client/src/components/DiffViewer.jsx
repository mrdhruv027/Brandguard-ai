import React from 'react';

export default function DiffViewer({ originalText = '', currentText = '', originalLabel = 'Original Content (Draft)', currentLabel = 'Current Revised Version' }) {
  // Simple word-level visual diff
  const originalWords = originalText.split(/(\s+)/);
  const currentWords = currentText.split(/(\s+)/);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Original Version */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {originalLabel}
          </span>
          <span className="text-[11px] rounded bg-slate-100 text-slate-600 px-2 py-0.5">
            Initial Submission
          </span>
        </div>
        <div className="text-sm text-slate-700 font-mono whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/60 min-h-[120px]">
          {originalText || <span className="text-slate-400 italic">No content</span>}
        </div>
      </div>

      {/* Revised Current Version */}
      <div className="rounded-xl border border-orange-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-orange-100">
          <span className="text-xs font-semibold text-orange-950 uppercase tracking-wider">
            {currentLabel}
          </span>
          <span className="text-[11px] rounded bg-orange-100 text-orange-800 font-medium px-2 py-0.5">
            Governed & Corrected
          </span>
        </div>
        <div className="text-sm text-slate-800 font-mono whitespace-pre-wrap leading-relaxed bg-orange-50/30 p-3 rounded-lg border border-orange-200/50 min-h-[120px]">
          {currentText || <span className="text-slate-400 italic">No content</span>}
        </div>
      </div>
    </div>
  );
}
