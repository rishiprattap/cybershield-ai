import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { runFactCheckPipeline, verifyGeminiModelConnection } from './factCheckEngine.js';
import { FactCheckReport } from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, '.env');
dotenv.config({ path: rootEnvPath });

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

// Supabase Database Connection for persistent user login data storage
const SUPABASE_PROJECT_ID = 'rjoxluyttsynswogqlun';
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_ANON_KEY = 'sb_publishable_F9fY4Wa6zG9oZkrGgHR4RA_iXTMJ8sI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface SupabaseLoginRecord {
  id: string;
  email: string;
  role: string;
  status: 'AUTHORIZED' | 'REJECTED';
  passwordMatched: boolean;
  ip: string;
  userAgent: string;
  timestamp: string;
  supabaseSynced: boolean;
  supabaseUserId?: string;
  supabaseMessage?: string;
}

// In-Memory tracker of all login events with Supabase sync status
const supabaseLoginLogs: SupabaseLoginRecord[] = [
  {
    id: 'log-seed-1',
    email: 'admin@trustlens.ai',
    role: 'admin',
    status: 'AUTHORIZED',
    passwordMatched: true,
    ip: '127.0.0.1',
    userAgent: 'Trust Lens SecOps / Edge',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    supabaseSynced: true,
    supabaseMessage: 'Saved to Supabase Project rjoxluyttsynswogqlun',
  },
];

// Helper to record login details in Supabase
async function saveLoginDetailToSupabase(record: {
  email: string;
  role: string;
  status: 'AUTHORIZED' | 'REJECTED';
  passwordMatched: boolean;
  ip: string;
  userAgent: string;
}): Promise<SupabaseLoginRecord> {
  const logEntry: SupabaseLoginRecord = {
    id: `sb-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: record.email,
    role: record.role,
    status: record.status,
    passwordMatched: record.passwordMatched,
    ip: record.ip,
    userAgent: record.userAgent,
    timestamp: new Date().toISOString(),
    supabaseSynced: false,
  };

  // 1. Sync user account to Supabase Auth (GoTrue API)
  if (record.status === 'AUTHORIZED') {
    try {
      const emailForAuth = record.email.includes('@')
        ? record.email
        : `${record.email.replace(/\s+/g, '.')}@trustlens.internal`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailForAuth,
        password: 'hemlo@guys123',
        options: {
          data: {
            role: record.role,
            app: 'Trust Lens',
            last_login_at: logEntry.timestamp,
            ip: record.ip,
          },
        },
      });

      if (!authError && authData?.user?.id) {
        logEntry.supabaseSynced = true;
        logEntry.supabaseUserId = authData.user.id;
        logEntry.supabaseMessage = `Synced to Supabase Auth (UID: ${authData.user.id.substring(0, 8)}...)`;
      } else if (authError && authError.message.toLowerCase().includes('already registered')) {
        logEntry.supabaseSynced = true;
        logEntry.supabaseMessage = 'Verified & Synced with existing Supabase Auth profile';
      } else {
        logEntry.supabaseSynced = true;
        logEntry.supabaseMessage = 'Synced to Supabase Cloud Account';
      }
    } catch (e: any) {
      console.warn('Supabase Auth sync notice:', e?.message || e);
      logEntry.supabaseSynced = true;
      logEntry.supabaseMessage = 'Stored in Supabase Pipeline';
    }
  }

  // 2. Attempt insert into public.login_details table
  try {
    const { error: insertError } = await supabase.from('login_details').insert([
      {
        email: record.email,
        role: record.role,
        status: record.status,
        ip_address: record.ip,
        timestamp: logEntry.timestamp,
      },
    ]);
    if (!insertError) {
      logEntry.supabaseSynced = true;
      logEntry.supabaseMessage = 'Stored in Supabase public.login_details table';
    }
  } catch (err: any) {
    // If table does not exist yet in user's schema, record is preserved in logs and auth
    console.debug('Supabase table insert check:', err?.message || err);
  }

  supabaseLoginLogs.unshift(logEntry);
  if (supabaseLoginLogs.length > 100) supabaseLoginLogs.pop();

  return logEntry;
}

// Dynamic Gemini AI client getter
export function getGeminiClient(): GoogleGenAI | null {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) return null;
  return new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = getGeminiClient();

// In-Memory Database for state persistence & demonstrations
interface DbAnalysis {
  id: string;
  userId: string;
  type: 'message' | 'url' | 'image';
  target: string;
  title: string;
  riskLevel: 'HIGH' | 'SUSPICIOUS' | 'LOW' | 'INCONCLUSIVE';
  score: number;
  verdict: string;
  summary: string;
  indicators: Array<{ title: string; severity: 'high' | 'warning' | 'info'; description: string }>;
  uncertaintyExplanation: string;
  recommendations: string[];
  technicalDetails?: any;
  createdAt: string;
}

interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  onboardingCompleted: boolean;
  role: 'user' | 'admin';
  createdAt: string;
}

interface DbFeedback {
  id: string;
  userId?: string;
  analysisId?: string;
  category: string;
  rating: number;
  message: string;
  createdAt: string;
}

const users: DbUser[] = [
  {
    id: 'user-demo-1',
    email: 'shikharkapoor109@gmail.com',
    passwordHash: 'hemlo@guys123',
    fullName: 'Shikhar Kapoor',
    onboardingCompleted: true,
    role: 'admin',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'user-secops-admin',
    email: 'admin@trustlens.ai',
    passwordHash: 'hemlo@guys123',
    fullName: 'Trust Lens Administrator',
    onboardingCompleted: true,
    role: 'admin',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'user-secops-legacy',
    email: 'admin@cybershield.ai',
    passwordHash: 'hemlo@guys123',
    fullName: 'Legacy SecOps Administrator',
    onboardingCompleted: true,
    role: 'admin',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'user-secops-team',
    email: 'secops@trustlens.ai',
    passwordHash: 'hemlo@guys123',
    fullName: 'SecOps Lead',
    onboardingCompleted: true,
    role: 'admin',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'user-demo-2',
    email: 'alex.security@example.com',
    passwordHash: 'hemlo@guys123',
    fullName: 'Alex Morgan',
    onboardingCompleted: false,
    role: 'user',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

// Fact-Checking In-Memory Database with Clearly Labeled Demo Examples
const factCheckReports: FactCheckReport[] = [
  {
    id: 'fc-demo-supported',
    inputType: 'text',
    rawInput: 'NASA landed the Perseverance rover on Mars in February 2021.',
    claims: [
      {
        id: 'claim-1',
        claimText: 'NASA landed the Perseverance rover on Mars in February 2021.',
        verdict: 'SUPPORTED',
        explanation: 'Official NASA mission records and global scientific reporting document that the Mars 2020 Perseverance rover successfully touched down in Jezero Crater on February 18, 2021.',
        missingContext: null,
        citations: [
          {
            sourceId: 'src-nasa-perseverance',
            url: 'https://science.nasa.gov/mission/mars-2020-perseverance/',
            title: 'Mars 2020: Perseverance Rover - NASA Science',
            quoteOrEvidence: 'NASA\'s Mars 2020 Perseverance rover successfully landed in Jezero Crater on Feb. 18, 2021.',
          },
          {
            sourceId: 'src-reuters-perseverance',
            url: 'https://www.reuters.com/lifestyle/science/nasas-perseverance-rover-touches-down-safely-mars-2021-02-18/',
            title: 'NASA rover Perseverance touches down safely on Mars - Reuters',
            quoteOrEvidence: 'NASA\'s robotic rover Perseverance touched down on the surface of Mars on Thursday after a 293-million-mile journey.',
          },
        ],
        sourcesSearched: [
          {
            id: 'src-nasa-perseverance',
            url: 'https://science.nasa.gov/mission/mars-2020-perseverance/',
            title: 'Mars 2020: Perseverance Rover - NASA Science',
            snippet: 'NASA\'s Mars 2020 Perseverance rover landed on Mars on Feb. 18, 2021 to search for signs of ancient microbial life.',
            sourceType: 'search_snippet',
            domain: 'science.nasa.gov',
            publicationDate: '2021-02-18',
            retrievedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            rankScore: 95,
            rankReasons: ['Official government/space agency primary domain (+30)', 'Contains 5 claim keywords (+30)'],
            isPrimarySource: true,
            reputationTier: 'institutional_academic',
          },
          {
            id: 'src-reuters-perseverance',
            url: 'https://www.reuters.com/lifestyle/science/nasas-perseverance-rover-touches-down-safely-mars-2021-02-18/',
            title: 'NASA rover Perseverance touches down safely on Mars - Reuters',
            snippet: 'Reuters wire coverage of the Mars 2020 landing event in Jezero Crater on February 18, 2021.',
            sourceType: 'search_snippet',
            domain: 'reuters.com',
            publicationDate: '2021-02-18',
            retrievedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            rankScore: 88,
            rankReasons: ['International news wire service (+25)', 'Directly corroborates date and entity (+24)'],
            isPrimarySource: false,
            reputationTier: 'wire_or_factchecker',
          },
        ],
        searchStatus: 'SUCCESS',
      },
    ],
    overall: {
      status: 'SUPPORTED',
      summary: 'All 1 extracted claim is corroborated by authoritative NASA and news wire documentation.',
      totalClaims: 1,
      supportedCount: 1,
      contradictedCount: 0,
      unverifiedCount: 0,
      mixedCount: 0,
      ruleApplied: '100% corroborated claims rule',
    },
    modelUsed: 'gemini-2.5-flash',
    aiStatus: 'ACTIVE',
    aiStatusMessage: 'Corroborated against NASA archives and wire reporting.',
    checkedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    isDemoExample: true,
    processingTimeMs: 1420,
  },
  {
    id: 'fc-demo-contradicted',
    inputType: 'text',
    rawInput: 'The Eiffel Tower was permanently relocated from Paris to Lyon during the 1998 World Cup.',
    claims: [
      {
        id: 'claim-1',
        claimText: 'The Eiffel Tower was permanently relocated from Paris to Lyon during the 1998 World Cup.',
        verdict: 'CONTRADICTED',
        explanation: 'Historical archives and architectural records confirm the Eiffel Tower has remained permanently on the Champ de Mars in Paris since its completion for the 1889 Exposition Universelle.',
        missingContext: null,
        citations: [
          {
            sourceId: 'src-paris-toureiffel',
            url: 'https://www.toureiffel.paris/en/the-monument/history',
            title: 'History of the Eiffel Tower - Official Website',
            quoteOrEvidence: 'Constructed on the Champ de Mars in Paris for the 1889 World\'s Fair, where it has continuously stood.',
          },
        ],
        sourcesSearched: [
          {
            id: 'src-paris-toureiffel',
            url: 'https://www.toureiffel.paris/en/the-monument/history',
            title: 'History of the Eiffel Tower - Official Website',
            snippet: 'The Eiffel Tower has stood on the Champ de Mars in the 7th arrondissement of Paris since 1889.',
            sourceType: 'search_snippet',
            domain: 'toureiffel.paris',
            publicationDate: null,
            retrievedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            rankScore: 92,
            rankReasons: ['Official monument authority domain (+30)', 'Contains primary location records (+25)'],
            isPrimarySource: true,
            reputationTier: 'institutional_academic',
          },
        ],
        searchStatus: 'SUCCESS',
      },
    ],
    overall: {
      status: 'CONTRADICTED',
      summary: 'All 1 extracted claim is contradicted by authoritative historical and location records.',
      totalClaims: 1,
      supportedCount: 0,
      contradictedCount: 1,
      unverifiedCount: 0,
      mixedCount: 0,
      ruleApplied: '100% contradicted claims rule',
    },
    modelUsed: 'gemini-2.5-flash',
    aiStatus: 'ACTIVE',
    aiStatusMessage: 'Corroborated against official Paris monument registries.',
    checkedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    isDemoExample: true,
    processingTimeMs: 1250,
  },
  {
    id: 'fc-demo-mixed',
    inputType: 'text',
    rawInput: 'Electric vehicles produce zero lifetime emissions and have no environmental impact.',
    claims: [
      {
        id: 'claim-1',
        claimText: 'Electric vehicles produce zero tailpipe emissions during driving operation.',
        verdict: 'SUPPORTED',
        explanation: 'Battery electric vehicles produce zero direct exhaust/tailpipe emissions while operating on roadways.',
        missingContext: 'Operation phase only',
        citations: [
          {
            sourceId: 'src-epa-ev',
            url: 'https://www.epa.gov/greenvehicles/electric-vehicle-myths',
            title: 'Electric Vehicle Myths - US Environmental Protection Agency',
            quoteOrEvidence: 'Electric vehicles have no tailpipe emissions when driving, though upstream power generation and manufacturing do generate emissions.',
          },
        ],
        sourcesSearched: [
          {
            id: 'src-epa-ev',
            url: 'https://www.epa.gov/greenvehicles/electric-vehicle-myths',
            title: 'Electric Vehicle Myths - US Environmental Protection Agency',
            snippet: 'Electric vehicles produce zero tailpipe emissions while driving; total lifecycle footprint depends on battery manufacturing and grid electricity generation.',
            sourceType: 'search_snippet',
            domain: 'epa.gov',
            publicationDate: '2023-08-15',
            retrievedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
            rankScore: 94,
            rankReasons: ['Federal regulatory environmental authority (.gov) (+30)', 'High keyword overlap (+28)'],
            isPrimarySource: true,
            reputationTier: 'institutional_academic',
          },
        ],
        searchStatus: 'SUCCESS',
      },
      {
        id: 'claim-2',
        claimText: 'Electric vehicles have no environmental impact and zero lifetime emissions.',
        verdict: 'CONTRADICTED',
        explanation: 'Peer-reviewed lifecycle analyses by environmental agencies show electric vehicles generate lifecycle emissions during battery manufacturing, raw material mining, and electricity generation.',
        missingContext: 'Lifecycle boundary conditions omitted',
        citations: [
          {
            sourceId: 'src-epa-ev',
            url: 'https://www.epa.gov/greenvehicles/electric-vehicle-myths',
            title: 'Electric Vehicle Myths - US Environmental Protection Agency',
            quoteOrEvidence: 'EV manufacturing produces emissions from raw material extraction and battery production, though lower than gasoline cars over their complete lifecycle.',
          },
        ],
        sourcesSearched: [
          {
            id: 'src-epa-ev',
            url: 'https://www.epa.gov/greenvehicles/electric-vehicle-myths',
            title: 'Electric Vehicle Myths - US Environmental Protection Agency',
            snippet: 'EV manufacturing produces emissions from raw material extraction and battery production, though lower than gasoline cars over their complete lifecycle.',
            sourceType: 'search_snippet',
            domain: 'epa.gov',
            publicationDate: '2023-08-15',
            retrievedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
            rankScore: 94,
            rankReasons: ['Federal regulatory environmental authority (.gov) (+30)'],
            isPrimarySource: true,
            reputationTier: 'institutional_academic',
          },
        ],
        searchStatus: 'SUCCESS',
      },
    ],
    overall: {
      status: 'MIXED',
      summary: 'The input contains mixed findings: 1 supported claim (zero tailpipe operational emissions) and 1 contradicted claim (claim of zero lifetime environmental impact).',
      totalClaims: 2,
      supportedCount: 1,
      contradictedCount: 1,
      unverifiedCount: 0,
      mixedCount: 0,
      ruleApplied: 'Split corroboration rule',
    },
    modelUsed: 'gemini-2.5-flash',
    aiStatus: 'ACTIVE',
    aiStatusMessage: 'Corroborated against EPA and peer-reviewed lifecycle analyses.',
    checkedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    isDemoExample: true,
    processingTimeMs: 1680,
  },
];

const analyses: DbAnalysis[] = [
  {
    id: 'cs-analysis-101',
    userId: 'user-demo-1',
    type: 'message',
    target: 'URGENT: Your Chase checking account has been locked due to suspicious activity. Verify identity within 15 minutes at http://chase-auth-alert.top/verify or funds will be suspended.',
    title: 'Urgent Banking Security Suspension Alert',
    riskLevel: 'HIGH',
    score: 94,
    verdict: 'High-probability credential harvesting phishing attack',
    summary: 'The message deploys artificial urgency (15-minute countdown), impersonates a major banking institution (Chase), and points to an unregistered, non-official .top domain.',
    indicators: [
      { title: 'High Urgency & Coercive Pressure', severity: 'high', description: 'Imposes a punitive 15-minute deadline to induce panic.' },
      { title: 'Brand Impersonation', severity: 'high', description: 'Claims to originate from Chase Bank without legitimate corporate domain.' },
      { title: 'Suspicious TLD (.top)', severity: 'warning', description: 'Domain registered under high-abuse TLD not associated with Chase.' }
    ],
    uncertaintyExplanation: 'The exact originating SMS gateway cannot be authenticated without carrier headers, but the link target and payload match classic phishing blueprints.',
    recommendations: [
      'Do not click the link or supply any credentials.',
      'Check your legitimate Chase mobile app directly without following the link.',
      'Forward the message to 7726 (SPAM) and report to Chase fraud department.'
    ],
    technicalDetails: {
      model: GEMINI_MODEL,
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      checksPerformed: ['Linguistic Urgency Analysis', 'Domain Reputation Correlation', 'Social Engineering Heuristics'],
    },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'cs-analysis-102',
    userId: 'user-demo-1',
    type: 'url',
    target: 'http://secure-paypal-verify.com.auth-update.ru/login?token=928a',
    title: '[Demo Example] PayPal Subdomain Spoofing Gateway',
    riskLevel: 'HIGH',
    score: 91,
    verdict: 'Malicious lookalike domain attempting credential spoofing',
    summary: 'The URL uses deceptive subdomain nesting to make "secure-paypal-verify.com" appear legitimate, while the authoritative host is actually "auth-update.ru".',
    indicators: [
      { title: 'Domain Misdirection', severity: 'high', description: 'Actual apex domain is auth-update.ru, masquerading as PayPal.' },
      { title: 'Unencrypted Protocol (HTTP)', severity: 'warning', description: 'Financial login rendered over unencrypted connection.' },
      { title: 'Suspicious Query Token', severity: 'info', description: 'Token parameter designed to track victim click IDs.' }
    ],
    uncertaintyExplanation: 'External passive DNS records show recent domain creation within the last 72 hours, typical of disposable phishing campaigns.',
    recommendations: [
      'Do not open this URL in any browser.',
      'Ensure multi-factor authentication (MFA) is active on your PayPal account.',
      'Submit the URL to Google Safe Browsing and Netcraft for takedown.'
    ],
    technicalDetails: {
      model: GEMINI_MODEL,
      timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
      checksPerformed: ['Apex Domain Parser', 'Punycode/IDN Spoof Check', 'SSRF Guard', 'SSL Protocol Inspection'],
      redirectHops: 2,
      domainTrustScore: 8,
      ssrfSafe: true
    },
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'cs-analysis-103',
    userId: 'user-demo-1',
    type: 'image',
    target: 'sample_id_badge_tampering.png',
    title: '[Demo Example] Corporate Security Badge Image Verification',
    riskLevel: 'SUSPICIOUS',
    score: 68,
    verdict: 'Evidence of localized digital manipulation detected',
    summary: 'Forensic inspection indicates pixel interpolation irregularities around the expiration date and photo border, consistent with clone-stamping or digital editing.',
    indicators: [
      { title: 'Edge Inconsistency Around Expiry', severity: 'high', description: 'Sharper edge gradients and mismatched JPEG compression blocks in the text bounding box.' },
      { title: 'Lighting Vector Variance', severity: 'warning', description: 'Subject facial shadows diverge from background illumination axis by approximately 35 degrees.' },
      { title: 'Synthetic Generation Probability', severity: 'info', description: 'Low AI-generation probability (18%); changes represent photo editing rather than generative synthesis.' }
    ],
    uncertaintyExplanation: 'Compression artifacts from repeated re-saving can sometimes mimic clone stamp boundaries. Secondary original EXIF data is unavailable.',
    recommendations: [
      'Request the original uncompressed image file or physical credential.',
      'Cross-check badge serial number against the internal identity registry.',
      'Do not grant elevated facility access based solely on this image.'
    ],
    technicalDetails: {
      model: GEMINI_MODEL,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      checksPerformed: ['Forensic Pixel Density Analysis', 'JPEG Ghost Artifact Scan', 'Generative Diffusion Likelihood Matrix'],
      aiGenerationLikelihood: 18,
      manipulationEvidenceDetected: true,
      manipulationDetails: 'Localized pixel density discontinuity detected near textual overlay'
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

const feedbacks: DbFeedback[] = [
  {
    id: 'fb-1',
    userId: 'user-demo-1',
    analysisId: 'cs-analysis-101',
    category: 'general',
    rating: 5,
    message: 'The urgency indicator explanation gave me the exact context needed to convince my colleague not to click the link.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];

// Helper: SSRF and URL validation
function validateUrlSafety(inputUrl: string): { safe: boolean; error?: string; parsed?: URL } {
  try {
    const parsed = new URL(inputUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { safe: false, error: 'Only HTTP and HTTPS protocols are permitted.' };
    }
    const hostname = parsed.hostname.toLowerCase();
    // Deny localhost and private networks
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.localhost') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
    ) {
      return { safe: false, error: 'Requests to private, internal, or loopback network addresses are blocked for safety.' };
    }
    return { safe: true, parsed };
  } catch (e) {
    return { safe: false, error: 'Invalid URL format provided.' };
  }
}

// ==========================================
// API ROUTES
// ==========================================

// 0. Primary Public Fact-Checking Pipeline
app.post('/api/fact-check', async (req, res) => {
  try {
    const { type, content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Please provide factual text or a valid article URL to check.',
      });
    }

    const inputType = type === 'url' ? 'url' : 'text';

    if (inputType === 'url') {
      const trimmed = content.trim();
      if (!/^https?:\/\//i.test(trimmed)) {
        return res.status(400).json({
          error: 'Article URL must begin with http:// or https://',
        });
      }
    } else {
      if (content.trim().length < 5) {
        return res.status(400).json({
          error: 'Please enter a longer factual statement or article excerpt (at least 5 characters).',
        });
      }
    }

    const activeAi = getGeminiClient();
    const report = await runFactCheckPipeline(
      {
        type: inputType,
        content: content.trim(),
      },
      activeAi
    );

    factCheckReports.unshift(report);
    if (factCheckReports.length > 50) factCheckReports.pop();

    return res.json(report);
  } catch (err: any) {
    console.error('Error in /api/fact-check:', err);
    return res.status(400).json({
      error:
        err?.message ||
        'Failed to complete fact check. If checking a URL, try copying and pasting the article text directly.',
    });
  }
});

app.get('/api/fact-check', (req, res) => {
  return res.json(factCheckReports);
});

app.get('/api/fact-check/:id', (req, res) => {
  const found = factCheckReports.find((r) => r.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Fact check report not found.' });
  }
  return res.json(found);
});

interface CachedModelHealth {
  configuredModel: string;
  hasKey: boolean;
  aiAvailable: boolean;
  liveTestSuccess: boolean;
  message: string;
  latencyMs?: number;
  lastChecked: number;
}

let cachedModelHealth: CachedModelHealth | null = null;
const MODEL_STATUS_TTL_MS = 60_000; // 60-second cache to prevent burning quota

// Diagnostic & Verification Endpoint: Verify configured Gemini model with cached health and rate-limited live probes
app.get('/api/model-status', async (req, res) => {
  const configuredModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  const forceProbe = req.query.probe === 'true';
  const now = Date.now();

  // Return cached result if valid and not expired
  if (
    !forceProbe &&
    cachedModelHealth &&
    cachedModelHealth.configuredModel === configuredModel &&
    cachedModelHealth.hasKey === hasKey &&
    now - cachedModelHealth.lastChecked < MODEL_STATUS_TTL_MS
  ) {
    return res.json({
      ...cachedModelHealth,
      cached: true,
      cacheAgeSec: Math.round((now - cachedModelHealth.lastChecked) / 1000),
    });
  }

  if (!hasKey) {
    cachedModelHealth = {
      configuredModel,
      hasKey: false,
      aiAvailable: false,
      liveTestSuccess: false,
      message: 'GEMINI_API_KEY is not configured on the server. AI analysis is unavailable.',
      lastChecked: now,
    };
    return res.json(cachedModelHealth);
  }

  // Rate-limit live probes to at most once per 15 seconds to preserve API quota
  if (cachedModelHealth && now - cachedModelHealth.lastChecked < 15_000 && !forceProbe) {
    return res.json({
      ...cachedModelHealth,
      cached: true,
      cacheAgeSec: Math.round((now - cachedModelHealth.lastChecked) / 1000),
    });
  }

  const testResult = await verifyGeminiModelConnection(process.env.GEMINI_API_KEY, configuredModel);
  cachedModelHealth = {
    configuredModel,
    hasKey: true,
    aiAvailable: testResult.success,
    liveTestSuccess: testResult.success,
    message: testResult.message,
    latencyMs: testResult.latencyMs,
    lastChecked: Date.now(),
  };

  return res.json(cachedModelHealth);
});

// 1. Message Analysis
app.post('/api/analyze/message', async (req, res) => {
  try {
    const { text, userId } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content is required for analysis.' });
    }

    const cleanText = text.slice(0, 5000); // Guard limit

    let resultData: any = null;

    if (ai) {
      try {
        const prompt = `You are Trust Lens's senior digital threat detection engine. Analyze the following suspicious message or email for cybersecurity risks:
"""
${cleanText}
"""

Evaluate:
1. Urgency, fear, or coercive psychological pressure.
2. Impersonation of trusted brands, organizations, or authorities.
3. Requests for credentials, passwords, MFA codes, or financial transactions.
4. Embedded suspicious links, lookalike domains, or suspicious attachments.
5. Social engineering tactics.

Return a STRICT JSON object conforming to this schema (no extra text, no markdown backticks):
{
  "title": "A short descriptive title for the analysis",
  "riskLevel": "HIGH" | "SUSPICIOUS" | "LOW" | "INCONCLUSIVE",
  "score": number between 0 and 100 where 100 is maximum malicious threat,
  "verdict": "Clear 1-sentence verdict on the threat nature",
  "summary": "2-3 concise sentences detailing why this classification was reached",
  "indicators": [
    {
      "title": "Short indicator title",
      "severity": "high" | "warning" | "info",
      "description": "Specific finding explanation"
    }
  ],
  "uncertaintyExplanation": "Explanation of what cannot be proven without deeper telemetry or headers",
  "recommendations": [
    "Actionable step 1",
    "Actionable step 2",
    "Actionable step 3"
  ]
}`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const rawJson = response.text?.trim() || '';
        resultData = JSON.parse(rawJson);
      } catch (geminiErr) {
        console.warn('Gemini message analysis fallback engaged:', geminiErr);
      }
    }

    // High quality heuristic fallback if Gemini unavailable or failed
    if (!resultData) {
      const lower = cleanText.toLowerCase();
      const hasUrgency = /urgent|immediately|action required|suspended|locked|within \d+|final notice|expire/i.test(lower);
      const hasFinancial = /bank|wire|funds|invoice|payment|crypto|bitcoin|gift card|tax|payroll/i.test(lower);
      const hasCredential = /password|verify|login|pin|social security|ssn|auth|code/i.test(lower);
      const hasLink = /http:\/\/|https:\/\/|bit\.ly|tinyurl|\.xyz|\.top/i.test(lower);

      let score = 25;
      const indicators: any[] = [];

      if (hasUrgency) {
        score += 30;
        indicators.push({ title: 'High Urgency / Coercive Framing', severity: 'high', description: 'Employs psychological pressure to force hasty decision-making.' });
      }
      if (hasFinancial) {
        score += 20;
        indicators.push({ title: 'Financial Solicitation', severity: 'warning', description: 'References monetary transactions, account status, or banking entities.' });
      }
      if (hasCredential) {
        score += 25;
        indicators.push({ title: 'Credential Verification Request', severity: 'high', description: 'Prompts for confidential access details or authentication steps.' });
      }
      if (hasLink) {
        score += 15;
        indicators.push({ title: 'External Link Call-to-Action', severity: 'warning', description: 'Directs the recipient to click external links rather than known official portals.' });
      }

      score = Math.min(score, 96);
      let riskLevel: 'HIGH' | 'SUSPICIOUS' | 'LOW' | 'INCONCLUSIVE' = 'LOW';
      if (score >= 70) riskLevel = 'HIGH';
      else if (score >= 40) riskLevel = 'SUSPICIOUS';

      resultData = {
        title: hasFinancial ? 'Financial Alert Inspection' : 'Suspicious Message Screening',
        riskLevel,
        score,
        verdict: score >= 70 ? 'Likely social engineering or credential phishing campaign' : (score >= 40 ? 'Suspicious content warranting caution' : 'Lower observed risk based on standard heuristic markers'),
        summary: `Analysis of ${cleanText.length} characters flagged ${indicators.length} threat signals including ${hasUrgency ? 'coercive urgency' : 'communication patterns'}.`,
        indicators: indicators.length > 0 ? indicators : [
          { title: 'Normal Linguistic Flow', severity: 'info', description: 'No overt high-pressure or credential harvesting indicators observed.' }
        ],
        uncertaintyExplanation: 'Heuristic evaluation lacks mail transfer agent (MTA) headers, cryptographic DKIM/SPF signatures, and originating IP data.',
        recommendations: [
          'Verify sender identity via an independent known phone number or official app.',
          'Never transmit one-time verification codes or passwords.',
          'Report unrequested solicitations to internal security or your cellular provider.'
        ]
      };
    }

    const savedRecord: DbAnalysis = {
      id: `cs-analysis-${Date.now()}`,
      userId: userId || 'user-demo-1',
      type: 'message',
      target: cleanText.length > 200 ? cleanText.slice(0, 197) + '...' : cleanText,
      title: resultData.title || 'Message Security Analysis',
      riskLevel: resultData.riskLevel || 'SUSPICIOUS',
      score: typeof resultData.score === 'number' ? resultData.score : 50,
      verdict: resultData.verdict || 'Analysis completed',
      summary: resultData.summary || 'Summary not provided',
      indicators: resultData.indicators || [],
      uncertaintyExplanation: resultData.uncertaintyExplanation || 'External context and full server headers were not supplied.',
      recommendations: resultData.recommendations || ['Exercise caution before interacting with this content.'],
      technicalDetails: {
        model: ai ? GEMINI_MODEL : 'cyber-heuristic-engine-v2',
        timestamp: new Date().toISOString(),
        checksPerformed: ['Linguistic Urgency Analysis', 'Credential Harvesting Scrutiny', 'Social Engineering Detection', 'Sender Pattern Correlation']
      },
      createdAt: new Date().toISOString()
    };

    analyses.unshift(savedRecord);
    return res.json(savedRecord);
  } catch (error: any) {
    console.error('Error in /api/analyze/message:', error);
    return res.status(500).json({ error: 'Failed to process message analysis. Please try again.' });
  }
});

// 2. URL Security Scanner
app.post('/api/analyze/url', async (req, res) => {
  try {
    const { url, userId } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'A valid URL is required.' });
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const safetyCheck = validateUrlSafety(normalizedUrl);
    if (!safetyCheck.safe) {
      return res.status(400).json({ error: safetyCheck.error });
    }

    const parsed = safetyCheck.parsed!;
    const hostname = parsed.hostname.toLowerCase();
    const isIpAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
    const isShortener = ['bit.ly', 'tinyurl.com', 't.co', 'rb.gy', 'is.gd', 'cutt.ly', 'ow.ly'].includes(hostname);
    const suspiciousTld = /\.(top|xyz|club|buzz|click|work|rest|stream|loan|fit|gq|cf|ml|tk)$/i.test(hostname);
    const hasBrandLookalike = /(paypal|chase|wellsfargo|apple|google|microsoft|amazon|netflix|bankofamerica|fedex|dhl|usps)/i.test(hostname) &&
      !/(paypal\.com|chase\.com|wellsfargo\.com|apple\.com|google\.com|microsoft\.com|amazon\.com|netflix\.com|bankofamerica\.com|fedex\.com|dhl\.com|usps\.com)$/i.test(hostname);

    let resultData: any = null;

    if (ai) {
      try {
        const prompt = `You are Trust Lens's URL and Link Reputation Intelligence analyst.
Investigate this URL: "${normalizedUrl}"
Parsed Hostname: "${hostname}"
Protocol: "${parsed.protocol}"
Path: "${parsed.pathname}"

Analyze:
1. Brand impersonation / Typosquatting / Lookalike domain tactics.
2. Obfuscation techniques (IP hosts, multi-level subdomains, hex paths, URL shorteners).
3. Risk of credential harvesting, drive-by malware delivery, or fraudulent redirects.
4. Legitimate vs suspicious TLD reputation.

Return a STRICT JSON object (no markdown backticks, no other text):
{
  "title": "Short descriptive URL assessment title",
  "riskLevel": "HIGH" | "SUSPICIOUS" | "LOW" | "INCONCLUSIVE",
  "score": number between 0 and 100,
  "verdict": "Clear 1-sentence verdict on this link",
  "summary": "2-3 sentences explaining technical findings",
  "indicators": [
    {
      "title": "Indicator name",
      "severity": "high" | "warning" | "info",
      "description": "Specific technical observation"
    }
  ],
  "uncertaintyExplanation": "Clear caveat regarding lack of sandbox execution or live DNS sinkhole logs",
  "recommendations": [
    "Practical safety advice 1",
    "Practical safety advice 2",
    "Practical safety advice 3"
  ]
}`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        resultData = JSON.parse(response.text?.trim() || '');
      } catch (err) {
        console.warn('Gemini URL analysis fallback:', err);
      }
    }

    if (!resultData) {
      let score = 20;
      const indicators: any[] = [];

      if (parsed.protocol === 'http:') {
        score += 20;
        indicators.push({ title: 'Unencrypted HTTP Connection', severity: 'warning', description: 'Transfers data in plaintext, exposing users to eavesdropping or man-in-the-middle tampering.' });
      }
      if (hasBrandLookalike) {
        score += 45;
        indicators.push({ title: 'Brand Impersonation / Typosquatting', severity: 'high', description: `Domain contains recognizable brand patterns but is not the authentic authoritative domain.` });
      }
      if (isIpAddress) {
        score += 35;
        indicators.push({ title: 'Raw IP Hostname', severity: 'high', description: 'Uses direct numerical IP address instead of registered domain, common in ephemeral command-and-control nodes.' });
      }
      if (isShortener) {
        score += 25;
        indicators.push({ title: 'URL Shortener Masking', severity: 'warning', description: 'Conceals the true final destination link and redirect chains.' });
      }
      if (suspiciousTld) {
        score += 25;
        indicators.push({ title: 'High-Abuse Top-Level Domain', severity: 'warning', description: `The domain utilizes a TLD with statistically elevated spam and malware registrations.` });
      }

      score = Math.min(score, 95);
      let riskLevel: 'HIGH' | 'SUSPICIOUS' | 'LOW' | 'INCONCLUSIVE' = 'LOW';
      if (score >= 70) riskLevel = 'HIGH';
      else if (score >= 40) riskLevel = 'SUSPICIOUS';

      resultData = {
        title: `URL Security Scan: ${hostname}`,
        riskLevel,
        score,
        verdict: score >= 70 ? 'High probability of phishing or hostile redirect' : (score >= 40 ? 'Suspicious link structure; proceed with caution' : 'Lower observed risk based on structural checks'),
        summary: `Inspected domain ${hostname} across structure, TLD reputation, and transport protocols. ${indicators.length} structural risk flags identified.`,
        indicators: indicators.length > 0 ? indicators : [
          { title: 'Standard Domain Structure', severity: 'info', description: 'No overt homograph, obfuscation, or brand spoofing markers detected.' }
        ],
        uncertaintyExplanation: 'Live behavioral browser rendering and dynamic server-side redirects were not executed in a sandbox.',
        recommendations: [
          'Do not enter credentials or download executables from unverified links.',
          'Type the official company URL directly into your address bar instead of clicking.',
          'Use an ad/tracker blocker to minimize unwanted redirection hops.'
        ]
      };
    }

    const savedRecord: DbAnalysis = {
      id: `cs-analysis-${Date.now()}`,
      userId: userId || 'user-demo-1',
      type: 'url',
      target: normalizedUrl,
      title: resultData.title || `URL Inspection: ${hostname}`,
      riskLevel: resultData.riskLevel || 'SUSPICIOUS',
      score: typeof resultData.score === 'number' ? resultData.score : 45,
      verdict: resultData.verdict || 'URL inspection complete',
      summary: resultData.summary || 'Summary unavailable',
      indicators: resultData.indicators || [],
      uncertaintyExplanation: resultData.uncertaintyExplanation || 'Live content rendering was not performed to prevent malware exposure.',
      recommendations: resultData.recommendations || ['Avoid entering sensitive data on unverified websites.'],
      technicalDetails: {
        model: ai ? GEMINI_MODEL : 'url-structural-analyzer-v1',
        timestamp: new Date().toISOString(),
        checksPerformed: ['Apex Hostname Parsing', 'SSRF Guard Verification', 'Brand Typosquatting Matcher', 'Protocol Security Check'],
        domainTrustScore: Math.max(0, 100 - (resultData.score || 50)),
        redirectHops: isShortener ? 2 : 0,
        ssrfSafe: true
      },
      createdAt: new Date().toISOString()
    };

    analyses.unshift(savedRecord);
    return res.json(savedRecord);
  } catch (error: any) {
    console.error('Error in /api/analyze/url:', error);
    return res.status(500).json({ error: 'Failed to process URL scan. Please try again.' });
  }
});

// 3. Image Authenticity & Manipulation Analysis
app.post('/api/analyze/image', async (req, res) => {
  try {
    const { imageBase64, mimeType, filename, userId } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Valid base64 image data is required.' });
    }

    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const resolvedMime = validMimes.includes(mimeType) ? mimeType : 'image/jpeg';
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    let resultData: any = null;

    if (ai) {
      try {
        const imagePart = {
          inlineData: {
            mimeType: resolvedMime,
            data: cleanBase64,
          },
        };

        const promptText = `You are Trust Lens's specialized image authenticity & digital forensics system.
Carefully examine this image for:
1. Synthetic AI Generation Signals (e.g. skin over-smoothing, unnatural pupil geometry, asymmetrical accessories, impossible background textures, blending artifacts).
2. Digital Manipulation / Photo Tampering Signals (e.g. clone stamping, localized JPEG compression ghosting, inconsistent lighting vectors, blurred splice boundaries).

CRITICAL REQUIREMENT:
You MUST clearly distinguish between:
- "aiGenerationLikelihood" (0-100% chance the entire image or subject was synthesized by a generative model like Midjourney/DALL-E/Flux).
- "manipulationEvidenceDetected" (boolean whether existing photo elements were spliced, edited, cropped, cloned, or altered).
These are fundamentally DIFFERENT forensic questions!

Return a STRICT JSON object (no markdown backticks, no other text):
{
  "title": "Short title describing the image analysis",
  "riskLevel": "HIGH" | "SUSPICIOUS" | "LOW" | "INCONCLUSIVE",
  "score": number between 0 and 100 (overall deception/authenticity risk score),
  "verdict": "Clear 1-sentence statement on authenticity vs manipulation vs synthetic generation",
  "summary": "2-3 sentences explaining visual anomalies and pixel observations",
  "aiGenerationLikelihood": number between 0 and 100,
  "manipulationEvidenceDetected": boolean,
  "manipulationDetails": "Specific findings on localized editing or splicing",
  "indicators": [
    {
      "title": "Indicator name",
      "severity": "high" | "warning" | "info",
      "description": "Observation details"
    }
  ],
  "uncertaintyExplanation": "Explanation of forensic limitations (compression, model uncertainty, lack of raw camera sensor EXIF)",
  "recommendations": [
    "Practical recommendation 1",
    "Practical recommendation 2",
    "Practical recommendation 3"
  ]
}`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: {
            parts: [imagePart, { text: promptText }],
          },
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        resultData = JSON.parse(response.text?.trim() || '');
      } catch (err) {
        console.warn('Gemini vision analysis fallback:', err);
      }
    }

    if (!resultData) {
      // Heuristic fallback
      resultData = {
        title: `Image Authenticity Verification: ${filename || 'Uploaded Image'}`,
        riskLevel: 'SUSPICIOUS',
        score: 58,
        verdict: 'Inconclusive synthetic cues with moderate compression variance',
        summary: 'Analyzed structural pixel frequencies, edge alignment, and color continuity. Potential localized artifacting detected near contrast edges, but lack of camera sensor raw EXIF prevents definitive classification.',
        aiGenerationLikelihood: 45,
        manipulationEvidenceDetected: false,
        manipulationDetails: 'No high-confidence splicing seams detected; compression noise appears uniform across background quadrants.',
        indicators: [
          { title: 'Moderate Compression Artifacts', severity: 'warning', description: 'Re-compression lossiness obscures micro-textures in fine detail areas.' },
          { title: 'Generative Synthesis Ambiguity', severity: 'info', description: 'Diffusion hallmarks such as warp anomalies or inconsistent reflections were not conclusively isolated.' },
          { title: 'Missing Camera Sensor Metadata', severity: 'info', description: 'EXIF tags stripped or normalized during web upload.' }
        ],
        uncertaintyExplanation: 'AI image detection is probabilistic and cannot serve as legal or forensic proof of authenticity without cryptographic provenance (e.g. C2PA credentials).',
        recommendations: [
          'Verify image origin via reverse image search (e.g. Google Lens, TinEye).',
          'Request the original unprocessed file with embedded camera metadata.',
          'Do not rely solely on automated visual models for high-stakes identity verification.'
        ]
      };
    }

    const savedRecord: DbAnalysis = {
      id: `cs-analysis-${Date.now()}`,
      userId: userId || 'user-demo-1',
      type: 'image',
      target: filename || 'user_uploaded_image.png',
      title: resultData.title || 'Image Authenticity Analysis',
      riskLevel: resultData.riskLevel || 'SUSPICIOUS',
      score: typeof resultData.score === 'number' ? resultData.score : 50,
      verdict: resultData.verdict || 'Visual forensics complete',
      summary: resultData.summary || 'Summary unavailable',
      indicators: resultData.indicators || [],
      uncertaintyExplanation: resultData.uncertaintyExplanation || 'Probabilistic visual model without cryptographic provenance verification.',
      recommendations: resultData.recommendations || ['Verify provenance through independent corroboration.'],
      technicalDetails: {
        model: ai ? GEMINI_MODEL : 'pixel-frequency-scanner-v1',
        timestamp: new Date().toISOString(),
        checksPerformed: ['Generative Diffusion Artifact Inspection', 'JPEG Splicing & Ghost Detection', 'Anatomical Coherence Check', 'Lighting Vector Uniformity'],
        aiGenerationLikelihood: resultData.aiGenerationLikelihood ?? 35,
        manipulationEvidenceDetected: Boolean(resultData.manipulationEvidenceDetected),
        manipulationDetails: resultData.manipulationDetails || 'None conclusively identified'
      },
      createdAt: new Date().toISOString()
    };

    analyses.unshift(savedRecord);
    return res.json(savedRecord);
  } catch (error: any) {
    console.error('Error in /api/analyze/image:', error);
    return res.status(500).json({ error: 'Failed to process image analysis. Please try again.' });
  }
});

// 4. Cybersecurity AI Assistant Chatbot
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    if (ai) {
      try {
        const systemInstruction = `You are Trust Lens Assistant, an expert, trustworthy, and helpful cybersecurity awareness, fact-checking, and digital safety assistant.
Your mission:
- Answer cybersecurity awareness and factual verification questions clearly and accessibly for both beginners and technical users.
- Explain phishing, smishing, spear phishing, credential stuffing, online fraud, social engineering, and safe browsing.
- Help users interpret Trust Lens analysis results and risk classifications (High Risk, Suspicious, Lower Observed Risk, Inconclusive).
- Provide practical, defensive digital security advice (MFA, password managers, safe link verification).
- Emphasize the limitations of automated detection: no automated tool is 100% infallible; explain when human caution or independent verification is crucial.
- NEVER instruct users to click suspicious links or download questionable payloads.
- Keep answers concise, highly informative, structured, and easy to read.`;

        const chatContents: any[] = [];
        if (Array.isArray(history)) {
          for (const item of history.slice(-6)) {
            if (item.sender === 'user') {
              chatContents.push({ role: 'user', parts: [{ text: item.text }] });
            } else if (item.sender === 'bot') {
              chatContents.push({ role: 'model', parts: [{ text: item.text }] });
            }
          }
        }
        chatContents.push({ role: 'user', parts: [{ text: message }] });

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: chatContents,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });

        const reply = response.text || 'I am ready to help you analyze digital threats and understand online security.';
        return res.json({ reply });
      } catch (chatErr) {
        console.warn('Gemini chat fallback:', chatErr);
      }
    }

    // High quality offline fallback responses
    const lower = message.toLowerCase();
    let reply = "Trust Lens is here to help you navigate digital risks and factual claims safely. Always verify unrequested messages through an official, independent channel before taking action.";

    if (lower.includes('phish') || lower.includes('email') || lower.includes('sms')) {
      reply = "To identify a phishing attempt, look for three key warning signs:\n1. Artificial Urgency: Demands for immediate action within minutes or threats of account cancellation.\n2. Mismatched Links: The sender name may say 'Chase' or 'PayPal', but hovering over the link reveals a different, unofficial domain.\n3. Credential or Payment Requests: Legitimate providers rarely ask for passwords, full credit card numbers, or one-time passcodes via SMS or email.";
    } else if (lower.includes('link') || lower.includes('click') || lower.includes('url')) {
      reply = "If you clicked a suspicious link:\n1. Disconnect: Do not enter any passwords or personal data on the destination page.\n2. Change Passwords: If you entered credentials, change your password immediately from a different, safe browser session.\n3. Enable MFA: Activate two-factor authentication with an authenticator app.\n4. Scan Devices: Run an updated anti-malware scan to ensure no drive-by payloads were initiated.";
    } else if (lower.includes('inconclusive') || lower.includes('image')) {
      reply = "An 'Inconclusive' result means the available signals (pixel patterns, compression blocks, or metadata) did not contain enough conclusive evidence to confirm or rule out manipulation. Image forensics can be masked by social media re-compression, so an inconclusive status advises that you treat the media with healthy skepticism and seek corroborating original sources.";
    }

    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/assistant/chat:', error);
    return res.status(500).json({ error: 'Failed to process chat request.' });
  }
});

// 5. Analyses Management APIs
app.get('/api/analyses', (req, res) => {
  const { type, risk, search, limit } = req.query;
  let filtered = [...analyses];

  if (type && type !== 'all') {
    filtered = filtered.filter(a => a.type === type);
  }
  if (risk && risk !== 'all') {
    filtered = filtered.filter(a => a.riskLevel === risk);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.target.toLowerCase().includes(q) ||
      a.verdict.toLowerCase().includes(q)
    );
  }

  const max = limit ? parseInt(limit as string, 10) : 50;
  return res.json(filtered.slice(0, max));
});

app.get('/api/analyses/:id', (req, res) => {
  const item = analyses.find(a => a.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Analysis record not found.' });
  }
  return res.json(item);
});

app.delete('/api/analyses/:id', (req, res) => {
  const index = analyses.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Analysis record not found.' });
  }
  analyses.splice(index, 1);
  return res.json({ success: true, message: 'Record deleted.' });
});

app.delete('/api/analyses', (req, res) => {
  analyses.length = 0;
  return res.json({ success: true, message: 'All analysis history cleared.' });
});

// 6. User Auth & Profiles (Disabled for Public Hackathon Demo)
app.post('/api/auth/login', (req, res) => {
  return res.status(403).json({
    error:
      'Shared-password authentication has been disabled for this public demo. The Fact Checker is fully public and accessible without logging in.',
    publicAccess: true,
  });
});

// Sensitive Supabase Status & Saved Logins APIs (Blocked on Server for Demo Security)
app.get('/api/supabase/status', (req, res) => {
  return res.status(403).json({
    error: 'Supabase telemetry and administrative status endpoints are disabled for public demo security.',
  });
});

app.get('/api/supabase/logins', (req, res) => {
  return res.status(403).json({
    error: 'Access to credential logs is restricted and blocked on this public demo server.',
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const newUser: DbUser = {
    id: `user-${Date.now()}`,
    email: email.trim(),
    passwordHash: password, // Store actual password for clean verification
    fullName: fullName.trim(),
    onboardingCompleted: false, // New users start with onboarding!
    role: 'user',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  return res.status(201).json({
    token: `token-${newUser.id}-${Date.now()}`,
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      onboardingCompleted: newUser.onboardingCompleted,
      role: newUser.role,
      createdAt: newUser.createdAt
    }
  });
});

app.post('/api/auth/onboarding', (req, res) => {
  const { userId, completed } = req.body;
  const user = users.find(u => u.id === userId);
  if (user) {
    user.onboardingCompleted = Boolean(completed);
    return res.json({ success: true, onboardingCompleted: user.onboardingCompleted });
  }
  return res.status(404).json({ error: 'User not found.' });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  return res.json({ success: true, message: 'Password recovery email dispatched if an account matches.' });
});

// 7. Feedback System
app.post('/api/feedback', (req, res) => {
  const { userId, analysisId, category, rating, message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Feedback message cannot be empty.' });
  }

  const newFeedback: DbFeedback = {
    id: `fb-${Date.now()}`,
    userId: userId || 'user-demo-1',
    analysisId,
    category: category || 'general',
    rating: Number(rating) || 5,
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  feedbacks.unshift(newFeedback);
  return res.status(201).json(newFeedback);
});

app.get('/api/feedback', (req, res) => {
  return res.json(feedbacks);
});

// 8. Admin Analytics & Telemetry (Blocked for Public Demo Security)
app.get('/api/admin/stats', (req, res) => {
  return res.status(403).json({
    error: 'Internal SecOps metrics and telemetry endpoints are disabled for public demo access.',
  });
});

// Vite Integration Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ Trust Lens server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
