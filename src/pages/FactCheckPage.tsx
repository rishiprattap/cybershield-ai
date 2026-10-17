import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Globe,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Copy,
  Check,
  Clock,
  Layers,
  Info,
  Filter,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FactCheckReport, ExtractedClaim, SourceEvidence } from '../types';
import { FactVerdictBadge } from '../components/FactVerdictBadge';

export const FactCheckPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'text' | 'url'>('text');
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<FactCheckReport | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [modelInfo, setModelInfo] = useState<{
    configuredModel: string;
    hasKey: boolean;
    aiAvailable: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/model-status')
      .then((r) => r.json())
      .then((data) => setModelInfo(data))
      .catch(() => {});
  }, []);

  const samplePresets = [
    {
      label: 'Supported Claim',
      type: 'text' as const,
      preview: 'NASA landed Perseverance on Mars in Feb 2021',
      content: 'NASA landed the Perseverance rover on Mars in February 2021.',
      tag: 'Supported',
      tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
    {
      label: 'Contradicted Claim',
      type: 'text' as const,
      preview: 'Eiffel Tower relocated to Lyon during 1998 World Cup',
      content: 'The Eiffel Tower was permanently relocated from Paris to Lyon during the 1998 World Cup.',
      tag: 'Contradicted',
      tagColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    },
    {
      label: 'Ambiguous / Mixed',
      type: 'text' as const,
      preview: 'Electric vehicles produce zero lifetime emissions',
      content: 'Electric vehicles produce zero lifetime carbon emissions and have no environmental impact.',
      tag: 'Mixed Context',
      tagColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
    {
      label: 'SSRF Security Test',
      type: 'url' as const,
      preview: 'Private loopback IP address (127.0.0.1)',
      content: 'http://127.0.0.1:8080/internal/admin/secret',
      tag: 'Security Guard',
      tagColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
  ];

  // Auto-load report if id passed in search params
  useEffect(() => {
    const reportId = searchParams.get('reportId');
    if (reportId) {
      fetchReportById(reportId);
    }
  }, [searchParams]);

  const fetchReportById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/fact-check/${id}`);
      if (!res.ok) throw new Error('Saved fact-check report not found.');
      const data: FactCheckReport = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err?.message || 'Could not load report.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCheck = async (overrideType?: 'text' | 'url', overrideContent?: string) => {
    const inputType = overrideType || activeTab;
    const content = overrideContent !== undefined ? overrideContent : (inputType === 'text' ? textContent : urlContent);

    if (!content.trim()) {
      setError(
        inputType === 'text'
          ? 'Please enter a factual statement or paste article text to check.'
          : 'Please enter a valid article URL.'
      );
      return;
    }

    setError(null);
    setLoading(true);
    setReport(null);

    // Multi-stage indicator
    setLoadingStep('1/4: Extracting checkable factual assertions...');
    const t1 = setTimeout(() => {
      setLoadingStep('2/4: Querying independent web evidence...');
    }, 1200);
    const t2 = setTimeout(() => {
      setLoadingStep('3/4: Ranking sources by authority & deduplicating...');
    }, 2500);
    const t3 = setTimeout(() => {
      setLoadingStep('4/4: Comparing claims against evidence & generating report...');
    }, 3800);

    try {
      const response = await fetch('/api/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: inputType,
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fact-checking pipeline encountered an error.');
      }

      setReport(data);
    } catch (err: any) {
      setError(err?.message || 'Fact check failed. Please check network connection.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setLoading(false);
      setLoadingStep('');
    }
  };

  const toggleSources = (claimId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [claimId]: !prev[claimId],
    }));
  };

  const handleCopyReport = () => {
    if (!report) return;
    const textToCopy = `TrustLens Fact Check Report [${report.overall.status}]:\nInput: ${report.rawInput}\nSummary: ${report.overall.summary}\nChecked At: ${new Date(report.checkedAt).toLocaleString()}\n\nClaims:\n${report.claims
      .map(
        (c, idx) =>
          `${idx + 1}. [${c.verdict}] ${c.claimText}\n   ${c.explanation}\n   Citations: ${c.citations.map((cite) => cite.url).join(', ') || 'None'}`
      )
      .join('\n\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080D1A] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-xs tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Trust Lens · Public Evidence Verification Engine</span>
            </div>
            {modelInfo && (
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border ${
                  modelInfo.hasKey
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                }`}
                title={modelInfo.message}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${modelInfo.hasKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>Model: {modelInfo.configuredModel}</span>
                <span>·</span>
                <span>{modelInfo.hasKey ? 'API Key Configured' : 'AI Offline (No API Key)'}</span>
              </div>
            )}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Trust Lens: Check a Factual Claim
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            Verify factual statements and news excerpts against live web evidence. Our engine extracts distinct checkable claims, retrieves and ranks independent sources by institutional authority, and produces transparent verdicts with cited excerpts.
          </p>
        </div>

        {/* Quick Test Presets */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Quick Test Presets (One-click demonstration)
            </span>
            <span className="text-[11px] font-mono text-cyan-400/80">
              No account required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveTab(preset.type);
                  if (preset.type === 'text') {
                    setTextContent(preset.content);
                  } else {
                    setUrlContent(preset.content);
                  }
                  handleRunCheck(preset.type, preset.content);
                }}
                disabled={loading}
                className="text-left p-3 rounded-lg bg-[#0D1527] hover:bg-[#131F3A] border border-slate-800 hover:border-cyan-500/40 transition-all group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {preset.label}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${preset.tagColor}`}
                  >
                    {preset.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.preview}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Input Formulation Card */}
        <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-6 space-y-5 shadow-xl">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Claim or Article Text</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Article URL (SSRF-Guarded)</span>
            </button>
          </div>

          {/* Tab 1: Text Input */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <label htmlFor="claim-text-input" className="text-xs font-mono font-medium text-slate-300 block">
                Enter factual statement, speech transcript, or news snippet:
              </label>
              <textarea
                id="claim-text-input"
                rows={4}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Example: The World Health Organization officially declared the end of the global COVID-19 emergency in May 2023."
                className="w-full bg-[#080D1A] border border-slate-700/80 rounded-lg p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors leading-relaxed"
                disabled={loading}
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Preserves dates, numbers, geography. Flags missing context.</span>
                <span>{textContent.length} characters</span>
              </div>
            </div>
          )}

          {/* Tab 2: URL Input */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label htmlFor="claim-url-input" className="text-xs font-mono font-medium text-slate-300 block">
                Article Web Address (HTTP/HTTPS):
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  id="claim-url-input"
                  type="url"
                  value={urlContent}
                  onChange={(e) => setUrlContent(e.target.value)}
                  placeholder="https://www.reuters.com/article/... or public news link"
                  className="w-full bg-[#080D1A] border border-slate-700/80 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                  disabled={loading}
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-300">
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Safety Guard Enabled</span>
                </div>
                <p>
                  URLs are inspected with DNS resolution and private IP blocking (127.0.0.0/8, 10.0.0.0/8, 192.168.0.0/16, metadata endpoints). An 8-second timeout and 2MB download limit apply. If a page requires JavaScript or blocks robots, please copy and paste the text into the text tab.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Inspection Notice</span>
                <p className="leading-relaxed text-rose-200/90">{error}</p>
              </div>
            </div>
          )}

          {/* Action Button & Loading Status */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-400 font-mono">
              {loading ? (
                <div className="flex items-center gap-2 text-cyan-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{loadingStep || 'Processing verification pipeline...'}</span>
                </div>
              ) : (
                <span>Evidence ranked by primary source authority & date</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleRunCheck()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all cursor-pointer shadow-md shadow-cyan-500/20 disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Web Evidence...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Verify Claims Against Web Evidence</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Fact-Check Report Output Card */}
        {report && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Report Header Card */}
            <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
              {report.isDemoExample && (
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
                  <Info className="w-3.5 h-3.5" />
                  <span>[Demo Example] Pre-verified benchmark record</span>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Fact Check Dossier #{report.id}
                  </span>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {report.extractedArticleTitle || 'Factual Evidence Assessment'}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyReport}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Report'}</span>
                  </button>
                </div>
              </div>

              {/* Input Context Box */}
              <div className="p-3.5 rounded-lg bg-[#080D1A] border border-slate-800/80 text-xs font-mono text-slate-300 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                  Input Investigated ({report.inputType}):
                </span>
                <p className="line-clamp-3 leading-relaxed text-slate-200">
                  {report.rawInput}
                </p>
              </div>

              {/* Explicit AI Unavailability / Failure Notification */}
              {report.aiStatus === 'UNAVAILABLE' && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center gap-2 font-semibold text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>AI Analysis Unavailable — Factual Verification Not Performed</span>
                  </div>
                  <p className="leading-relaxed text-amber-200/90 text-[11px]">
                    GEMINI_API_KEY is not configured in the server environment. Automated claim extraction and evidence comparison require an active LLM reasoning engine.
                    To preserve strict factual integrity, keyword heuristics are disabled and will not guess verdicts. All assertions remain UNVERIFIED. Retrieved web sources are provided below for manual review.
                  </p>
                </div>
              )}

              {report.aiStatus === 'ERROR' && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center gap-2 font-semibold text-rose-300">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>AI Analysis Incomplete — Upstream Gemini Request Error</span>
                  </div>
                  <p className="leading-relaxed text-rose-200/90 text-[11px]">
                    {report.aiStatusMessage || 'The Gemini API call failed during claim evaluation.'}
                    This application does not substitute keyword heuristics for factual verification. All claims remain UNVERIFIED. Retrieved web evidence is provided below for manual review.
                  </p>
                </div>
              )}

              {/* Overall Assessment Banner */}
              <div
                className={`p-5 rounded-xl border ${
                  report.overall.status === 'SUPPORTED'
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : report.overall.status === 'CONTRADICTED'
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                    : report.overall.status === 'MIXED'
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-sky-950/30 border-sky-500/40 text-sky-200'
                } space-y-3`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FactVerdictBadge
                      verdict={
                        report.overall.status === 'INCOMPLETE'
                          ? 'UNVERIFIED'
                          : report.overall.status
                      }
                      size="lg"
                    />
                    <span className="text-sm font-semibold tracking-tight">
                      Overall Synthesis
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
                    Rule: {report.overall.ruleApplied}
                  </div>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-slate-200 font-medium">
                  {report.overall.summary}
                </p>

                {/* Explicit Claims Count Statistics (NO fabricated percentage) */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900/40 border border-slate-800/60 text-center">
                    <span className="text-slate-400 block text-[10px] uppercase">Total Claims</span>
                    <span className="text-base font-bold text-white">{report.overall.totalClaims}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/40 border border-slate-800/60 text-center">
                    <span className="text-emerald-400 block text-[10px] uppercase">Supported</span>
                    <span className="text-base font-bold text-emerald-300">{report.overall.supportedCount}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/40 border border-slate-800/60 text-center">
                    <span className="text-rose-400 block text-[10px] uppercase">Contradicted</span>
                    <span className="text-base font-bold text-rose-300">{report.overall.contradictedCount}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/40 border border-slate-800/60 text-center">
                    <span className="text-sky-400 block text-[10px] uppercase">Unverified / Mixed</span>
                    <span className="text-base font-bold text-sky-300">
                      {report.overall.unverifiedCount + report.overall.mixedCount}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  * Note: Grounded in discrete claim counts and retrieved evidence. This system does not present an arbitrary probability percentage as a measure of truth.
                </div>
              </div>

              {/* Technical / Meta info row */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-500 pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Checked: {new Date(report.checkedAt).toLocaleTimeString()}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <span>Model: {report.modelUsed}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        report.aiStatus === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : report.aiStatus === 'UNAVAILABLE'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      AI: {report.aiStatus}
                    </span>
                  </span>
                </div>
                {report.processingTimeMs && (
                  <span>Pipeline Duration: {(report.processingTimeMs / 1000).toFixed(2)}s</span>
                )}
              </div>
            </div>

            {/* Extracted Claim Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300">
                  Extracted Assertions & Corroborating Evidence ({report.claims.length})
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  Each claim verified independently
                </span>
              </div>

              {report.claims.map((claim, index) => (
                <div
                  key={claim.id || index}
                  className="bg-[#0D1527] border border-slate-800 rounded-xl p-5 space-y-4 transition-all"
                >
                  {/* Claim Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          Claim #{index + 1}
                        </span>
                        {claim.missingContext && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300"
                            title="Context qualification missing in original text"
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>Context flag: {claim.missingContext}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                        "{claim.claimText}"
                      </p>
                    </div>

                    <FactVerdictBadge verdict={claim.verdict} size="md" />
                  </div>

                  {/* Explanation */}
                  <div className="p-3.5 rounded-lg bg-[#080D1A] border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                      Evidence Analysis:
                    </span>
                    <p>{claim.explanation}</p>
                  </div>

                  {/* Citations Box */}
                  {claim.citations && claim.citations.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 block">
                        Direct Evidence Citations:
                      </span>
                      <div className="space-y-2">
                        {claim.citations.map((cite, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="space-y-0.5 flex-1">
                              <a
                                href={cite.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-cyan-300 hover:text-cyan-200 hover:underline inline-flex items-center gap-1.5"
                              >
                                <span>{cite.title || cite.url}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                              <p className="text-slate-400 text-[11px] italic line-clamp-2">
                                "{cite.quoteOrEvidence}"
                              </p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 shrink-0">
                              {new URL(cite.url).hostname.replace(/^www\./, '')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Toggle Collapsible Searched Sources Drawer */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => toggleSources(claim.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      {expandedSources[claim.id] ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Hide Retrieved Sources ({claim.sourcesSearched.length})</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Inspect Ranked Sources & Scoring Rules ({claim.sourcesSearched.length})</span>
                        </>
                      )}
                    </button>

                    {expandedSources[claim.id] && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-slate-800/50">
                        <div className="text-[11px] font-mono text-slate-500">
                          Sources ranked by keyword relevance, primary authority (.gov/.edu/wire), and deduplicated:
                        </div>
                        {claim.sourcesSearched.map((src) => (
                          <div
                            key={src.id}
                            className="p-3 rounded-lg bg-[#080D1A] border border-slate-800 text-xs space-y-1.5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-slate-200 hover:text-cyan-300 inline-flex items-center gap-1"
                              >
                                <span>{src.title}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                                  Rank Score: {src.rankScore}/100
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">
                                  {src.sourceType === 'extracted_article' ? 'Full Article' : 'Search Snippet'}
                                </span>
                              </div>
                            </div>

                            <p className="text-slate-400 text-[11px] leading-relaxed">
                              {src.snippet}
                            </p>

                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500 pt-1">
                              <span className="text-cyan-400/90 font-medium">{src.domain}</span>
                              {src.rankReasons.map((reason, rIdx) => (
                                <span key={rIdx} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Back to top or check another */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setTextContent('');
                  setUrlContent('');
                }}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                ↑ Check Another Statement or URL
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
