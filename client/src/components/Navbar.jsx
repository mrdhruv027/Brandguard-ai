import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, ShieldAlert, Cpu } from 'lucide-react';

export default function Navbar() {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F172A] text-white shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-[#0F172A]">
                  BrandGuard<span className="text-orange-500"> AI</span>
                </span>
                <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-800 uppercase tracking-wider">
                  Round 2 MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Intelligent Brand Governance Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-4">
          {/* Active AI Status Pill */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Cpu className="h-3.5 w-3.5 text-emerald-600" />
            <span>Grounded RAG Engine Active</span>
          </div>

          {/* Quick Demo Role Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 shadow-inner">
            <span className="px-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:inline">
              Role:
            </span>
            <button
              onClick={() => switchRole('creator')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                user?.role === 'creator'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Content Creator persona"
            >
              Creator
            </button>
            <button
              onClick={() => switchRole('brand_manager')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                user?.role === 'brand_manager'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Brand Manager persona"
            >
              Brand Manager
            </button>
            <button
              onClick={() => switchRole('compliance_admin')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                user?.role === 'compliance_admin'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Compliance Admin persona"
            >
              Compliance Admin
            </button>
          </div>

          {/* Current User Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=BrandGuard'}
              alt={user?.name || 'User'}
              className="h-8 w-8 rounded-full border border-slate-200 bg-slate-50"
            />
            <div className="hidden sm:block text-left text-xs">
              <div className="font-semibold text-slate-800 leading-tight">{user?.name}</div>
              <div className="text-[10px] text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
