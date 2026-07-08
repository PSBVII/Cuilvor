# Cuilvor wearable vendors — your ELI5 setup sheet

For each vendor: create a free developer account, make an "app", copy TWO codes
(Client ID + Client Secret), and paste them as secrets in Supabase
(Edge Functions → Secrets → Add). Use EXACTLY the secret names shown.
The redirect URL is always:  https://dktaxuguvfvqfhkjghjc.supabase.co/functions/v1/wearable-oauth/callback
Once a vendor's two secrets exist, tell Claude "build the <vendor> adapter" and its Connect button goes live.

## 1. Oura  (~10 min) — DO FIRST
1. Go to cloud.ouraring.com → sign in with your Oura account.
2. Click "New Application". Name: Cuilvor. Redirect URI: (the URL above).
3. Copy Client ID → Supabase secret OURA_CLIENT_ID. Copy Client Secret → OURA_CLIENT_SECRET.

## 2. Strava  (~10 min)
1. strava.com/settings/api (log in first).
2. Create App. Category: Training. Website: cuilvor.com. Authorization Callback Domain: dktaxuguvfvqfhkjghjc.supabase.co
3. Copy Client ID → STRAVA_CLIENT_ID, Client Secret → STRAVA_CLIENT_SECRET.

## 3. Withings  (~15 min)
1. developer.withings.com → "Get started" → create developer account.
2. Create an application (Public API integration). Callback URL: (the URL above).
3. Client ID → WITHINGS_CLIENT_ID, Secret → WITHINGS_CLIENT_SECRET.

## 4. Whoop  (~15 min)
1. developer-dashboard.whoop.com → sign in with your Whoop account.
2. Create App. Redirect URI: (the URL above). Scopes: read:recovery read:sleep read:workout read:profile read:body_measurement
3. Client ID → WHOOP_CLIENT_ID, Secret → WHOOP_CLIENT_SECRET.

## 5. Polar  (~15 min)
1. admin.polaraccesslink.com → register.
2. Create client. Redirect URL: (the URL above).
3. Client ID → POLAR_CLIENT_ID, Secret → POLAR_CLIENT_SECRET.

## 6. Garmin  (harder — apply and wait)
1. developer.garmin.com/gc-developer-program → "Request access" (business form; use Cuilvor + cuilvor.com).
2. Approval can take weeks. Skip for launch; revisit later. (Community workaround exists for personal use only.)

## 7. Fitbit — SKIP
Legacy API shuts Sept 2026; replaced by Google Health API. Revisit at native-app time.

## 8. Apple Health — native app only
No web API exists. This is the flagship feature of the future iOS app (HealthKit).
Interim for family: the "Health Auto Export" iPhone app can push data — ask Claude when wanted.

## 9. Alma & Function Health — different animals
No public developer APIs. They're Claude-connector-only (your personal coaching, not the product).
Product route for labs stays: PDF/screenshot upload — already live and better anyway (any lab, any country).

## 10. Hume — verify first
Niche; ask Claude to research current API status before spending time.

## The one rule
NEVER paste Client Secrets anywhere except Supabase → Edge Functions → Secrets.
Not in chat, not in the repo, not in email. Client IDs are public-ish; Secrets are secrets.
