// =============================================================================
// gcal-list-slots
//
// Body: { referrer_id: string, days_ahead?: number }
// Returns: { slots: { start: string, end: string }[] }
//
// Flow:
//   1. Verify caller is authenticated.
//   2. Load referrer's availability + Google refresh_token (service role).
//   3. Mint a fresh Google access_token from the refresh_token.
//   4. Call Google FreeBusy over the next `days_ahead` days.
//   5. Load already-booked slots for that referrer from referral_requests.
//   6. Use the pure slot generator to return open 1-hour slots.
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, jsonResponse, preflight } from "../_shared/cors.ts";
import { fetchFreeBusy, GoogleApiError, refreshAccessToken } from "../_shared/google.ts";
import { generateSlots, type AvailabilityWindow } from "../_shared/slots.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return jsonResponse({ error: "Missing Authorization header" }, 401);

    // Validate the caller's session.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return jsonResponse({ error: "Unauthorized" }, 401);

    const { referrer_id, days_ahead } = await req.json().catch(() => ({} as any));
    if (!referrer_id || typeof referrer_id !== "string") {
      return jsonResponse({ error: "referrer_id required" }, 400);
    }
    const daysAhead = Math.min(Math.max(parseInt(String(days_ahead ?? 7), 10) || 7, 1), 14);

    // Service-role client for reading oauth_credentials + profile config.
    const admin = createClient(supabaseUrl, serviceKey);

    const [{ data: cred, error: credErr }, { data: profile, error: profErr }] = await Promise.all([
      admin
        .from("oauth_credentials")
        .select("refresh_token")
        .eq("user_id", referrer_id)
        .eq("provider", "google")
        .maybeSingle(),
      admin
        .from("profiles")
        .select("availability_start, availability_end, availability_days, availability_timezone, email")
        .eq("id", referrer_id)
        .single(),
    ]);

    if (credErr || !cred) return jsonResponse({ error: "Referrer has not connected Google Calendar" }, 409);
    if (profErr || !profile) return jsonResponse({ error: "Referrer profile not found" }, 404);

    const availability: AvailabilityWindow = {
      start: String(profile.availability_start).slice(0, 5),
      end: String(profile.availability_end).slice(0, 5),
      days: profile.availability_days,
      timezone: profile.availability_timezone,
    };

    const now = new Date();
    const timeMin = now;
    const timeMax = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    let busy: { start: string; end: string }[] = [];
    try {
      const accessToken = await refreshAccessToken(cred.refresh_token);
      busy = await fetchFreeBusy(accessToken, "primary", timeMin, timeMax);
    } catch (e) {
      if (e instanceof GoogleApiError && (e.status === 400 || e.status === 401)) {
        // invalid_grant — token revoked or user disconnected the app.
        return jsonResponse({ error: "Calendar disconnected — referrer must reconnect" }, 410);
      }
      throw e;
    }

    // Exclude already-booked slots from our own DB so two seekers don't see the
    // same slot as available (until Google reflects it via FreeBusy, which can
    // lag by seconds).
    const { data: existing } = await admin
      .from("referral_requests")
      .select("interview_at")
      .eq("referrer_id", referrer_id)
      .gte("interview_at", timeMin.toISOString())
      .lte("interview_at", timeMax.toISOString())
      .neq("status", "rejected");

    const existingTimes = (existing ?? []).map((r: any) => r.interview_at).filter(Boolean);

    const slots = generateSlots({
      now,
      busy,
      existing: existingTimes,
      availability,
      daysAhead,
    });

    return jsonResponse({ slots });
  } catch (err) {
    console.error("[gcal-list-slots] error:", err);
    if (err instanceof GoogleApiError) {
      return jsonResponse({ error: err.message, details: err.details }, err.status >= 500 ? 502 : err.status);
    }
    return jsonResponse({ error: (err as Error).message ?? "Internal error" }, 500);
  }
});
