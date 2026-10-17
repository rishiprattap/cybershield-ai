import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquareQuote, Star, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FeedbackItem } from '../types';

export const FeedbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [category, setCategory] = useState<FeedbackItem['category']>('general');
  const [rating, setRating] = useState<number>(5);
  const [analysisId, setAnalysisId] = useState<string>(searchParams.get('analysisId') || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recentFeedbacks, setRecentFeedbacks] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    fetch('/api/feedback')
      .then((res) => res.json())
      .then((data) => setRecentFeedbacks(data))
      .catch((err) => console.error('Failed to load feedback:', err));
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide feedback message details.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          analysisId: analysisId.trim() || undefined,
          category,
          rating,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback.');
      }

      setSubmitted(true);
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Submission error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D1A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to previous screen</span>
        </button>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Community Feedback & Continuous Improvement</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Help Refine Trust Lens Verification Accuracy
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            Report false positives, missed evasion techniques, or suggestion enhancements. Your real-world feedback is reviewed by our engineering and security teams.
          </p>
        </div>

        {/* Feedback Form Card */}
        <div className="bg-[#0E172B] border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl space-y-6">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Feedback Logged Successfully</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Thank you for contributing to digital threat intelligence. Your input helps calibrate heuristic weights and model precision.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg cursor-pointer"
              >
                Submit Additional Feedback
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Category Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-medium text-slate-300 block">
                  Feedback Category:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#080D1A] border border-slate-700/80 rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="false_positive">False Positive (Benign item marked as threat)</option>
                  <option value="missed_threat">Missed Threat (Harmful item not caught)</option>
                  <option value="incorrect_result">Incorrect Risk Classification</option>
                  <option value="image_concern">Image Forensics Concern</option>
                  <option value="chatbot">AI Chatbot Answer Feedback</option>
                  <option value="usability">Usability or Interface Experience</option>
                  <option value="feature_request">Feature Request / Suggestion</option>
                  <option value="general">General Platform Feedback</option>
                </select>
              </div>

              {/* Star Rating */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-medium text-slate-300 block">
                  Overall Experience Rating (Optional):
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    {rating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Optional Analysis Reference */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-300 block">
                  Analysis Dossier ID (Optional):
                </label>
                <input
                  type="text"
                  value={analysisId}
                  onChange={(e) => setAnalysisId(e.target.value)}
                  placeholder="e.g. cs-analysis-101"
                  className="w-full bg-[#080D1A] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-300 block">
                  Detailed Comments / Observations:
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what occurred, any unexpected classifications, or how we can improve..."
                  className="w-full bg-[#080D1A] border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed resize-y"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400 font-mono">
                  Anonymous or linked to account session
                </span>

                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 shadow-sm shadow-cyan-500/20 cursor-pointer transition-all"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

        {/* Public Feedback Stream */}
        {recentFeedbacks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Recent Community Contributions ({recentFeedbacks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 rounded-lg bg-[#0E172B] border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 uppercase text-[10px] tracking-wider">
                      {fb.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: fb.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed italic">
                    "{fb.message}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>{fb.analysisId ? `Ref: ${fb.analysisId}` : 'General Feedback'}</span>
                    <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
