import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProfileByUsername(username: string | undefined) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!username,
  });
}

export function usePublicEventTypes(userId: string | undefined) {
  return useQuery({
    queryKey: ["public_event_types", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_types")
        .select("*")
        .eq("user_id", userId!)
        .eq("is_active", true)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function usePublicAvailability(userId: string | undefined) {
  return useQuery({
    queryKey: ["public_availability", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("user_id", userId!)
        .order("day_of_week")
        .order("start_time");
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function usePublicOverrides(userId: string | undefined) {
  return useQuery({
    queryKey: ["public_overrides", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability_overrides")
        .select("*")
        .eq("user_id", userId!)
        .gte("date", new Date().toISOString().split("T")[0]);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useExistingBookings(userId: string | undefined, dateStr: string | undefined) {
  return useQuery({
    queryKey: ["existing_bookings", userId, dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("start_time, end_time")
        .eq("host_user_id", userId!)
        .eq("status", "confirmed")
        .gte("start_time", `${dateStr}T00:00:00Z`)
        .lt("start_time", `${dateStr}T23:59:59Z`);
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!dateStr,
  });
}
