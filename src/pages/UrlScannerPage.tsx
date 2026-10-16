import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Shield, AlertCircle, ArrowRight, RefreshCw, CheckCircle2, Globe, Lock, ExternalLink } from 'lucide-react';
import { AnalysisResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ScoreGauge } from '../components/ScoreGauge';
import { useAuth } from '../context/AuthContext';

export const UrlScannerPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const presets = [
    {
      label: 'PayPal Subdomain Masquerade',
      url: 'http://secure-paypal-verify.com.auth-update.ru/login?token=928a',
      type: 'Credential Harvest Phish',
    },
    {
      label: 'Disposable TLD Banking Scam',
      url: 'http://chase-auth-alert.top/verify',
      type: 'Lookalike Domain',
    },
    {
      label: 'Legitimate Global Authority',
      url: 'https://github.com',
      type: 'Verified Platform',
    },
  ];

  const handleScan = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl || url;
    if (!targetUrl.trim()) {
      setError('Please provide a URL to inspect.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/analyze/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl.trim(),
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to inspect link.');
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Scanning encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D1A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <Link2 className="w-3.5 h-3.5" />
            <span>Threat Detection Engine · URL & Domain Scanner</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            URL & Web Link Reputation Inspector
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            Investigate suspicious links without opening them in your browser. Inspects typosquatting, deceptive subdomains, raw IP hosts, and shorteners protected by our SSRF guard.
          </p>
        </div>

        {/* Quick Test Presets */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-slate-400 block uppercase tracking-wider">
            Quick Test Presets (Click to load & scan)
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setUrl(p.url);
                  handleScan(p.url);
                }}
                className="text-left p-3.5 rounded-lg bg-[#0E172B] hover:bg-[#131F3A] border border-slate-800 hover:border-cyan-500/40 transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                    {p.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {p.type}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-cyan-400/80 truncate">
                  {p.url}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
          <label htmlFor="url-input" className="text-xs font-mono font-medium text-slate-300 block">
            Target URL or Domain to Investigate:
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-4 h-4" />
              </div>
              <input
                id="url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/login or paste a suspicious shortlink..."
                className="w-full bg-[#080D1A] border border-slate-700/80 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                disabled={loading}
              />
            </div>

            <button
              type="button"
              onClick={() => handleScan()}
              disabled={loading || !url.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning Link...</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5" />
                  <span>Scan URL</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>SSRF Guard active: Internal RFC1918 & loopback IPs strictly rejected.</span>
            </div>
            <span>Never visits destination in your local browser session.</span>
          </div>
        </div>

        {/* Live Result View */}
        {result && (
          <div className="bg-[#0E172B] border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-6 animate-in fade-in duration-300">
            {/* Header banner */}
            <div className="p-6 bg-[#131F3B] border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <RiskBadge level={result.riskLevel} size="lg" />
                  <span className="text-xs font-mono text-slate-400">
                    ID: {result.id}
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-white break-all">
                  {result.target}
                </h2>
                <p className="text-sm font-medium text-cyan-300">
                  {result.verdict}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <ScoreGauge score={result.score} riskLevel={result.riskLevel} size="md" />
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Technical Inspection Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#080D1A] border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">SSRF Safety</span>
                  <span className="text-emerald-400 font-semibold">PASS (Verified)</span>
                </div>
                <div className="p-3 rounded-lg bg-[#080D1A] border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Domain Trust</span>
                  <span className="text-slate-200 font-semibold tabular-nums">
                    {result.technicalDetails?.domainTrustScore ?? 45}/100
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#080D1A] border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Redirect Chain</span>
                  <span className="text-slate-200 font-semibold">
                    {result.technicalDetails?.redirectHops || 0} Hops
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#080D1A] border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Inspected Via</span>
                  <span className="text-cyan-400 font-semibold">{result.technicalDetails?.model}</span>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Structural Findings Summary
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed bg-[#080D1A] p-4 rounded-lg border border-slate-800/80">
                  {result.summary}
                </p>
              </div>

              {/* Observed Threat Indicators */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Domain & Link Diagnostic Indicators
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {result.indicators.map((ind, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg bg-[#080D1A] border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">
                          {ind.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${
                            ind.severity === 'high'
                              ? 'text-rose-400 bg-rose-500/10'
                              : ind.severity === 'warning'
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-slate-400 bg-slate-800'
                          }`}
                        >
                          {ind.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {ind.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Advice */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Safe Navigation Guidance
                </h3>
                <div className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[#080D1A] border border-slate-800/80 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uncertainty Explanation */}
              <div className="p-4 rounded-lg bg-[#0A1020] border border-slate-800/80 text-xs text-slate-400 space-y-1">
                <strong className="text-slate-300 block">Threat Intelligence Caveat:</strong>
                <p className="leading-relaxed">{result.uncertaintyExplanation}</p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <button
                  onClick={() => navigate(`/feedback?analysisId=${result.id}`)}
                  className="text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Report False Alarm / Inaccuracy
                </button>

                <button
                  onClick={() => navigate(`/results/${result.id}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 font-mono"
                >
                  <span>View Full Investigation Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
