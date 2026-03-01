import { supabase } from "@/integrations/supabase/client";

// utils/auth.ts
export const isUserDeleted = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('deleted_at')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) return false;
  return !!data?.deleted_at;
};