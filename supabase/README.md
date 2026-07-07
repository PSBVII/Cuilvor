# Cuilvor backend (Supabase project dktaxuguvfvqfhkjghjc)

Deployed via Supabase MCP. This folder mirrors the deployed state.

## Edge functions (verify_jwt=true, CORS locked to cuilvor.com / www / vercel.app)
- **parse-log** v2 — caller JWT validated → per-user rate limit (40/h) → user's AI key fetched decrypted from Vault via service-role-only RPC `health.get_ai_key` → Anthropic (claude-haiku-4-5) or OpenAI (gpt-4o-mini) parses text (prompt-injection-hardened system prompt, numeric sanitisation server-side) → rows written attributed to caller only. Accepts `local_date` (validated ±2 days) for timezone-correct daily metrics.
- **weekly-review** v2 — same auth/key pattern, 10-min cooldown per week row, gathers caller's 5-week history, writes health.weekly_reviews, returns report + week_start. Accepts `week_start` (validated ±8 days).

## Security model
- All health tables: RLS `user_id = auth.uid()`; targets additionally allow global defaults (user_id IS NULL, select-only).
- AI keys: **encrypted at rest in Supabase Vault**; `public.save_ai_key` (definer, validated) writes; `public.ai_key_status` returns provider+configured only; plaintext readable ONLY by `health.get_ai_key` (service_role-only execute). No client path can read any key back.
- Signup gate: BEFORE INSERT trigger on auth.users — waitlist emails only, first user = owner. Trigger functions not executable via REST.
- Isolation + gate verified by adversarial tests (simulated cross-user reads/spoofed inserts, non-waitlist signup) — all blocked.

## Known open items (pre-public-launch)
- Custom SMTP (Resend) — Supabase built-in email is heavily rate-limited.
- Google OAuth provider credentials (dashboard).
- Waitlist INSERT is anon+unthrottled by design; add captcha/edge throttle before scale.
- Privacy policy + ToS required before onboarding strangers (UK GDPR special-category data).
- In-app scheduled reviews run via the owner's Cowork Sunday task (household); per-user server-side cron (pg_cron → weekly-review) is the next step for full self-serve.
