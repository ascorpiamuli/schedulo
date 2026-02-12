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
