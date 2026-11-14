import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Shield, CheckCircle, ArrowRight, Lock } from 'lucide-react';

export default function LoginPage() {
  const { demoUsers, switchRole, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('creator@brandguard.ai');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoSelect = (role) => {
    switchRole(role);
    navigate('/app');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res?.success) {
      navigate('/app');
    } else {
      setError(res?.message || 'Login failed. Try demo accounts below.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-xl bg-[#0F172A] flex items-center justify-center shadow-md">
            <ShieldCheck className="h-6 w-6 text-orange-500" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#0F172A]">
            BrandGuard<span className="text-orange-500"> AI</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Sign In to Enterprise Workspace
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Select a hackathon persona below for instantaneous 1-click access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        {/* 1-Click Persona Cards */}
        <div className="bg-white py-6 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-8 mb-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Quick Persona Selector (Hackathon Demo)
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => handleDemoSelect('creator')}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  CR
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900 group-hover:text-orange-950 flex items-center gap-2">
                    <span>Dhruv Sharma</span>
                    <span className="rounded bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.2 border border-blue-200">
                      Creator
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Upload & check content, apply AI fixes, resubmit
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-600 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => handleDemoSelect('brand_manager')}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                  BM
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900 group-hover:text-orange-950 flex items-center gap-2">
                    <span>Isha Upadhyay</span>
                    <span className="rounded bg-orange-50 text-orange-700 text-[10px] px-1.5 py-0.2 border border-orange-200">
                      Brand Manager
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Review submissions, inspect diffs, comment, approve/reject
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-600 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => handleDemoSelect('compliance_admin')}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  CA
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900 group-hover:text-orange-950 flex items-center gap-2">
                    <span>Compliance Officer</span>
                    <span className="rounded bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.2 border border-emerald-200">
                      Admin
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Upload & edit guidelines, manage rules, inspect audit logs
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-600 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Traditional Credentials Form */}
        <div className="bg-white py-6 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-xs text-sm font-semibold text-white bg-[#0F172A] hover:bg-slate-800 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
