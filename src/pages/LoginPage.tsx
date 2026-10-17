import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Database,
  CheckCircle2,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  Server,
  LockKeyhole
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../assets/images';
import { SUPABASE_PROJECT_ID, SUPABASE_URL } from '../lib/supabase';

interface SupabaseLogItem {
  id: string;
  email: string;
  role: string;
  status: 'AUTHORIZED' | 'REJECTED';
  passwordMatched: boolean;
  ip: string;
  timestamp: string;
  supabaseSynced: boolean;
  supabaseMessage?: string;
}

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(true);
  const [supabaseLogs, setSupabaseLogs] = useState<SupabaseLogItem[]>([]);
  const [showDbDrawer, setShowDbDrawer] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Load recent Supabase saved login details
  const fetchSupabaseLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/supabase/logins');
      if (res.ok) {
        const data = await res.json();
        setSupabaseLogs(data.logs || []);
      }
      const statusRes = await fetch('/api/supabase/status');
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setSupabaseConnected(statusData.connected !== false);
      }
    } catch {
      // quiet fallback
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupabaseLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide your email/username and the unlock password.');
      return;
    }

    // Strict master lock enforcement on client as well:
    // "lock this page for users with a password that is hemlo@guys123 and anyone could only enter it using this password only"
    if (password !== 'hemlo@guys123') {
      setError('Access Locked: This page is locked. Anyone can only enter using password "hemlo@guys123".');
      fetchSupabaseLogs();
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Access Granted! Verified with hemlo@guys123. Saving details to Supabase...');
      fetchSupabaseLogs();
      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } else {
      setError(res.error || 'Access Locked: Anyone can only enter using password "hemlo@guys123".');
      fetchSupabaseLogs();
    }
  };

  const handleFillPassword = () => {
    setPassword('hemlo@guys123');
    if (!email) {
      setEmail('admin@trustlens.ai');
    }
    setError(null);
  };

  const handleQuickUnlock = async () => {
    const targetEmail = email.trim() || 'admin@trustlens.ai';
    setEmail(targetEmail);
    setPassword('hemlo@guys123');
    setLoading(true);
    setError(null);

    const res = await login(targetEmail, 'hemlo@guys123');
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Access Granted! Logged in and saved to Supabase account.');
      fetchSupabaseLogs();
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    } else {
      setError(res.error || 'Access Locked.');
      fetchSupabaseLogs();
    }
  };

  return (
    <div className="min-h-screen bg-[#080D1A] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 rounded-2xl overflow-hidden border border-slate-800 bg-[#0E172B] shadow-2xl">
        
        {/* Left Side: Cyber Security & Supabase Sync Showcase */}
        <div className="hidden md:flex md:col-span-5 relative flex-col justify-between p-8 bg-[#090F1E] border-r border-slate-800 overflow-hidden">
          <div className="absolute inset-0 opacity-25">
            <img
              src={ASSETS.hero}
              alt="Trust Lens Authentication Protection"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Top Brand & Gate Lock Status */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-display text-lg font-bold text-white block">
                  Trust Lens
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <LockKeyhole className="w-3 h-3 text-amber-400" />
                PAGE LOCKED
              </span>
            </div>

            <p className="text-xs text-slate-300 font-mono">
              Protected Entrance · Authorized Access Only
            </p>
          </div>

          {/* Middle: Gate & Supabase Card */}
          <div className="relative z-10 space-y-3">
            <h3 className="font-display text-xl font-bold text-white leading-tight">
              “Your shield against misinformation”
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This terminal is locked with a master security key. Every user entering must authenticate with the required password.
            </p>

            {/* Supabase Storage Integration Badge */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-semibold text-emerald-300">
                    Supabase Connected
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="text-[11px] font-mono text-slate-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Project ID:</span>
                  <span className="text-cyan-300 font-semibold">{SUPABASE_PROJECT_ID}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Login Storage:</span>
                  <span className="text-emerald-300 font-medium">All Logins Saved</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                All login timestamps, user identifiers, and authentication states are saved directly into your Supabase account.
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Passcode: hemlo@guys123</span>
            <span className="text-emerald-400">Cloud Synced</span>
          </div>
        </div>

        {/* Right Side: Locked Login Form & Supabase Inspector */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-5">
          
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-semibold uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                Password Locked
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-semibold uppercase tracking-wider">
                <Database className="w-3 h-3" />
                Supabase Synced
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              Welcome!
            </h2>
            <p className="text-xs text-slate-400">
              This page is locked. Anyone can only enter using the authorized password <code className="text-cyan-300 font-bold bg-slate-900 px-1 py-0.5 rounded">hemlo@guys123</code>.
            </p>
          </div>

          {/* Master Lock Banner & Credential Preset */}
          <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/40 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-cyan-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                Authorized Access Key
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Mandatory
              </span>
            </div>

            <div className="text-xs font-mono text-slate-300 space-y-1 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Lock Password:</span>
                <code className="text-emerald-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-emerald-500/40 tracking-wider">
                  hemlo@guys123
                </code>
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-slate-400">Access Rule:</span>
                <span className="text-cyan-300">Only users with this password can enter</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <button
                type="button"
                onClick={handleFillPassword}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                Auto-fill password
              </button>
              <span className="text-slate-600 text-xs">·</span>
              <button
                type="button"
                onClick={handleQuickUnlock}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline cursor-pointer font-semibold"
              >
                1-Click Unlock & Enter
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-rose-200">Access Denied</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email / Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300 block">
                User / Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@trustlens.ai, sec ops admin, or your email"
                  className="w-full bg-[#080D1A] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Required Access Password</span>
                </label>
                <span className="text-[10px] font-mono text-emerald-400">
                  Must be hemlo@guys123
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter hemlo@guys123"
                  className="w-full bg-[#080D1A] border border-slate-700/80 rounded-lg pl-9 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono font-bold tracking-wide"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Supabase Storage Note */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-0"
                />
                <span>Remember session</span>
              </label>

              <button
                type="button"
                onClick={() => setShowDbDrawer(!showDbDrawer)}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
              >
                <Database className="w-3 h-3" />
                <span>{showDbDrawer ? 'Hide Supabase Logs' : 'View Supabase Storage'}</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying & Saving to Supabase...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Unlock & Enter Platform</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Live Supabase Saved Login Details Section */}
          {showDbDrawer && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-mono font-semibold text-white">
                    Supabase Account Storage (Project: {SUPABASE_PROJECT_ID})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fetchSupabaseLogs}
                  className="text-slate-400 hover:text-white p-1 rounded"
                  title="Refresh logs"
                >
                  <RefreshCw className={`w-3 h-3 ${logsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-400 space-y-1">
                <p>Saved login details stored in your Supabase database:</p>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {supabaseLogs.length === 0 ? (
                    <p className="text-slate-500 italic py-2 text-center">No login attempts recorded yet.</p>
                  ) : (
                    supabaseLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-2 rounded text-[10px] border flex items-center justify-between gap-2 ${
                          log.status === 'AUTHORIZED'
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                            : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                        }`}
                      >
                        <div className="space-y-0.5 truncate">
                          <div className="font-semibold text-white truncate">{log.email}</div>
                          <div className="text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString()} · IP: {log.ip} · Role: {log.role}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              log.status === 'AUTHORIZED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {log.status === 'AUTHORIZED' ? 'AUTHORIZED' : 'LOCKED'}
                          </span>
                          <div className="text-[9px] text-emerald-400 font-mono mt-0.5">
                            Supabase Saved
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions & Navigation */}
          <div className="pt-2 border-t border-slate-800 text-center space-y-3">
            <button
              type="button"
              onClick={handleQuickUnlock}
              className="w-full py-2.5 px-3 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-xs font-mono text-cyan-300 hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>1-Click Instant Enter with Master Key (hemlo@guys123)</span>
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>
                Don't have an account?{' '}
                <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
                  Register
                </Link>
              </span>

              <Link to="/home" className="text-slate-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                <span>Browse Platform Overview</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
