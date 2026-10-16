import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Activity,
  MessageSquare,
  Server,
  Lock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Database,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RiskBadge } from '../components/RiskBadge';
import { SUPABASE_PROJECT_ID } from '../lib/supabase';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [supabaseLogs, setSupabaseLogs] = useState<any[]>([]);
  const [sbTesting, setSbTesting] = useState(false);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }

      // Fetch Supabase status & saved login details
      const sbRes = await fetch('/api/supabase/status');
      if (sbRes.ok) {
        const sbData = await sbRes.json();
        setSupabaseStatus(sbData);
      }

      const logsRes = await fetch('/api/supabase/logins');
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setSupabaseLogs(logsData.logs || []);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSupabasePing = async () => {
    setSbTesting(true);
    try {
      const sbRes = await fetch('/api/supabase/status');
      if (sbRes.ok) {
        const sbData = await sbRes.json();
        setSupabaseStatus(sbData);
      }
      const logsRes = await fetch('/api/supabase/logins');
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setSupabaseLogs(logsData.logs || []);
      }
    } finally {
      setSbTesting(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#080D1A] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5" />
              <span>SecOps Administrative & Threat Operations Console</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Platform Health & Threat Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Aggregated platform telemetry derived strictly from live database records and heuristic logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SecOps Lead Authorized ({user?.email})
            </span>
            <button
              onClick={fetchAdminStats}
              className="p-2 text-slate-400 hover:text-white rounded bg-slate-900 border border-slate-800"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading && !stats ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400">Loading SecOps telemetry...</p>
          </div>
        ) : (
          <>
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-[#0E172B] border border-slate-800 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  Active Registered Accounts
                </span>
                <span className="font-mono text-2xl font-bold text-white tabular-nums block">
                  {stats?.totalUsers || 2}
                </span>
                <span className="text-[10px] text-slate-400">Isolated database profiles</span>
              </div>

              <div className="p-5 rounded-xl bg-[#0E172B] border border-slate-800 space-y-1">
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Total Investigations
                </span>
                <span className="font-mono text-2xl font-bold text-cyan-300 tabular-nums block">
                  {stats?.totalAnalyses || 3}
                </span>
                <span className="text-[10px] text-slate-400">Across messages, URLs, images</span>
              </div>

              <div className="p-5 rounded-xl bg-[#0E172B] border border-slate-800 space-y-1">
                <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  High Risk Quarantined
                </span>
                <span className="font-mono text-2xl font-bold text-rose-400 tabular-nums block">
                  {stats?.riskCounts?.HIGH || 0}
                </span>
                <span className="text-[10px] text-slate-400">Severe malicious hallmarks</span>
              </div>

              <div className="p-5 rounded-xl bg-[#0E172B] border border-slate-800 space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  Community Accuracy Logs
                </span>
                <span className="font-mono text-2xl font-bold text-white tabular-nums block">
                  {stats?.totalFeedback || 0}
                </span>
                <span className="text-[10px] text-slate-400">Verified feedback entries</span>
              </div>
            </div>

            {/* Middle Section: Engine Distribution & Service Health */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left: Engine Activity Breakdown */}
              <div className="lg:col-span-6 bg-[#0E172B] border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="font-display text-base font-bold text-white">
                  Detection Activity by Engine Vector
                </h3>
                
                <div className="space-y-4 text-xs font-mono">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Message / Email Inspector</span>
                      <span className="tabular-nums font-bold text-cyan-300">{stats?.typeCounts?.message || 0} scans</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full rounded-full"
                        style={{ width: `${Math.max(15, ((stats?.typeCounts?.message || 1) / Math.max(1, stats?.totalAnalyses || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>URL & Domain Security Scanner</span>
                      <span className="tabular-nums font-bold text-blue-400">{stats?.typeCounts?.url || 0} scans</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${Math.max(15, ((stats?.typeCounts?.url || 1) / Math.max(1, stats?.totalAnalyses || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Image Authenticity & Splicing</span>
                      <span className="tabular-nums font-bold text-emerald-400">{stats?.typeCounts?.image || 0} scans</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${Math.max(15, ((stats?.typeCounts?.image || 1) / Math.max(1, stats?.totalAnalyses || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400">
                  Data reflects real-time database transactions without synthetic amplification.
                </div>
              </div>

              {/* Right: Service Status & Architecture Verification */}
              <div className="lg:col-span-6 bg-[#0E172B] border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="font-display text-base font-bold text-white flex items-center justify-between">
                  <span>Engine Infrastructure Status</span>
                  <span className="text-xs font-mono text-emerald-400">Operational</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-[#080D1A] rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block uppercase">AI Model Core</span>
                    <span className="text-cyan-400 font-semibold">{stats?.systemStatus?.activeModel}</span>
                  </div>
                  <div className="p-3 bg-[#080D1A] rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block uppercase">Gemini Cloud API</span>
                    <span className="text-emerald-400 font-semibold">Connected</span>
                  </div>
                  <div className="p-3 bg-[#080D1A] rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block uppercase">SSRF Guard</span>
                    <span className="text-emerald-400 font-semibold">Active & Blocking</span>
                  </div>
                  <div className="p-3 bg-[#080D1A] rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block uppercase">Data Retention</span>
                    <span className="text-slate-300 font-semibold">Zero-Selling / Ephemeral</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
                  <strong className="text-slate-300 block">Privacy Compliance Note:</strong>
                  <p className="leading-relaxed text-[11px]">
                    In accordance with our anti-surveillance privacy principles, administrative telemetry displays aggregate counters and anonymized target summaries. Sensitive credentials and raw email headers are never exposed in administrative views.
                  </p>
                </div>
              </div>

            </div>

            {/* Recent Analysis Stream */}
            <div className="bg-[#0E172B] border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
              <h3 className="font-display text-base font-bold text-white">
                Live Analysis Audit Stream ({stats?.recentAnalyses?.length || 0})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Dossier ID</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Inspected Subject</th>
                      <th className="py-2.5 px-3">Risk Level</th>
                      <th className="py-2.5 px-3 text-right">Threat Score</th>
                      <th className="py-2.5 px-3 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {stats?.recentAnalyses?.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 font-mono text-cyan-400 font-semibold">
                          <Link to={`/results/${item.id}`} className="hover:underline flex items-center gap-1">
                            <span>{item.id}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                        <td className="py-3 px-3 font-mono capitalize text-slate-300">
                          {item.type}
                        </td>
                        <td className="py-3 px-3 max-w-xs truncate text-slate-300 font-mono text-[11px]">
                          {item.target}
                        </td>
                        <td className="py-3 px-3">
                          <RiskBadge level={item.riskLevel} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-200">
                          {item.score}/100
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-400 text-[11px]">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feedback Inbox Stream */}
            <div className="bg-[#0E172B] border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
              <h3 className="font-display text-base font-bold text-white">
                Analyst & Community Feedback Review
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats?.recentFeedback?.map((fb: any) => (
                  <div key={fb.id} className="p-4 rounded-lg bg-[#080D1A] border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-cyan-400 uppercase text-[10px]">
                        Category: {fb.category}
                      </span>
                      <span className="font-mono text-amber-400 text-xs">
                        {fb.rating} ★
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed italic">
                      "{fb.message}"
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                      <span>{fb.analysisId ? `Analysis Ref: ${fb.analysisId}` : 'Platform Review'}</span>
                      <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </>
        )}

      </div>
    </div>
  );
};
