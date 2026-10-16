import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Shield,
  Calendar,
  Terminal,
  RefreshCw,
  AlertCircle,
  Star,
  Send,
  MessageSquareQuote,
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ScoreGauge } from '../components/ScoreGauge';
import { useAuth } from '../context/AuthContext';

export const AnalysisResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // In-Page Result Feedback States
  const [showFeedback, setShowFeedback] = useState(false);
  const [fbRating, setFbRating] = useState(5);
  const [fbCategory, setFbCategory] = useState<'false_positive' | 'missed_threat' | 'incorrect_result' | 'general'>('false_positive');
  const [fbMessage, setFbMessage] = useState('');
  const [fbLoading, setFbLoading] = useState(false);
  const [fbSubmitted, setFbSubmitted] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);

  const handleResultFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbMessage.trim()) {
      setFbError('Please provide your feedback notes.');
      return;
    }
    setFbLoading(true);
    setFbError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          analysisId: id,
          category: fbCategory,
          rating: fbRating,
          message: fbMessage.trim(),
        }),
      });

      if (!res.ok) throw new Error('Feedback submission failed.');
      setFbSubmitted(true);
      setFbMessage('');
    } catch (err: any) {
      setFbError(err.message || 'Error logging feedback.');
    } finally {
      setFbLoading(false);
    }
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/analyses/${id}`);
        if (!response.ok) {
          throw new Error('Analysis dossier could not be located.');
        }
        const data = await response.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load analysis record.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnalysis();
    }
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybershield_dossier_${result.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080D1A] flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Retrieving digital threat dossier...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-[#080D1A] py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-[#0E172B] border border-slate-800 p-8 rounded-xl space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Record Not Found</h2>
          <p className="text-xs text-slate-400">{error || 'This analysis record does not exist or has been purged.'}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-xs text-white rounded hover:bg-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080D1A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share Link'}</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Dossier</span>
            </button>
          </div>
        </div>

        {/* Dossier Card */}
        <div className="bg-[#0E172B] border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-6">
          
          {/* Header Banner */}
          <div className="p-6 sm:p-8 bg-[#121E38] border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <RiskBadge level={result.riskLevel} size="lg" />
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700 uppercase">
                  Engine: {result.type}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(result.createdAt).toLocaleString()}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {result.title || 'Threat Investigation Dossier'}
              </h1>

              <p className="text-base font-medium text-cyan-300 leading-snug">
                {result.verdict}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-4">
              <ScoreGauge score={result.score} riskLevel={result.riskLevel} size="lg" />
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Target Inspected */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                Inspected Content Reference
              </span>
              <div className="p-4 rounded-lg bg-[#080D1A] border border-slate-800 font-mono text-xs text-slate-200 break-all leading-relaxed">
                {result.target}
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                Executive Forensic Summary
              </span>
              <p className="text-sm text-slate-200 leading-relaxed bg-[#080D1A] p-4 rounded-lg border border-slate-800">
                {result.summary}
              </p>
            </div>

            {/* Indicators */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                Documented Risk Indicators ({result.indicators?.length || 0})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.indicators?.map((ind, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-[#080D1A] border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
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

            {/* Recommendations */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                Actionable Defense Procedures
              </span>
              <div className="space-y-2">
                {result.recommendations?.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-lg bg-[#080D1A] border border-slate-800 text-xs text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Limitations & Uncertainty Disclosure */}
            <div className="p-4 rounded-lg bg-[#0A1122] border border-slate-800/80 space-y-1 text-xs text-slate-400">
              <strong className="text-slate-300 block">Uncertainty & Detection Limits:</strong>
              <p className="leading-relaxed">{result.uncertaintyExplanation}</p>
            </div>

            {/* Inline Accuracy Feedback Module */}
            <div className="p-5 rounded-xl bg-[#090F1E] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  <MessageSquareQuote className="w-4 h-4" />
                  <span>Dossier Accuracy Feedback</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFeedback(!showFeedback)}
                  className="text-xs font-mono text-cyan-400 hover:underline"
                >
                  {showFeedback ? 'Hide Form' : 'Submit Feedback on this Result'}
                </button>
              </div>

              {showFeedback && (
                fbSubmitted ? (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Thank you! Your accuracy observation on {result.id} was recorded.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFbSubmitted(false)}
                      className="text-xs underline text-slate-300 hover:text-white"
                    >
                      New Note
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleResultFeedback} className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-mono text-slate-400 block mb-1">Feedback Category:</label>
                        <select
                          value={fbCategory}
                          onChange={(e) => setFbCategory(e.target.value as any)}
                          className="w-full bg-[#080D1A] border border-slate-700 rounded p-2 text-slate-200"
                        >
                          <option value="false_positive">False Positive (Benign marked unsafe)</option>
                          <option value="missed_threat">Missed Threat / Evasion Cues</option>
                          <option value="incorrect_result">Classification Discrepancy</option>
                          <option value="general">General Forensic Feedback</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-mono text-slate-400 block mb-1">Accuracy Rating:</label>
                        <div className="flex items-center gap-1.5 pt-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFbRating(star)}
                              className="text-amber-400 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= fbRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-xs font-mono text-slate-400 ml-2">{fbRating} / 5</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-1">Specific Observation:</label>
                      <textarea
                        rows={2}
                        value={fbMessage}
                        onChange={(e) => setFbMessage(e.target.value)}
                        placeholder="Explain why this classification was accurate or how it diverged from expected behavior..."
                        className="w-full bg-[#080D1A] border border-slate-700 rounded p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        disabled={fbLoading}
                      />
                    </div>

                    {fbError && (
                      <div className="p-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>{fbError}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={fbLoading || !fbMessage.trim()}
                        className="px-4 py-1.5 rounded text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40"
                      >
                        {fbLoading ? 'Submitting...' : 'Submit Dossier Feedback'}
                      </button>
                    </div>
                  </form>
                )
              )}
            </div>

            {/* Technical Telemetry Metadata */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Model Engine: {result.technicalDetails?.model || 'gemini-3.8-flash'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={`/feedback?analysisId=${result.id}`}
                  className="hover:text-cyan-400 underline transition-colors"
                >
                  Full Feedback Center
                </Link>
                <span>·</span>
                <Link
                  to={`/analyze/${result.type}`}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Analyze Another {result.type.toUpperCase()}
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
