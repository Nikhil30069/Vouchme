// =============================================================================
// Google Calendar API helpers (Deno).
//
// All functions throw `GoogleApiError` on failure so the calling Edge Function
// can convert them to user-facing 4xx/5xx responses.
// =============================================================================

export class GoogleApiError extends Error {
  constructor(public status: number, public details: unknown, message: string) {
    super(message);
  }
}

/**
 * Exchange a long-lived refresh_token for a short-lived access_token.
 * Throws GoogleApiError(401) if the refresh_token has been revoked.
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new GoogleApiError(500, null, "Missing GOOGLE_OAUTH_CLIENT_ID/SECRET in Edge Function secrets");
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new GoogleApiError(
      res.status,
      json,
      json.error_description || json.error || "Failed to refresh Google access token",
    );
  }
  return json.access_token as string;
}

export interface GoogleBusy {
  start: string;
  end: string;
}

/**
 * Query Google FreeBusy for a single calendar over a time range.
 * Returns the busy intervals (UTC ISO timestamps).
 */
export async function fetchFreeBusy(
  accessToken: string,
  calendarId: string,
  timeMin: Date,
  timeMax: Date,
): Promise<GoogleBusy[]> {
  const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: calendarId }],
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new GoogleApiError(res.status, json, json.error?.message || "FreeBusy request failed");
  }
  return (json.calendars?.[calendarId]?.busy ?? []) as GoogleBusy[];
}

export interface CreateEventInput {
  calendarId: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  attendees: { email: string; displayName?: string }[];
  /** When true, request a Google Meet link via conferenceData. */
  addMeet?: boolean;
  /** Unique idempotency token. Two events with the same requestId won't both create Meets. */
  requestId: string;
}

export interface CreatedEvent {
  id: string;
  htmlLink: string;
  meetLink: string | null;
}

/**
 * Create a calendar event with optional Google Meet link.
 */
export async function createCalendarEvent(
  accessToken: string,
  input: CreateEventInput,
): Promise<CreatedEvent> {
  const body: Record<string, unknown> = {
    summary: input.summary,
    description: input.description,
    start: { dateTime: input.start.toISOString() },
    end: { dateTime: input.end.toISOString() },
    attendees: input.attendees,
    reminders: { useDefault: true },
  };
  if (input.addMeet) {
    body.conferenceData = {
      createRequest: {
        requestId: input.requestId,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    };
  }

  const params = new URLSearchParams({
    sendUpdates: "all",
    ...(input.addMeet ? { conferenceDataVersion: "1" } : {}),
  });

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(input.calendarId)}/events?${params}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new GoogleApiError(res.status, json, json.error?.message || "Event creation failed");
  }

  const meetLink = (json.conferenceData?.entryPoints ?? [])
    .find((e: any) => e.entryPointType === "video")?.uri ?? null;

  return { id: json.id, htmlLink: json.htmlLink, meetLink };
}

/**
 * Best-effort delete of an event we previously created. Used to clean up
 * orphan events when our DB insert fails after Google succeeded.
 */
export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
): Promise<void> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`;
  // Ignore the result — this is cleanup. The orphan will at worst sit on the
  // referrer's calendar; we don't want to mask the original error.
  await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => {});
}
