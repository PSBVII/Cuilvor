# Longevity Coach — app & system handover

## What's built (all live now)

1. **Database** — Supabase project `cuilvor` (dktaxuguvfvqfhkjghjc), dedicated `health` schema:
   `daily_metrics`, `log_entries`, `meals`, `med_events`, `biomarkers`, `targets`, `weekly_reviews`, plus `v_week_summary` for the review. RLS on; app access via authenticated magic-link users; Claude accesses via the Supabase MCP. 6 starter targets seeded (edit them anytime — just ask Claude).
2. **Skills** (install via the Save skill buttons): `log-health`, `parse-labs`, `weekly-health-review`, `longevity-protocol`.
3. **Scheduled task** — `weekly-longevity-review`, Sundays 18:00 (runs while the Claude app is open; runs on next launch if missed). Writes each report to `health.weekly_reviews`, which the app displays.
4. **Web app** — `index.html`: magic-link login, KPI cards, 14-day sleep/HRV charts, quick-log box, latest review, meals, flagged biomarkers. Single file, no build step.

## Using it today (no wearable logins needed)

- Tell Claude what you ate / took / how you slept → `log-health` stores it.
- Drop any lab PDF into a chat → `parse-labs` stores biomarkers.
- Sunday 6pm → the weekly review lands automatically (or say "run my review").

## Making it a real app

1. **Local test**: `npx serve app/` (magic links need http://localhost, not file://).
2. **Deploy**: push `app/` to Vercel/Netlify as a static site — I can do this via the Vercel connector when you're ready. Then add the deployed URL to Supabase → Auth → URL Configuration → Redirect URLs.
3. The publishable key in the file is safe to ship (it's designed to be public; RLS protects the data). Sign-ups: anyone with an email can currently create an account — for a personal app, turn off sign-ups in Supabase Auth settings after you've signed in once, or I can add an email allow-list.
4. Native app later: same Supabase backend works with React Native/Expo unchanged.

## Adding wearables later (each is one step)

- **Strava / Alma**: click Connect on the cards in our chat (OAuth) — the weekly review skill auto-ingests them.
- **Oura**: add a community OAuth MCP server (gjlumsden/oura-mcp or loganmurphy remote).
- **Whoop**: nissand/whoop-mcp-server-claude.
- **Apple Watch**: Health Auto Export app → health-auto-export-mcp-server.
- **Function Health / HealthEx**: official connectors in the claude.ai directory.
Until then, everything works via chat logging + PDFs.

## Safety note

This is a coaching/tracking tool, not medical advice — the skills are written to flag anomalies for a GP, never to diagnose.
