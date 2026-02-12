import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type EmailType = "confirmation" | "cancellation" | "reminder";

interface EmailPayload {
  type: EmailType;
  booking: {
    id: string;
    guest_name: string;
    guest_email: string;
    host_name: string;
    host_email?: string;
    event_title: string;
    start_time: string;
    end_time: string;
    duration: number;
    location_type: string;
    guest_timezone: string;
  };
}

function buildConfirmationEmail(booking: EmailPayload["booking"]) {
  const start = new Date(booking.start_time);
  const dateStr = start.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: booking.guest_timezone,
  });
  const timeStr = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: booking.guest_timezone,
  });

  return {
    subject: `Booking confirmed: ${booking.event_title} with ${booking.host_name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're booked!</h2>
        <p>Hi ${booking.guest_name},</p>
        <p>Your <strong>${booking.event_title}</strong> with <strong>${booking.host_name}</strong> has been confirmed.</p>
        <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Date:</strong> ${dateStr}</p>
          <p style="margin: 4px 0;"><strong>Time:</strong> ${timeStr}</p>
          <p style="margin: 4px 0;"><strong>Duration:</strong> ${booking.duration} minutes</p>
          <p style="margin: 4px 0;"><strong>Location:</strong> ${booking.location_type}</p>
        </div>
        <p>See you there!</p>
      </div>
    `,
  };
}

function buildCancellationEmail(booking: EmailPayload["booking"]) {
  return {
    subject: `Booking cancelled: ${booking.event_title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Cancelled</h2>
        <p>Hi ${booking.guest_name},</p>
        <p>Your <strong>${booking.event_title}</strong> with <strong>${booking.host_name}</strong> has been cancelled.</p>
        <p>If this was unexpected, please reach out to the host to reschedule.</p>
      </div>
    `,
  };
}

function buildReminderEmail(booking: EmailPayload["booking"]) {
  const start = new Date(booking.start_time);
  const timeStr = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: booking.guest_timezone,
  });

  return {
    subject: `Reminder: ${booking.event_title} today at ${timeStr}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Meeting Reminder</h2>
        <p>Hi ${booking.guest_name},</p>
        <p>This is a reminder that your <strong>${booking.event_title}</strong> with <strong>${booking.host_name}</strong> is coming up today at <strong>${timeStr}</strong>.</p>
      </div>
    `,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();
    const { type, booking } = payload;

    if (!type || !booking) {
      return new Response(
        JSON.stringify({ error: "Missing type or booking data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let email: { subject: string; html: string };

    switch (type) {
      case "confirmation":
        email = buildConfirmationEmail(booking);
        break;
      case "cancellation":
        email = buildCancellationEmail(booking);
        break;
      case "reminder":
        email = buildReminderEmail(booking);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown email type: ${type}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // ── PLACEHOLDER: Replace with real email service ──────────
    // TODO: Wire up Resend, SendGrid, or another email provider.
    // Example with Resend:
    //
    // const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    // const res = await fetch("https://api.resend.com/emails", {
    //   method: "POST",
    //   headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     from: "Schedulo <noreply@yourdomain.com>",
    //     to: [booking.guest_email],
    //     subject: email.subject,
    //     html: email.html,
    //   }),
    // });

    console.log(`[PLACEHOLDER EMAIL] type=${type}, to=${booking.guest_email}, subject=${email.subject}`);
    console.log(`[PLACEHOLDER EMAIL] html preview:`, email.html.substring(0, 200));
    // ─────────────────────────────────────────────────────────

    return new Response(
      JSON.stringify({
        success: true,
        placeholder: true,
        message: `Email (${type}) would be sent to ${booking.guest_email}`,
        subject: email.subject,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-booking-email error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
