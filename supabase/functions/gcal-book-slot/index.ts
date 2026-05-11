// =============================================================================
// gcal-book-slot
//
// Body: {
//   referrer_id: string,
//   slot_start: string (ISO),
//   job_requirement_id: string,
//   job_role: string,
//   seeker_experience: number,
// }
// Returns: { referral_request_id, interview_at, meet_link, event_id }
//
// Flow:
//   1. Verify caller is authenticated → caller is the seeker.
//   2. Validate slot_start against the referrer's availability window.
//   3. Verify the slot is still free in Google (re-check FreeBusy for that 1h).
//   4. Refresh Google access_token.
//   5. Create the calendar event on the referrer's primary calendar with
//      Google Meet auto-generated, seeker + referrer as attendees.
//   6. Insert the referral_request row with interview_at + meet_link.
//   7. On DB unique-violation (race condition: someone else booked first),
//      DELETE the orphan Google event and return 409.
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, jsonResponse, preflight } from "../_shared/cors.ts";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  fetchFreeBusy,
  GoogleApiError,
  refreshAccessToken,
} from "../_shared/google.ts";
import { isSlotValid, type AvailabilityWindow } from "../_shared/slots.ts";

interface BookBody {
  referrer_id: string;
  slot_start: string;
  job_requirement_id: string;
  job_role: string;
  seeker_experience: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return jsonResponse({ error: "Missing Authorization header" }, 401);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: seeker }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !seeker) return jsonResponse({ error: "Unauthorized" }, 401);

    const body = (await req.json().catch(() => ({}))) as Partial<BookBody>;
    if (!body.referrer_id || !body.slot_start || !body.job_requirement_id || !body.job_role) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }
    const slotStart = new Date(body.slot_start);
    if (Number.isNaN(slotStart.getTime())) return jsonResponse({ error: "Invalid slot_start" }, 400);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60_000); // 1-hour fixed

    const admin = createClient(supabaseUrl, serviceKey);

    // Fetch referrer + seeker profiles + credentials in parallel.
    const [
      { data: cred, error: credErr },
      { data: referrerProfile, error: refErr },
      { data: seekerProfile },
    ] = await Promise.all([
      admin
        .from("oauth_credentials")
        .select("refresh_token")
        .eq("user_id", body.referrer_id)
        .eq("provider", "google")
        .maybeSingle(),
      admin
        .from("profiles")
        .select("id, email, name, availability_start, availability_end, availability_days, availability_timezone")
        .eq("id", body.referrer_id)
        .single(),
      admin.from("profiles").select("id, email, name").eq("id", seeker.id).single(),
    ]);

    if (credErr || !cred) return jsonResponse({ error: "Referrer has not connected Google Calendar" }, 409);
    if (refErr || !referrerProfile) return jsonResponse({ error: "Referrer not found" }, 404);
    if (!referrerProfile.email) return jsonResponse({ error: "Referrer missing email" }, 500);
    const seekerEmail = seekerProfile?.email ?? seeker.email;
    if (!seekerEmail) return jsonResponse({ error: "Seeker missing email" }, 400);

    // Server-side validation: caller cannot bypass the availability window by
    // crafting a slot_start themselves.
    const availability: AvailabilityWindow = {
      start: String(referrerProfile.availability_start).slice(0, 5),
      end: String(referrerProfile.availability_end).slice(0, 5),
      days: referrerProfile.availability_days,
      timezone: referrerProfile.availability_timezone,
    };
    if (!isSlotValid(slotStart, availability)) {
      return jsonResponse({ error: "Slot is outside the referrer's availability window" }, 400);
    }
    if (slotStart.getTime() < Date.now() + 30 * 60_000) {
      return jsonResponse({ error: "Slot is in the past or too soon (need 30+ minutes lead)" }, 400);
    }

    // Final freshness check via FreeBusy — guards against the seeker holding
    // a stale slot list while someone else booked it on Google directly.
    const accessToken = await refreshAccessToken(cred.refresh_token);
    const busy = await fetchFreeBusy(accessToken, "primary", slotStart, slotEnd);
    const conflicts = busy.some((b) => {
      const bs = new Date(b.start).getTime();
      const be = new Date(b.end).getTime();
      return slotStart.getTime() < be && slotEnd.getTime() > bs;
    });
    if (conflicts) {
      return jsonResponse({ error: "Slot is no longer available" }, 409);
    }

    // Create the calendar event with Google Meet.
    const event = await createCalendarEvent(accessToken, {
      calendarId: "primary",
      summary: `Interview: ${seekerProfile?.name ?? "Candidate"} ↔ ${referrerProfile.name ?? "Referrer"}`,
      description: `Vouchme referral interview for ${body.job_role}.\n\nThe referrer will score the candidate after the interview.`,
      start: slotStart,
      end: slotEnd,
      attendees: [
        { email: referrerProfile.email, displayName: referrerProfile.name ?? undefined },
        { email: seekerEmail, displayName: seekerProfile?.name ?? undefined },
      ],
      addMeet: true,
      requestId: `vouchme-${seeker.id}-${body.referrer_id}-${slotStart.getTime()}`,
    });

    // Insert the referral request. RLS-bypass via service role because the
    // unique-index check + meet_link write are server-controlled.
    const insertPayload = {
      seeker_id: seeker.id,
      referrer_id: body.referrer_id,
      job_requirement_id: body.job_requirement_id,
      job_role: body.job_role,
      seeker_experience_years: body.seeker_experience ?? 0,
      status: "pending",
      interview_at: slotStart.toISOString(),
      meet_link: event.meetLink,
      google_event_id: event.id,
    };

    const { data: inserted, error: insertErr } = await admin
      .from("referral_requests")
      .insert(insertPayload)
      .select("id, interview_at, meet_link, google_event_id")
      .single();

    if (insertErr) {
      // Most common cause: unique violation on (referrer_id, interview_at) =
      // someone else booked the same slot a moment earlier. Roll back the
      // Google event to avoid an orphan.
      await deleteCalendarEvent(accessToken, "primary", event.id);
      const isConflict = (insertErr as any).code === "23505";
      return jsonResponse(
        { error: isConflict ? "Slot was just booked by someone else" : insertErr.message },
        isConflict ? 409 : 500,
      );
    }

    return jsonResponse({
      referral_request_id: inserted.id,
      interview_at: inserted.interview_at,
      meet_link: inserted.meet_link,
      event_id: inserted.google_event_id,
    });
  } catch (err) {
    console.error("[gcal-book-slot] error:", err);
    if (err instanceof GoogleApiError) {
      return jsonResponse({ error: err.message, details: err.details }, err.status >= 500 ? 502 : err.status);
    }
    return jsonResponse({ error: (err as Error).message ?? "Internal error" }, 500);
  }
});
