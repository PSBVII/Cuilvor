---
name: parse-labs
description: Extract every biomarker from a blood test / lab results PDF (Function Health, Superpower, Everlywell, InsideTracker, SiPhox, NHS, any hospital or clinic) into the Supabase health database, flag out-of-range values, and explain results in plain English. Trigger whenever the user shares lab results, blood work, a blood panel, or biomarker PDFs/images.
---

# Parse lab results

Turn any lab report into structured, trendable biomarker rows.

## Database

## Multi-tenant rule (IMPORTANT)
The database is per-user. When operating via the Supabase MCP (admin connection), ALWAYS resolve Paul's account first:
`select id from public.profiles where is_owner limit 1;`
If no row exists yet, stop and tell Paul: "Sign in to the Cuilvor app once (magic link) — that creates your account, then I can log data."
Include that user_id explicitly in EVERY insert/upsert, and filter EVERY select with `where user_id = '<owner-id>'`. Never read or write other users' rows.
Supabase project `dktaxuguvfvqfhkjghjc`, table `health.biomarkers(test_date, panel, name, value, value_text, unit, ref_low, ref_high, flag, category, source)`. Use Supabase MCP `execute_sql`. Unique on (test_date, name, source) — use `on conflict ... do update`.

## Process
1. Read the PDF/image. Extract EVERY biomarker: name, value, unit, reference range. Non-numeric results (e.g. "Negative") go in value_text.
2. Normalise names to canonical forms (e.g. "HbA1c", "ApoB", "LDL-C", "hs-CRP", "ALT", "Ferritin", "Free T3", "Vitamin D (25-OH)") so trends work across labs.
3. Categorise: metabolic | lipids | hormones | inflammation | liver | kidney | blood | vitamins_minerals | thyroid | other.
4. Flag vs the lab's reference range: low | normal | high. Use 'critical' only when severely out of range.
5. Insert all rows in one statement. test_date = collection date from the report (ask if missing).
6. Then report to the user, grouped by system: what's out of range, what it suggests in plain English, what to ask a doctor about. Compare against previous results for the same biomarkers (query first) and call out meaningful changes.

## Rules
- You are not a doctor: frame interpretations as "worth discussing with your GP", never diagnose or change medication.
- Reference ranges differ between labs — store the range from THIS report.
- If a value is ambiguous in the PDF, skip it and list what you skipped.
