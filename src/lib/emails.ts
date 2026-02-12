import { supabase } from "@/integrations/supabase/client";

export type EmailType = "confirmation" | "cancellation" | "reminder";

interface BookingEmailData {
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
}

export async function sendBookingEmail(type: EmailType, booking: BookingEmailData) {
  try {
    const { data, error } = await supabase.functions.invoke("send-booking-email", {
      body: { type, booking },
    });

    if (error) {
      console.warn(`Failed to send ${type} email:`, error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.warn(`Failed to send ${type} email:`, err);
    return { success: false, error: err };
  }
}
