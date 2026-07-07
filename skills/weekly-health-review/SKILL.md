---
name: weekly-health-review
description: Run the weekly longevity coaching review - read all health data from the last 7 days (daily metrics, meals, meds, log entries, biomarkers) from the Supabase health database, compare against previous weeks and targets, and deliver a short coaching report with the 1-2 changes that matter most. Trigger on "weekly review", "health review", "how am I doing", "run my review".
---

# Weekly health review

The job a $15k/yr longevity coach does: read the data, find the trend, prescribe ONE or TWO changes.

## Data (Supabase project `dktaxuguvfvqfhkjghjc`, MCP execute_sql)

## Multi-tenant rule (IMPORTANT)
The database is per-user. When operating via the Supabase MCP (admin connection), ALWAYS resolve accounts first:
`select id, email, is_owner from public.profiles;` — run the review for EACH household profile, saving each report under their user_id. Deliver Paul's (is_owner) in full; other members get a one-line headline only (their full review appears in their own app).
If no row exists yet, stop and tell Paul: "Sign in to the Cuilvor app once (magic link) — that creates your account, then I can log data."
Include that user_id explicitly in EVERY insert/upsert, and filter EVERY select with `where user_id = '<owner-id>'`. Never read or write other users' rows.
1. This week (owner-scoped, v_week_summary won't work for admin): last-7-days selects on health.daily_metrics, health.meals, health.med_events, health.log_entries — each `where user_id = '<owner-id>'`.
2. Previous 4 weeks of dailies: `select * from health.daily_metrics where day >= current_date - 35 and user_id = '<owner-id>' order by day;`
3. Targets: `select * from health.targets;`
4. Latest labs: `select * from health.biomarkers order by test_date desc limit 60;`
5. Last review (for accountability): `select * from health.weekly_reviews order by week_start desc limit 1;`
6. If wearable/nutrition connectors (Oura, Whoop, Strava, Alma, Function Health) are available in this session, pull their last-7-days data too and upsert dailies into health.daily_metrics so the database stays the single source of truth.

## Report format (keep it SHORT and specific)
1. **Where you are** — 2-3 plain-English sentences on the week.
2. **Trending** — what's moving up or down vs previous weeks (numbers, not vibes). Include adherence to last week's recommendations.
3. **This week: change these 1-2 things** — the highest-leverage changes, concrete and doable ("in bed by 22:45 Mon-Thu", "add 30g protein at breakfast"). NEVER more than two. A coach that dumps ten fixes gets ignored.
4. One-line flag of anything that warrants a doctor (don't diagnose).

## After reporting
Save it: `insert into health.weekly_reviews (week_start, status_summary, trends, recommendations, full_report) values (date_trunc('week', current_date)::date, ..., ...) on conflict (week_start) do update set ...;`

## Rules
- Data gaps are findings, not blockers — "you only logged 2 days of food" is itself coaching feedback.
- Trend > snapshot. One bad night's HRV is noise; a 3-week slide is signal.
- Tie recommendations to targets in health.targets. If a target looks wrong for the user, propose updating it.
