# Cuilvor launch runbook — the last-mile credential steps

Everything code-side is built, tested and committed. Each item below is one create + one paste.
Do them in any order, whenever you're awake. Nothing blocks anything else.

## 1. Push (30 seconds — do this first)
    cd C:\Projects\cuilvor
    git push
Ships: workout engine (Train tab), photo meal logging, onboarding, data export,
account deletion, installable PWA, comparison pages, legal pages, all fixes.

## 2. Resend (magic-link emails + weekly review emails)
1. resend.com → Domains → Add cuilvor.com → add the DNS records it shows at GoDaddy.
2. resend.com → API Keys → Create → copy the key (starts re_).
3. Paste it in TWO places:
   a. Supabase → Project Settings → Auth → SMTP: host smtp.resend.com, port 465,
      user "resend", password = the key, sender coach@cuilvor.com. (Fixes rate-limited magic links.)
   b. Supabase → Edge Functions → cron-weekly-reviews → Secrets → add RESEND_API_KEY = the key.
      (Turns on Sunday review emails to every user — code already checks for it.)

## 3. Google OAuth — DONE ✓ (verified working)

## 4. Turnstile (only when waitlist spam actually appears)
Cloudflare dash → Turnstile → Add site (cuilvor.com) → get sitekey+secret.
Then tell Claude "wire in Turnstile, sitekey is 0x..." — the sitekey is public, paste it in chat;
the SECRET goes in Supabase → Auth → Bot protection (Attack Protection) yourself.

## 5. Stripe (when you decide pricing)
Nothing is wired yet by design — pricing is a product decision.
When ready: tell Claude the price + model (subscription/one-off) and have your
Stripe secret key ready to paste into an edge-function secret yourself.

## 6. Family invites
Send Claude the emails → added to waitlist → they sign in at cuilvor.com/app.
Kim (kimuk123@gmail.com) is already on the list.

## Already live server-side (no action)
- pg_cron fires cron-weekly-reviews Sundays 17:00 UTC for every user with an AI key
  (verified: bad key 403, good key 200).
- All 4 edge functions on direct Postgres (the PostgREST schema bug is fixed).
- AI keys vault-encrypted; per-user isolation attack-tested; typed-phrase account deletion.
