import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export interface AvailabilitySlot {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface AvailabilityOverride {
  id: string;
  user_id: string;
  date: string;
  is_blocked: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
}

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function useAvailability() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["availability"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("user_id", user!.id)
        .order("day_of_week")
        .order("start_time");
      if (error) throw error;
      return data as AvailabilitySlot[];
    },
    enabled: !!user,
  });
}

export function useAvailabilityOverrides() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["availability_overrides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability_overrides")
        .select("*")
        .eq("user_id", user!.id)
        .order("date");
      if (error) throw error;
      return data as AvailabilityOverride[];
    },
    enabled: !!user,
  });
}

export function useSaveAvailability() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (slots: { day_of_week: number; start_time: string; end_time: string }[]) => {
      // Delete existing and re-insert
      const { error: delError } = await supabase
        .from("availability")
        .delete()
        .eq("user_id", user!.id);
      if (delError) throw delError;

      if (slots.length > 0) {
        const { error } = await supabase
          .from("availability")
          .insert(slots.map((s) => ({ ...s, user_id: user!.id })));
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability"] }),
  });
}

export function useCreateOverride() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (override: Omit<AvailabilityOverride, "id" | "user_id" | "created_at">) => {
      const { data, error } = await supabase
        .from("availability_overrides")
        .upsert({ ...override, user_id: user!.id }, { onConflict: "user_id,date" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability_overrides"] }),
  });
}

export function useDeleteOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("availability_overrides").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability_overrides"] }),
  });
}
