# AI Longevity Coach — Full Build Stack
*Based on Angus Sewell's reel (Episode 7: "Vibe code a $15k health crisis") and his "Fire your $15,000 longevity coach" build guide — cross-checked with independent research, July 2026*

## The concept from the video

Instead of paying a longevity coach $10–15k for 6 months, you wire up:

1. **Wearable data** (sleep, HRV, recovery) via any wearable with an API — Oura, Whoop, Fitbit, Withings, Polar
2. **A health log** — voice-note what you ate / meds taken → AI parses it → database
3. **Blood work** from platforms with APIs — Function Health, SiPhox, InsideTracker, LetsGetChecked, Everlywell, Superpower
4. **A weekly cron skill** with this prompt (verbatim from the video):
   > "Every Sunday, read all my health data — my wearable sleep, HRV and recovery, plus everything I logged in my database this week. Tell me where I'm at, what's trending up or down, and the one or two things you'd change. Then save it as a skill, run it weekly, and message me."
5. The agent **texts you** what to do differently.

Below is everything needed to build the best version of this, layer by layer.

---

## Layer 1 — Wearable data (connectors/MCPs)

| Source | Status | Best option |
|---|---|---|
| **Strava** | ✅ Official hosted MCP, in your connector registry now | Connect `mcp.strava.com` (subscribers only, read-only: activities, fitness trends, readiness, zones) |
| **Oura** | Official API v2, community MCPs only. ⚠️ Personal Access Tokens retired Dec 2025 — use an OAuth server | `elizabethtrykin/oura-mcp` (fullest), `gjlumsden/oura-mcp` (polished OAuth), or `loganmurphy/oura-mcp-server` (remote — paste a URL, no install) |
| **Whoop** | API v2 (v1 dead since Oct 2025), community MCPs | `nissand/whoop-mcp-server-claude` (official OAuth, 18+ endpoints). Avoid reverse-engineered "totem" server |
| **Apple Health** | No cloud API | **Health Auto Export** iOS app → `HealthyApps/health-auto-export-mcp-server`; or `the-momentum/apple-health-mcp-server` (DuckDB over full export) for historical analysis |
| **Withings** | Friendly official OAuth2 API | `davidmosiah/withings-mcp` |
| **Polar** | Official AccessLink API (free) | `davidmosiah/polar-mcp` |
| **Garmin** | Official API is B2B-gated | `Taxuspt/garmin_mcp` (110+ tools, unofficial login — can break) |
| **Fitbit** | ⚠️ Legacy API shuts down Sept 2026 → new Google Health API | Don't build on Fitbit MCPs now; wait for Google Health API |
| **Google Fit** | ❌ REST API shut down June 2025 | Dead end |

**One-connector-for-everything option (his recommended shortcut):** an aggregator — **Terra** (official, all major wearables) or **VitalTrends** (Whoop, Oura, Withings, Apple Health) — one connector, every source. Open-source self-hosted alternative: `the-momentum/open-wearables` (MIT; Apple Health, Garmin, Whoop, Polar, Suunto, Samsung, built-in MCP). Junction (ex-Vital) if you also want lab ordering.

## Layer 2 — Food, meds & health log

- **Alma** (`mcp.alma.food`) — hosted nutrition connector, in your registry now: logged meals, macros, micronutrient gaps, weight history, goals.
- **nutrition-mcp.com** — free hosted MCP, conversational meal/macro logging, zero setup.
- **Food databases for lookups/cross-checking** (his tip: LLM macro estimates drift, verify against a database): Nutritionix, Open Food Facts (barcode + nutrition, no key), USDA FoodData Central via `zen-apps/mcp-nutrition-tools`.
- **MyFitnessPal / Cronometer** — no official APIs; community servers use your own login (personal-use, occasional re-login). Or go via Junction.
- **The DIY voice logger (his Op 3):** Telegram bot (@BotFather) → n8n flow: Telegram Trigger → Whisper transcription → LLM parses to strict JSON (`{items:[{food,qty,kcal,protein_g,carbs_g,fat_g}], meds:[], notes:""}`) → row saved to Postgres/**Supabase (already connected in your setup)**/Airtable/Sheets/Notion → that database's MCP exposes it to Claude.

## Layer 3 — Blood work

- **Function Health** — ✅ official Claude connector (beta, Pro/Max, US): lab results summaries, biomarker category summaries (20+ categories), health protocol tool. For **raw biomarker values** (not just summaries): community `daveremy/function-health-mcp` or `mbmccormick/functionhealth-mcpb` (you hand them your Function login).
- **HealthEx** — ✅ second official directory connector (beta) for general health records.
- **Hospital/clinic portals** — connect a FHIR server: `openrecord` (Epic MyChart) or `jmandel/health-record-mcp` (SMART on FHIR); or route results into Apple Health and use an Apple Health MCP.
- **SiPhox Health** — real REST API (token auth), 62 biomarkers + wearable sync; no MCP yet — wrap it with FastMCP (~40 lines).
- **InsideTracker / LetsGetChecked / Everlywell / Superpower / NHS results** — no public consumer APIs. Route: download the PDF → Claude's **pdf skill** parses every biomarker into a table (name, value, unit, reference range, flag) → store in your Supabase biomarker table. Works for any lab; no premium membership needed.

## Layer 4 — Messaging (the "texts you" part)

1. **Official Claude Code "Channels"** (research preview, ~Mar 2026) — Telegram + Discord plugins, two-way: DM the bot, it pushes into a session; agent replies. Purpose-built for this. Best choice.
2. **Twilio** — `twilio-developer-kit` plugin (in the plugin marketplace): SMS/WhatsApp sends, `twilio-notifications-alerts-advisor`, `twilio-conversation-memory`, and `twilio-security-compliance-hipaa` if this ever becomes a product for others.
3. **Pushover MCP** — dead-simple one-way push fallback.
4. **His no-code routes:** n8n Schedule Trigger (`0 12 * * 1`) that runs the review and Telegrams you, or Gumloop scheduled agent. Redundant if you use Cowork scheduled tasks + Channels.

**Nothing ready-made for a source?** Three fallbacks from his guide: wrap the API in ~40 lines with **FastMCP**; expose an **n8n workflow** via its MCP Server Trigger node; or a universal gateway — **Zapier MCP** (9,000+ apps), Pipedream, or Composio.

## Layer 5 — Brain, memory & automation (already in your Cowork setup)

- **Scheduled tasks** (`schedule` skill) — the weekly Sunday cron that runs the review. Already available.
- **Supabase MCP** — already connected; the "your database" box in his diagram (meals, meds, symptoms, biomarkers tables).
- **skill-creator** — build the custom skills below properly, with evals.
- **productivity:memory-management** — persistent memory of your goals, injuries, preferences between sessions.
- **data plugin skills** — `data:analyze`, `data:statistical-analysis` (trend/outlier detection on HRV, sleep), `data:create-viz`, `data:build-dashboard` (weekly HTML dashboard).
- **pdf / xlsx / docx skills** — parse lab PDFs, export reports.
- **Cowork artifacts** — a live, auto-refreshing health dashboard page pulling from connectors on open.

## Custom skills to create (with skill-creator)

1. **`weekly-health-review`** — the core prompt (his guide's refined version): "review all my health data from the last 7 days using my connectors — wearable sleep, HRV and readiness, food log, latest bloodwork. Compare against previous weeks. Tell me: (1) where I am now in plain English, (2) what's trending up or down, (3) the ONE or TWO changes that would move the needle most next week. Keep it short and specific." Runs on a weekly cron. His field note: cap it at 1–2 changes — ten fixes get ignored.
2. **`log-meal`** — parse free text/voice transcript ("ate 3 apples, a protein bar, took my meds") into structured Supabase rows.
3. **`parse-labs`** — PDF in → normalized biomarker rows + flags vs. optimal ranges.
4. **`readiness-adjuster`** — daily micro-skill: if HRV/recovery tanks, adjust today's training suggestion.
5. **`longevity-protocol`** — your personal context file: goals, supplements, training plan, target biomarker ranges (the thing a $15k coach writes once).

## Recommended minimal stack (start this week)

1. Connect **Strava** and **Alma** (suggestion cards shown in chat).
2. Add **Oura or Whoop MCP** (whichever you wear) — PAT/OAuth, ~15 min.
3. Connect **Function Health** connector on claude.ai (if you use it); otherwise pdf-skill your existing lab PDFs into **Supabase**.
4. Create the **weekly-health-review skill** + Sunday **scheduled task**.
5. Add **Telegram channel** (or Pushover) so the review lands on your phone.

Total cost: ~$0 in software (vs. $10–15k for the human coach). The only paid bits are things you'd own anyway: the wearable, lab tests, and optionally Strava/Twilio.

## Caveats

- Fitbit/Google Fit are transitioning — build on Oura/Whoop/Withings/Polar/Apple Health instead.
- Community MCPs (Oura, Whoop, Garmin) are unofficial — vendor the code and pin versions.
- Alma's connector has no public dev docs; verify in the connector browser.
- Not medical advice infrastructure: the agent should flag anomalies to a doctor, not diagnose.

## Sources

- Reel: [instagram.com/reel/Dad5n--NBsS](https://www.instagram.com/reel/Dad5n--NBsS/) (@angus.sewell)
- Strava MCP: [press.strava.com](https://press.strava.com/articles/strava-launches-mcp-connector) · [Strava MCP FAQ](https://support.strava.com/hc/en-us/articles/46297163108493-Strava-API-and-MCP-FAQ)
- Function Health × Claude: [prnewswire.com](https://www.prnewswire.com/news-releases/function-launches-integration-with-claude-powered-by-anthropic-302658537.html)
- Oura MCPs: [daveremy/oura-mcp](https://github.com/daveremy/oura-mcp) · [elizabethtrykin/oura-mcp](https://github.com/elizabethtrykin/oura-mcp)
- Whoop MCP: [nissand/whoop-mcp-server-claude](https://github.com/nissand/whoop-mcp-server-claude)
- Apple Health: [HealthyApps/health-auto-export-mcp-server](https://github.com/HealthyApps/health-auto-export-mcp-server) · [the-momentum/apple-health-mcp-server](https://github.com/the-momentum/apple-health-mcp-server)
- Aggregator: [the-momentum/open-wearables](https://github.com/the-momentum/open-wearables)
- Nutrition: [alma.food](https://www.alma.food/) · [nutrition-mcp.com](https://nutrition-mcp.com/) · [zen-apps/mcp-nutrition-tools](https://github.com/zen-apps/mcp-nutrition-tools)
- SiPhox API: [siphoxhealth.gitbook.io/docs/api](https://siphoxhealth.gitbook.io/docs/api)
- Channels: [code.claude.com/docs/en/channels](https://code.claude.com/docs/en/channels)
- Google Health API / Fitbit sunset: [developers.google.com/health/about](https://developers.google.com/health/about)
