import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export interface Booking {
  id: string;
  event_type_id: string;
  host_user_id: string;
  guest_name: string;
  guest_email: string;
  guest_notes: string | null;
  guest_timezone: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string | null;
  payment_amount_cents: number | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  event_types?: { title: string; color: string; duration: number; location_type: string } | null;
}

export function useBookings(filter: "upcoming" | "past" | "cancelled" = "upcoming") {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bookings", filter],
    queryFn: async () => {
      let query = supabase
        .from("bookings")
        .select("*, event_types(title, color, duration, location_type)")
        .eq("host_user_id", user!.id);

      const now = new Date().toISOString();

      if (filter === "upcoming") {
        query = query.eq("status", "confirmed").gte("start_time", now).order("start_time", { ascending: true });
      } else if (filter === "past") {
        query = query.eq("status", "confirmed").lt("start_time", now).order("start_time", { ascending: false });
      } else {
        query = query.eq("status", "cancelled").order("cancelled_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useRescheduleBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, start_time, end_time }: { id: string; start_time: string; end_time: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ start_time, end_time })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
