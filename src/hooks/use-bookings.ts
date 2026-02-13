import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth"; // Using useAuth instead of useSession

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
  event_types?: { 
    id: string;
    title: string; 
    color: string; 
    duration: number; 
    location_type: string;
    location_details?: string;
  } | null;
}

export function useBookings(filter: "upcoming" | "past" | "cancelled" = "upcoming") {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["bookings", filter, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from("bookings")
        .select("*, event_types(id, title, color, duration, location_type, location_details)")
        .eq("host_user_id", user.id);

      const now = new Date().toISOString();

      if (filter === "upcoming") {
        query = query
          .eq("status", "confirmed")
          .gte("start_time", now)
          .order("start_time", { ascending: true });
      } else if (filter === "past") {
        query = query
          .eq("status", "confirmed")
          .lt("start_time", now)
          .order("start_time", { ascending: false });
      } else {
        query = query
          .eq("status", "cancelled")
          .order("cancelled_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user?.id,
  });
}

export function useCancelBooking() {
  const { user } = useAuth();
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      // First verify the booking belongs to the user
      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("host_user_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      if (booking.host_user_id !== user.id) throw new Error("Unauthorized");

      // Then cancel it
      const { error } = await supabase
        .from("bookings")
        .update({ 
          status: "cancelled", 
          cancelled_at: new Date().toISOString() 
        })
        .eq("id", id)
        .eq("host_user_id", user.id); // Extra safety
      
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useRescheduleBooking() {
  const { user } = useAuth();
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, start_time, end_time }: { id: string; start_time: string; end_time: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      // Verify the booking belongs to the user
      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("host_user_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      if (booking.host_user_id !== user.id) throw new Error("Unauthorized");

      // Then reschedule it
      const { error } = await supabase
        .from("bookings")
        .update({ start_time, end_time })
        .eq("id", id)
        .eq("host_user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

// Fetch a single booking by ID
export function useBooking(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['booking', id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) throw new Error('Booking ID and user required');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          event_types (
            id,
            title,
            duration,
            location_type,
            location_details,
            color
          )
        `)
        .eq('id', id)
        .eq('host_user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Booking;
    },
    enabled: !!id && !!user?.id,
  });
}


/**
 * Hook to get the count of bookings for a specific event type
 * @param eventTypeId - The ID of the event type
 * @param status - Optional status filter (default: 'confirmed')
 * @returns The count of bookings
 */
export function useEventTypeBookingCount(
  eventTypeId: string | undefined, 
  status: 'confirmed' | 'cancelled' | 'all' = 'confirmed'
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['eventTypeBookings', 'count', eventTypeId, status, user?.id],
    queryFn: async () => {
      if (!eventTypeId || !user?.id) return 0;

      let query = supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("event_type_id", eventTypeId)
        .eq("host_user_id", user.id);

      if (status !== 'all') {
        query = query.eq("status", status);
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    },
    enabled: !!eventTypeId && !!user?.id,
  });
}

/**
 * Hook to get booking counts for multiple event types at once
 * @param eventTypeIds - Array of event type IDs
 * @param status - Optional status filter (default: 'confirmed')
 * @returns Record of event type ID to count
 */
export function useEventTypesBookingCounts(
  eventTypeIds: string[] = [],
  status: 'confirmed' | 'cancelled' | 'all' = 'confirmed'
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['eventTypesBookings', 'counts', eventTypeIds.join(','), status, user?.id],
    queryFn: async () => {
      if (!eventTypeIds.length || !user?.id) return {};

      // First, get all bookings for these event types
      let query = supabase
        .from("bookings")
        .select("event_type_id, status")
        .in("event_type_id", eventTypeIds)
        .eq("host_user_id", user.id);

      if (status !== 'all') {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Then count them per event type
      const counts: Record<string, number> = {};
      
      eventTypeIds.forEach(id => {
        counts[id] = 0;
      });

      data?.forEach(booking => {
        if (booking.event_type_id) {
          counts[booking.event_type_id] = (counts[booking.event_type_id] || 0) + 1;
        }
      });

      return counts;
    },
    enabled: eventTypeIds.length > 0 && !!user?.id,
  });
}

/**
 * Hook to get detailed booking statistics for an event type
 * @param eventTypeId - The ID of the event type
 * @returns Object with various booking stats
 */
export function useEventTypeBookingStats(eventTypeId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['eventTypeBookings', 'stats', eventTypeId, user?.id],
    queryFn: async () => {
      if (!eventTypeId || !user?.id) {
        return {
          total: 0,
          confirmed: 0,
          cancelled: 0,
          upcoming: 0,
          past: 0,
          revenue: 0,
        };
      }

      const now = new Date().toISOString();

      // Get all bookings for this event type
      const { data, error } = await supabase
        .from("bookings")
        .select("status, start_time, payment_amount_cents")
        .eq("event_type_id", eventTypeId)
        .eq("host_user_id", user.id);

      if (error) throw error;

      // Calculate statistics
      const stats = {
        total: data.length,
        confirmed: data.filter(b => b.status === 'confirmed').length,
        cancelled: data.filter(b => b.status === 'cancelled').length,
        upcoming: data.filter(b => b.status === 'confirmed' && b.start_time > now).length,
        past: data.filter(b => b.status === 'confirmed' && b.start_time < now).length,
        revenue: data.reduce((sum, b) => sum + (b.payment_amount_cents || 0), 0) / 100,
      };

      return stats;
    },
    enabled: !!eventTypeId && !!user?.id,
  });
}