import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── PLACEHOLDER: Google Calendar Sync ──────────────────────────
// This edge function will handle:
// 1. Reading busy times from Google Calendar to prevent double-booking
// 2. Writing new bookings as Google Calendar events
//
// TODO: To wire this up:
// 1. Set up Google OAuth2 credentials (Client ID + Client Secret)
// 2. Store refresh tokens per user in a `calendar_connections` table
// 3. Use Google Calendar API v3:
//    - GET /calendars/primary/freeBusy  → check busy times
//    - POST /calendars/primary/events   → create event
//    - DELETE /calendars/primary/events/:id → remove on cancel
//
// Example token refresh:
//   const res = await fetch("https://oauth2.googleapis.com/token", {
//     method: "POST",
//     body: new URLSearchParams({
//       client_id: GOOGLE_CLIENT_ID,
//       client_secret: GOOGLE_CLIENT_SECRET,
//       refresh_token: userRefreshToken,
//       grant_type: "refresh_token",
//     }),
//   });
// ───────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, booking, user_id } = await req.json();

    switch (action) {
      case "check_busy": {
        // TODO: Fetch busy times from Google Calendar
        console.log(`[PLACEHOLDER] check_busy for user ${user_id}`);
        return new Response(
          JSON.stringify({ placeholder: true, busy_times: [], message: "Google Calendar not connected yet" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "create_event": {
        // TODO: Create a Google Calendar event for the booking
        console.log(`[PLACEHOLDER] create_event for booking ${booking?.id}`);
        return new Response(
          JSON.stringify({ placeholder: true, calendar_event_id: null, message: "Google Calendar not connected yet" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete_event": {
        // TODO: Delete Google Calendar event on cancellation
        console.log(`[PLACEHOLDER] delete_event for booking ${booking?.id}`);
        return new Response(
          JSON.stringify({ placeholder: true, message: "Google Calendar not connected yet" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (err) {
    console.error("google-calendar-sync error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
