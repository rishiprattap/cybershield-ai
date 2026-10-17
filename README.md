# TrustLens: Public Web-Grounded Fact Checking Engine

TrustLens is a verifiable, evidence-grounded fact-checking application built for hackathon evaluation. It evaluates factual claims and web articles against live search evidence without requiring a login.

---

## Architectural Principles & Integrity

1. **No Keyword Pseudo-Verification**:
   - Evaluating whether an assertion is factually supported or contradicted requires contextual reasoning over retrieved evidence.
   - **Crucial Rule:** If `GEMINI_API_KEY` is missing or an upstream LLM request fails, the application **never** substitutes simple keyword heuristics (e.g. searching for words like "confirmed" or "debunked" in snippets) as factual verdicts. Instead, it explicitly marks AI analysis as `UNAVAILABLE` or `ERROR`, classifies assertions as `UNVERIFIED`, and presents retrieved search evidence for manual human review.

2. **Web-Grounded Reasoning**:
   - The LLM is restricted to comparing extracted claims against **retrieved evidence only**.
   - Input text and external web snippets are treated strictly as passive data, mitigating prompt injection.
   - Citations are validated in code; the system automatically discards citations that do not reference URLs actually retrieved by the search engine.

3. **Deterministic Source Ranking**:
   - Retrieved sources are scored and ranked via transparent code rules (authority tiers, primary institutional domain status, keyword relevance, and wire-service status).
   - Identical syndicated copy and domain flooding are filtered out.
   - **Rule:** A reputable domain alone never decides whether a claim is true or false.

4. **SSRF-Guarded URL Ingestion**:
   - URLs undergo synchronous DNS resolution checks blocking private, loopback, link-local, and cloud metadata addresses (`127.0.0.0/8`, `10.0.0.0/8`, `192.168.0.0/16`, `169.254.0.0/16`, `::1`, `metadata.google.internal`).
   - Enforces an 8-second timeout, follows a maximum of 3 redirects safely, and caps downloaded responses at 2MB.

5. **Discrete Count-Based Assessment**:
   - Verdicts are strictly discrete: `SUPPORTED`, `CONTRADICTED`, `MIXED`, or `UNVERIFIED`.
   - The overall assessment is derived from explicit claim counts and deterministic rules. The system never fabricates an arbitrary probability percentage (e.g. no "87% true").
   - Zero search results never means false (it resolves to `UNVERIFIED`).

---

## Where AI Is Used vs. Deterministic Code Rules

| Component | Mechanism | Operational Behavior |
| :--- | :--- | :--- |
| **Claim Extraction** | Gemini LLM (`GEMINI_MODEL`) | Parses 1–5 distinct checkable assertions, preserving exact numbers, dates, and locations. Flags missing country or time context. If AI is offline, falls back to factual sentence segmentation. |
| **Evidence Comparison** | Gemini LLM (`GEMINI_MODEL`) | Compares claims strictly against retrieved sources. If `GEMINI_API_KEY` is missing or fails, **no keyword guessing is performed**; assertions remain `UNVERIFIED` with `aiStatus: UNAVAILABLE`. |
| **Model Verification** | `verifyGeminiModelConnection` | Executes a live test request against the Gemini API to verify model availability, quota, and latency. |
| **SSRF & Network Safety** | **Deterministic Code** (`dns.lookup`, CIDR validation) | Validates hostname resolution before socket connection, blocking internal networks and rebind attacks. |
| **Web Evidence Retrieval** | **Deterministic Engine** (DuckDuckGo + Wikipedia API) | Queries public search for each claim independently; captures title, URL, snippet, domain, and retrieval timestamp. |
| **Source Ranking & Dedup** | **Deterministic Code** (Tier scoring & prefix clustering) | Ranks sources by institutional authority and keyword density; limits same-domain representation to prevent single-source domination. |
| **Citation Validation** | **Deterministic Code** (Strict URL lookup) | Validates that all citations correspond to URLs actually retrieved in search results. |
| **Overall Assessment** | **Deterministic Code** (Count-based decision table) | Synthesizes total claims, supported count, contradicted count, and unverified count into an explainable outcome. |

---

## Google Workspace vs. Gemini API Billing & Quotas

> [!IMPORTANT]
> **Google Workspace and Gemini API Developer Quotas are Completely Separate Systems.**
> - A Google Workspace subscription (such as Google Workspace Business, Enterprise, or Gemini for Google Workspace add-ons) provides generative AI capabilities inside Gmail, Docs, and Drive for corporate users.
> - **A Workspace subscription does NOT provide Gemini API quota or developer keys for software applications.**
> - Developer API keys must be created independently via [Google AI Studio](https://aistudio.google.com/) or Google Cloud Vertex AI.
> - If you exceed the free rate limits on Google AI Studio, you must link a Google Cloud billing account to your AI Studio project to enable pay-as-you-go quota.

---

## Configuration & Environment Variables

Copy `.env.example` to `.env`:

```env
# Gemini API Key (Required for live LLM extraction & comparison)
# Obtain from https://aistudio.google.com/
GEMINI_API_KEY="your_gemini_api_key_here"

# Configurable Gemini Model (Optional, defaults to gemini-2.5-flash)
# Supported options: gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash, etc.
GEMINI_MODEL="gemini-2.5-flash"

# Port (Optional, defaults to 3000)
PORT=3000
```

> [!IMPORTANT]
> **Environment Variable Reloading & Process Restart**:
> - In Node.js, `process.env` is populated once into memory when the process boots. Modifying `.env` while the server is running does **not** hot-reload environment variables.
> - **Whenever you add or change `GEMINI_API_KEY` or `GEMINI_MODEL`, you MUST restart the server process (`npm run dev`)** or re-run the verification script (`npx tsx scripts/verify-engine.ts`).
> - Both `server.ts` and `scripts/verify-engine.ts` explicitly resolve `.env` from the project root (`path.resolve(__dirname, '.env')`), ensuring identical configuration regardless of current working directory.

---

## Local Setup & Testing

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Verify Model & Pipeline Integrity
Run the built-in diagnostic audit suite:
```bash
npx tsx scripts/verify-engine.ts
```
When `GEMINI_API_KEY` is configured in `.env`, the script automatically:
- Probes model health and latency.
- Runs **1 complete text submission** ("NASA landed the Perseverance rover on Mars in February 2021.") and shows extracted claims, search queries, retrieved passages, citations, and final verdicts.
- Runs **1 complete article URL submission** ("https://en.wikipedia.org/wiki/Perseverance_(rover)") and verifies claims.
- Validates that every citation contains substantive evidence passages that substantiate its explanation (not just a naked URL).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The public claim checker is the default landing page.

You can also inspect the cached model health diagnostic endpoint:
```bash
curl http://localhost:3000/api/model-status
```
*(Uses a 60-second cache TTL and 15-second live probe rate limit to prevent burning developer quota).*

### 4. Build and Lint
```bash
# TypeScript strict type checking
npm run lint

# Production bundle build
npm run build
```

---

## Engineering & Security Audit

The project audit is structured into three transparent categories: **Verified Working**, **Implemented but Untested (Pending Key)**, and **Known Limitations**.

### 1. Verified Working (10 items with programmatic assertions)

| Component / Subsystem | Concrete Assertion / Observation | Code Location |
| :--- | :--- | :--- |
| **IPv6 Loopback Guard** | Verified synchronous blocking of bracketed `[::1]`, expanded `0000:...:0001`, and compressed `0:0:...:0:1` forms; both URL formats rejected before socket connection. | `factCheckEngine.ts:isPrivateIp`, `validateUrlSsrfSafe` |
| **IPv4 Private & Metadata Guard** | Verified synchronous rejection of `127.0.0.1`, `localhost`, `169.254.169.254` (cloud metadata), and `192.168.1.100` via DNS resolution inspection. | `factCheckEngine.ts:validateUrlSsrfSafe` |
| **Redirect SSRF Inspection** | Handshake-preceding SSRF inspection on redirect `Location` headers immediately blocks targets pointing to internal/private addresses. | `factCheckEngine.ts:fetchArticleSafe` |
| **Response Size Limit** | Verified that responses exceeding the byte cap (`maxSizeBytes`) are aborted immediately, preventing Node heap exhaustion. | `factCheckEngine.ts:fetchArticleSafe` |
| **Request Timeout Protection** | Verified that slow/hanging upstream servers trigger `AbortController` timeout abort after threshold without freezing the server. | `factCheckEngine.ts:fetchArticleSafe` |
| **Standalone DuckDuckGo Search** | Verified that DuckDuckGo Instant Answer API executes independently and returns structured candidate results without Wikipedia fallback. | `factCheckEngine.ts:searchDuckDuckGo` |
| **Standalone Wikipedia API Search** | Verified that Wikipedia API search executes independently and returns structured encyclopedia candidates without DuckDuckGo fallback. | `factCheckEngine.ts:searchWikipedia` |
| **Zero Results vs. Failure Distinction** | Nonsensical query assertion verified that empty results resolve to status `NO_RESULTS` (sources: 0) instead of throwing `FAILED` or fabricating a false verdict. | `factCheckEngine.ts:searchEvidenceForClaim` |
| **Zero Keyword Guessing When Offline** | Assertion verified that when `GEMINI_API_KEY` is absent, all claims remain strictly `UNVERIFIED` with `aiStatus: 'UNAVAILABLE'` and `ruleApplied: 'AI unavailable safety guard (keyword guessing disabled)'`. No regex guessing is used. | `factCheckEngine.ts:runFactCheckPipeline` |
| **Citation Evidence Substantiation** | Verified that citations are evaluated for substantive evidence passages and semantic relevance to the claim explanation, rather than merely verifying URL presence. | `scripts/verify-engine.ts:verifyCitationSubstantiation` |
| **Quota Protection (/api/model-status)** | Implemented 60-second cache TTL and 15-second live probe rate limit to prevent page refreshes from consuming Gemini API quota. | `server.ts:app.get('/api/model-status')` |
| **Public TrustLens UI** | Browser observation verified that the fact-checking interface is the default unauthenticated route at `/`, featuring demo presets and live model status badges. | `src/pages/FactCheckPage.tsx` |

### 2. Implemented but Untested (Pending Valid API Key)

| Component / Subsystem | Implementation Details | Required Trigger to Complete |
| :--- | :--- | :--- |
| **Live Model Connectivity Probe** | `verifyGeminiModelConnection` sends a controlled ping request to verify model responsiveness and measure round-trip latency. | Requires user to supply an active `GEMINI_API_KEY` in `.env`. |
| **End-to-End Semantic Evidence Comparison** | `evaluateClaimWithEvidence` passes extracted claims and retrieved evidence passages to Gemini with strict hallucination and citation restrictions. | Requires user to supply an active `GEMINI_API_KEY` in `.env`. (Automated text and article URL evaluation runners in `scripts/verify-engine.ts` are ready to execute immediately upon key configuration). |

### 3. Known Limitations

1. **Client-Rendered SPAs & Paywalls**: Single-page applications requiring client-side JavaScript execution (e.g. Twitter/X, Paywalled news portals) cannot have full article bodies extracted via static HTTP fetch. Users are prompted to copy and paste article text excerpts directly.
2. **Upstream Search Burst Rate Limits**: Public search endpoints (DuckDuckGo/Wikipedia) may apply temporary rate limits during high-frequency automated bursts. When this occurs, the engine transparently logs `FAILED` or `NO_RESULTS` and assigns `UNVERIFIED` rather than falsifying an assessment.
3. **Node.js Environment Variable Reload**: In Node.js, `process.env` is read at process initialization. Modifying `.env` requires a server restart (`npm run dev`) or script re-execution.
4. **Google Workspace vs. Developer Quota**: Google Workspace enterprise subscriptions do not provide Gemini API developer quota. A separate Google AI Studio API key is required.
