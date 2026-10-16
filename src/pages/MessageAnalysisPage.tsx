import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Sparkles, AlertCircle, ArrowRight, RefreshCw, CheckCircle2, Copy, Check } from 'lucide-react';
import { AnalysisResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ScoreGauge } from '../components/ScoreGauge';
import { useAuth } from '../context/AuthContext';

export const MessageAnalysisPage: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const samplePresets = [
    {
      title: 'Banking Security Smishing',
      category: 'SMS Phishing',
      content: 'URGENT CHASE SECURITY: Your debit card was used for $892.40 at Apple Store NYC. If this was NOT you, immediately verify your PIN and identity at http://chase-auth-alert.top/verify or card will be permanently disabled.',
    },
    {
      title: 'CEO Urgent Wire Transfer',
      category: 'Business Email Compromise (BEC)',
      content: 'Hi Team, I am currently boarding a flight with limited reception. Need you to immediately process a confidential vendor deposit of $48,500 to the attached account before 4:00 PM today. Do not call me, reply directly to this email with wire confirmation.',
    },
    {
      title: 'Legitimate Project Update',
      category: 'Benign Communication',
      content: 'Good morning everyone! Just a reminder that our quarterly sprint review is scheduled for Thursday at 2:00 PM in Conference Room B. Please add your slide updates to the shared team drive by Wednesday noon. Thank you!',
    },
  ];

  const handleAnalyze = async (overrideText?: string) => {
    const textToAnalyze = overrideText || text;
    if (!textToAnalyze.trim()) {
      setError('Please enter or paste the message you want to analyze.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/analyze/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to inspect message.');
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Inspection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyVerdict = () => {
    if (!result) return;
    navigator.clipboard.writeText(`CyberShield AI Analysis [${result.riskLevel}]: ${result.verdict}\n\nSummary: ${result.summary}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080D1A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <Mail className="w-3.5 h-3.5" />
            <span>Threat Detection Engine · Text & Messaging</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Suspicious Message & Email Inspector
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            Paste suspicious emails, SMS smishing alerts, or social media messages. Our engine analyzes urgency coercion, brand spoofing, credential traps, and deceptive requests.
          </p>
        </div>

        {/* Preset Samples to test immediately */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-slate-400 block uppercase tracking-wider">
            Quick Test Presets (Click to load & analyze)
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {samplePresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => {
                  setText(preset.content);
                  handleAnalyze(preset.content);
                }}
                className="text-left p-3.5 rounded-lg bg-[#0E172B] hover:bg-[#131F3A] border border-slate-800 hover:border-cyan-500/40 transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                    {preset.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {preset.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.content}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form Card */}
        <div className="bg-[#0D1527] border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <label htmlFor="message-input" className="text-xs font-mono font-medium text-slate-300">
              Message Content for Inspection:
            </label>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {text.length} / 5,000 chars
            </span>
          </div>

          <textarea
            id="message-input"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste suspicious text here... (e.g. 'Your account has been suspended! Click link to verify immediately...')"
            className="w-full bg-[#080D1A] border border-slate-700/80 rounded-lg p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors resize-y leading-relaxed font-sans"
            maxLength={5000}
            disabled={loading}
          />

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Content is inspected in memory. Never shares sensitive credentials.
            </span>

            <div className="flex items-center gap-3">
              {text && (
                <button
                  type="button"
                  onClick={() => {
                    setText('');
                    setResult(null);
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => handleAnalyze()}
                disabled={loading || !text.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Indicators...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze Message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Analysis Result */}
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
                <h2 className="font-display text-xl font-bold text-white">
                  {result.title}
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
              {/* Summary */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Executive Findings Summary
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed bg-[#080D1A] p-4 rounded-lg border border-slate-800/80">
                  {result.summary}
                </p>
              </div>

              {/* Observed Threat Indicators */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Key Indicators & Forensic Signals
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

              {/* Actionable Recommendations */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Recommended Protective Actions
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

              {/* Transparency & Limitations */}
              <div className="p-4 rounded-lg bg-[#0A1020] border border-slate-800/80 text-xs text-slate-400 space-y-1">
                <strong className="text-slate-300 block">Forensic Context & Uncertainty:</strong>
                <p className="leading-relaxed">{result.uncertaintyExplanation}</p>
              </div>

              {/* Controls */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyVerdict}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Summary' : 'Copy Summary'}</span>
                  </button>

                  <button
                    onClick={() => navigate(`/feedback?analysisId=${result.id}`)}
                    className="text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    Report Result Accuracy
                  </button>
                </div>

                <button
                  onClick={() => navigate(`/results/${result.id}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 font-mono"
                >
                  <span>Open Permanent Dossier View</span>
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
