import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileCheck2,
  ListOrdered,
  BookOpenCheck,
  History,
  ShieldAlert,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    {
      to: '/app',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
      roles: ['creator', 'brand_manager', 'compliance_admin']
    },
    {
      to: '/app/submit',
      label: 'Check Content',
      icon: FileCheck2,
      badge: 'Core Workflow',
      roles: ['creator', 'brand_manager', 'compliance_admin']
    },
    {
      to: '/app/queue',
      label: 'Review Queue',
      icon: ListOrdered,
      roles: ['creator', 'brand_manager', 'compliance_admin']
    },
    {
      to: '/app/guidelines',
      label: 'Brand Guidelines',
      icon: BookOpenCheck,
      badge: user?.role === 'creator' ? 'Read-only' : 'Manage',
      roles: ['creator', 'brand_manager', 'compliance_admin']
    },
    {
      to: '/app/audit',
      label: 'Audit History',
      icon: History,
      roles: ['brand_manager', 'compliance_admin', 'creator']
    }
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Workspace Title */}
        <div className="px-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          <div className="mt-1 flex items-center justify-between font-semibold text-slate-800 text-sm">
            <span>Innovexa Corp</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app'}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#0F172A] text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          isActive
                            ? 'bg-orange-500/20 text-orange-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50/60 to-amber-50/60 p-3.5 text-xs text-slate-700 shadow-xs">
        <div className="flex items-center gap-1.5 font-bold text-orange-950">
          <Sparkles className="h-3.5 w-3.5 text-orange-600" />
          <span>CodeNova Round 2</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
          Grounded RAG brand governance. Every flag cites exact approved rule text.
        </p>
        <div className="mt-2 text-[10px] font-semibold text-slate-400">
          Team Innovexa · Isha & Dhruv
        </div>
      </div>
    </aside>
  );
}
