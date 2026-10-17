import React, { useState } from 'react';
import { BookOpen, ShieldCheck, CheckCircle2, XCircle, ArrowRight, Sparkles, AlertTriangle, Eye, Lock, Smartphone, Wifi, Key } from 'lucide-react';
import { ASSETS } from '../assets/images';

export const AcademyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guides' | 'quiz'>('guides');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const guides = [
    {
      id: 'phishing-101',
      category: 'Phishing',
      title: 'The Anatomy of a Modern Phishing Email',
      desc: 'How malicious actors leverage urgent countdowns, authority impersonation, and spoofed display names to force hasty decisions.',
      difficulty: 'Beginner',
      readTime: '4 min',
      icon: AlertTriangle,
      keyTakeaway: 'Always verify unexpected urgent demands through a secondary channel (e.g. phone call or official app) before clicking.',
      bulletPoints: [
        'Watch for artificial deadlines ("Your account closes in 15 minutes").',
        'Inspect the raw sender email, not just the friendly display name.',
        'Never transmit two-factor authentication codes to incoming callers or forms.'
      ]
    },
    {
      id: 'url-lookalikes',
      category: 'URL Security',
      title: 'Spotting Lookalike Domains & Typosquatting',
      desc: 'Understand how attackers register domains like "paypa1.com" or nest subdomains like "paypal.com.verify-login.ru" to deceive victims.',
      difficulty: 'Intermediate',
      readTime: '5 min',
      icon: Eye,
      keyTakeaway: 'Read URLs from right to left before the first forward slash to identify the true authoritative apex domain.',
      bulletPoints: [
        'Pay attention to character substitutions (0 for O, 1 for l, rn for m).',
        'Look at the final domain before the first slash: in "google.com.attacker.com", the host is attacker.com.',
        'Be wary of unprompted URL shorteners hiding the true destination link.'
      ]
    },
    {
      id: 'mfa-security',
      category: 'Account Defense',
      title: 'Beyond Passwords: The Power of Multi-Factor Authentication',
      desc: 'Why SMS-based codes are vulnerable to SIM swapping, and why authenticator apps (TOTP) or hardware security keys provide superior defense.',
      difficulty: 'Beginner',
      readTime: '3 min',
      icon: Key,
      keyTakeaway: 'Migrate high-value accounts (email, banking, primary password manager) from SMS OTP to app-based TOTP or FIDO2 keys.',
      bulletPoints: [
        'SMS messages are unencrypted and vulnerable to cellular carrier redirects.',
        'Authenticator apps generate time-based codes locally on your device without cellular dependency.',
        'Hardware keys (YubiKey) provide cryptographic immunity against standard phishing proxy kits.'
      ]
    },
    {
      id: 'deepfakes-ai',
      category: 'Media Forensics',
      title: 'Detecting AI-Generated Images & Video Manipulation',
      desc: 'Recognizing synthetic visual artifacts, inconsistent lighting axes, blurry ear/teeth textures, and the fundamental limits of automated detection.',
      difficulty: 'Advanced',
      readTime: '6 min',
      icon: Sparkles,
      keyTakeaway: 'Never treat lack of obvious visual flaws as absolute proof of authenticity without cryptographic provenance (C2PA).',
      bulletPoints: [
        'Examine asymmetrical elements: eyeglasses, earrings, teeth boundaries, and iris reflection shapes.',
        'Check background perspective consistency and text rendering in signs or labels.',
        'Recognize that social media compression can degrade subtle artifact signals.'
      ]
    },
    {
      id: 'wifi-hygiene',
      category: 'Network Safety',
      title: 'Public Wi-Fi Safety & Evil Twin Hotspots',
      desc: 'How rogue access points at airports and cafes harvest unencrypted credentials, and how modern HTTPS and VPNs protect traffic.',
      difficulty: 'Beginner',
      readTime: '4 min',
      icon: Wifi,
      keyTakeaway: 'Turn off automatic Wi-Fi connection on mobile devices when moving through public venues.',
      bulletPoints: [
        'Rogue hotspots often clone the exact SSID name of coffee shops or hotel lobbies.',
        'Verify your browser shows valid HTTPS certificates before accessing sensitive portals.',
        'Avoid conducting banking or entering primary credentials on public networks without a secure tunnel.'
      ]
    },
    {
      id: 'social-engineering',
      category: 'Human Factor',
      title: 'Social Engineering & Pretexting Scenarios',
      desc: 'How attackers research targets on LinkedIn to pose as internal IT support, vendors, or recruiters requesting remote desktop access.',
      difficulty: 'Intermediate',
      readTime: '5 min',
      icon: Lock,
      keyTakeaway: 'Adopt a zero-trust mindset: unsolicited callers offering urgent technical fixes should be disconnected and called back via official company directories.',
      bulletPoints: [
        'Attackers often build trust by referencing real colleague names gleaned from social media.',
        'Never install remote desktop software (TeamViewer, AnyDesk) prompted by unsolicited calls.',
        'Establish out-of-band verification procedures for financial wire authorization.'
      ]
    }
  ];

  const quizQuestions = [
    {
      question: "You receive an SMS saying: 'Your FedEx package #4928 is delayed due to an incorrect address. Update within 1 hour at fedx-tracking.xyz/confirm or package will be returned.' What is the safest course of action?",
      options: [
        "Click the link immediately to prevent the package from being returned.",
        "Reply with 'STOP' to unsubscribe from the sender.",
        "Do not click the link; open the official FedEx app or website directly and search the tracking number.",
        "Forward the link to your friends to see if they recognize the URL."
      ],
      correct: 2,
      explanation: "Directly checking official tracking numbers through official apps is the safest action. The high urgency ('within 1 hour') and non-official TLD (.xyz) strongly indicate smishing."
    },
    {
      question: "In the URL 'https://chase.com.security-verify.net/login', which host actually controls the server you are connecting to?",
      options: [
        "chase.com",
        "security-verify.net",
        "https",
        "login"
      ],
      correct: 1,
      explanation: "In standard DNS hierarchy, the authoritative domain is the text immediately preceding the first forward slash (security-verify.net). 'chase.com' here is simply a deceptive subdomain."
    },
    {
      question: "Why should you clearly distinguish 'AI-generation likelihood' from 'photo manipulation' when analyzing an image?",
      options: [
        "Because AI-generated images are always high risk, while edited images are always harmless.",
        "Because synthesizing an entire new image via generative diffusion is technically distinct from retouching or splicing an existing photo.",
        "Because photo manipulation only occurs on desktop computers, not on the web.",
        "Because social media platforms never allow manipulated photos."
      ],
      correct: 1,
      explanation: "Generative synthesis (e.g. Midjourney creating a face) and photo manipulation (e.g. Photoshop splicing a badge date) are fundamentally different forensic processes with different visual signatures."
    },
    {
      question: "An unknown caller claims to be your corporate IT helpdesk, saying: 'We noticed a critical virus on your laptop. Download this quick remote assist tool so I can patch it.' How should you respond?",
      options: [
        "Follow their instructions immediately since cybersecurity patches are time-sensitive.",
        "Ask them for their employee badge number and then proceed with the installation.",
        "Disconnect the call, do not download any tools, and report the interaction to your official IT department via verified internal channels.",
        "Leave the laptop on and walk away."
      ],
      correct: 2,
      explanation: "Pretexting is a common social engineering tactic. Legitimate internal teams will never object to you hanging up and verifying the request through established internal ticketing or directory channels."
    }
  ];

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (submittedQuiz) return;
    setQuizAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) score++;
    });
    return score;
  };

  const filteredGuides = selectedCategory === 'all'
    ? guides
    : guides.filter(g => g.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#080D1A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Trust Lens Academy & Defense Center</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Learn to Spot Deception with Real-World Cyber Knowledge
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Master the mental models behind phishing, typosquatting, social engineering, and synthetic media. Education is the first and strongest line of defense.
          </p>

          {/* Mode Switcher */}
          <div className="pt-3 flex items-center justify-center gap-2">
            <button
              onClick={() => setActiveTab('guides')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'guides'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Educational Guides ({guides.length})
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Cyber Readiness Quiz ({quizQuestions.length} Questions)
            </button>
          </div>
        </div>

        {activeTab === 'guides' ? (
          <div className="space-y-8">
            {/* Category Filter */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['all', 'Phishing', 'URL Security', 'Account Defense', 'Media Forensics', 'Network Safety', 'Human Factor'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Guides' : cat}
                </button>
              ))}
            </div>

            {/* Guides Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <div
                    key={guide.id}
                    className="p-6 rounded-xl bg-[#0E172B] border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono text-cyan-400 text-[11px] uppercase tracking-wider">
                          {guide.category}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-mono">
                          <span>{guide.readTime}</span>
                          <span>·</span>
                          <span className="text-slate-500">{guide.difficulty}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-display text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {guide.title}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {guide.desc}
                      </p>

                      <div className="p-3 rounded-lg bg-[#080D1A] border border-slate-800/80 space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                          Core Defensive Takeaway:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {guide.keyTakeaway}
                        </p>
                      </div>

                      <div className="space-y-1 pt-1">
                        {guide.bulletPoints.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-400">
                            <span className="text-cyan-400 font-mono">›</span>
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-xs font-mono text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
                        <span>Safe Practice Standard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Interactive Quiz Tab */
          <div className="max-w-3xl mx-auto space-y-8 bg-[#0E172B] border border-slate-800 p-6 sm:p-8 rounded-xl shadow-xl">
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <span className="text-xs font-mono uppercase text-cyan-400 font-semibold">
                Self-Assessment Module
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                Cybersecurity Threat Recognition Challenge
              </h2>
              <p className="text-xs text-slate-400">
                Answer the 4 realistic digital security scenarios below to measure your scam-detection reflexes.
              </p>
            </div>

            <div className="space-y-6">
              {quizQuestions.map((q, qIndex) => {
                const userChoice = quizAnswers[qIndex];
                const isCorrect = userChoice === q.correct;

                return (
                  <div
                    key={qIndex}
                    className="p-5 rounded-lg bg-[#080D1A] border border-slate-800/80 space-y-3"
                  >
                    <span className="text-xs font-mono text-cyan-400 block font-semibold uppercase">
                      Scenario {qIndex + 1} of {quizQuestions.length}
                    </span>
                    <h3 className="text-sm font-semibold text-white leading-relaxed">
                      {q.question}
                    </h3>

                    <div className="space-y-2 pt-1">
                      {q.options.map((opt, optIndex) => {
                        const isSelected = userChoice === optIndex;
                        let optionStyle = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300';

                        if (submittedQuiz) {
                          if (optIndex === q.correct) {
                            optionStyle = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold';
                          } else if (isSelected && optIndex !== q.correct) {
                            optionStyle = 'bg-rose-500/10 border-rose-500/40 text-rose-300 line-through';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-cyan-500/10 border-cyan-400 text-cyan-200 font-semibold';
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => handleSelectOption(qIndex, optIndex)}
                            disabled={submittedQuiz}
                            className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${optionStyle}`}
                          >
                            <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center font-mono text-[10px] shrink-0">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback explanation when submitted */}
                    {submittedQuiz && (
                      <div
                        className={`p-3 rounded-lg text-xs leading-relaxed ${
                          isCorrect
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        <strong className="block mb-1">
                          {isCorrect ? '✓ Correct Answer!' : '✗ Incorrect choice.'}
                        </strong>
                        <p className="text-slate-300">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {!submittedQuiz ? (
                <button
                  type="button"
                  onClick={() => setSubmittedQuiz(true)}
                  disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  className="px-6 py-2.5 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Submit & Score Answers ({Object.keys(quizAnswers).length}/{quizQuestions.length})
                </button>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono text-slate-400">Score Result:</span>
                    <span className="font-mono text-lg font-bold text-cyan-300 tabular-nums block">
                      {calculateScore()} / {quizQuestions.length} Correct ({Math.round((calculateScore() / quizQuestions.length) * 100)}%)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setQuizAnswers({});
                      setSubmittedQuiz(false);
                    }}
                    className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded border border-slate-700"
                  >
                    Retake Quiz
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
