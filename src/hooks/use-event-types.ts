import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export interface EventType {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: number;
  location_type: string;
  location_details: string | null;
  color: string;
  buffer_before: number;
  buffer_after: number;
  is_active: boolean;
  price_cents: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export type EventTypeInsert = Omit<EventType, "id" | "created_at" | "updated_at">;

export function useEventTypes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["event_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_types")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EventType[];
    },
    enabled: !!user,
  });
}

/**
 * Hook to get a single event type by slug for a specific user
 * @param userId - The user ID of the event owner
 * @param slug - The slug of the event
 * @returns Query result with the event type
 */
export function useEventTypeBySlug(userId: string | undefined, slug: string | undefined) {
  return useQuery({
    queryKey: ["event_type", userId, slug],
    queryFn: async () => {
      if (!userId || !slug) throw new Error("User ID and slug are required");

      const { data, error } = await supabase
        .from("event_types")
        .select("*")
        .eq("user_id", userId)
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error("Event not found");
        }
        throw error;
      }

      return data as EventType;
    },
    enabled: !!userId && !!slug,
    retry: false,
  });
}

/**
 * Hook to get a single event type by ID
 * @param id - The event type ID
 * @returns Query result with the event type
 */
export function useEventType(id: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["event_type", id],
    queryFn: async () => {
      if (!id) throw new Error("Event ID is required");

      const { data, error } = await supabase
        .from("event_types")
        .select("*")
        .eq("id", id)
        .eq("user_id", user!.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error("Event not found");
        }
        throw error;
      }

      return data as EventType;
    },
    enabled: !!id && !!user,
  });
}

/**
 * Hook to get a public event type by slug (no authentication required)
 * @param userId - The user ID of the event owner
 * @param slug - The slug of the event
 * @returns Query result with the event type
 */
export function usePublicEventTypeBySlug(userId: string | undefined, slug: string | undefined) {
  return useQuery({
    queryKey: ["public_event_type", userId, slug],
    queryFn: async () => {
      if (!userId || !slug) throw new Error("User ID and slug are required");

      const { data, error } = await supabase
        .from("event_types")
        .select("*")
        .eq("user_id", userId)
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error("Event not found");
        }
        throw error;
      }

      return data as EventType;
    },
    enabled: !!userId && !!slug,
    retry: false,
  });
}

export function useCreateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: Omit<EventTypeInsert, "user_id"> & { user_id: string }) => {
      const { data, error } = await supabase.from("event_types").insert(event).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event_types"] }),
  });
}

export function useUpdateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EventType> & { id: string }) => {
      const { data, error } = await supabase.from("event_types").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event_types"] }),
  });
}

export function useDeleteEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event_types"] }),
  });
}