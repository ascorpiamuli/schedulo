import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type AttendeeRole = 'host' | 'co-host' | 'presenter' | 'attendee' | 'guest' | 'observer';
export type LocationType = 'video' | 'phone' | 'in_person';
export type ScheduleType = 'flexible' | 'one_time';

export interface OneTimeEventData {
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
}

export interface EventTeamMember {
  id: string;
  event_type_id: string;
  user_id: string;
  role: AttendeeRole;
  is_required: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface CustomField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'email' | 'phone';
  required: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
}

export interface ReminderSettings {
  '24h': boolean;
  '1h': boolean;
  '15min': boolean;
  custom?: Array<{
    minutes: number;
    type: 'email' | 'sms' | 'push' | 'webhook';
  }>;
}

export interface EventType {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: number;
  location_type: LocationType;
  location_details: string | null;
  color: string;
  buffer_before: number;
  buffer_after: number;
  is_active: boolean;
  price_cents: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
  
  // Multi-attendee fields
  max_attendees: number;
  min_attendees: number;
  allow_additional_guests: boolean;
  guests_can_invite_others: boolean;
  require_approval: boolean;
  team_event: boolean;
  waiting_list_enabled: boolean;
  reminder_settings: ReminderSettings;
  custom_fields: CustomField[];
  payment_required_per_attendee: boolean;
  booking_confirmation_message: string | null;
  cancellation_policy: string | null;
  show_attendees_to_guests: boolean;
  
  // Meeting link fields
  permanent_meeting_link: string | null;
  generate_meeting_link: boolean;
  meeting_provider: 'google_meet' | 'zoom' | 'microsoft_teams' | 'custom';
  host_join_first: boolean;
  conference_data: any;
  
  // One-time event fields
  schedule_type: ScheduleType;
  one_time_event: OneTimeEventData | null;
  
  // Relations
  team_members?: EventTeamMember[];
}

export interface CreateEventTypeData {
  title: string;
  slug: string;
  description?: string | null;
  duration: number;
  location_type: LocationType;
  location_details?: string | null;
  color: string;
  buffer_before: number;
  buffer_after: number;
  is_active: boolean;
  price_cents?: number | null;
  currency: string;
  user_id: string;
  
  // Multi-attendee fields (optional with defaults)
  max_attendees?: number;
  min_attendees?: number;
  allow_additional_guests?: boolean;
  guests_can_invite_others?: boolean;
  require_approval?: boolean;
  team_event?: boolean;
  waiting_list_enabled?: boolean;
  reminder_settings?: ReminderSettings;
  custom_fields?: CustomField[];
  payment_required_per_attendee?: boolean;
  booking_confirmation_message?: string | null;
  cancellation_policy?: string | null;
  show_attendees_to_guests?: boolean;
  
  // Meeting link fields
  permanent_meeting_link?: string | null;
  generate_meeting_link?: boolean;
  meeting_provider?: 'google_meet' | 'zoom' | 'microsoft_teams' | 'custom';
  host_join_first?: boolean;
  conference_data?: any;
  
  // One-time event fields
  schedule_type?: ScheduleType;
  one_time_event?: OneTimeEventData | null;
  
  // Relations
  team_members?: Omit<EventTeamMember, 'id' | 'event_type_id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateEventTypeData extends Partial<CreateEventTypeData> {
  id: string;
}

// Helper function to calculate duration from one_time_event
function calculateDurationFromOneTimeEvent(oneTimeEvent: OneTimeEventData | null): number {
  if (!oneTimeEvent) return 30; // default
  
  const { start_time, end_time } = oneTimeEvent;
  const [startH, startM] = start_time.split(':').map(Number);
  const [endH, endM] = end_time.split(':').map(Number);
  
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  
  return endTotal - startTotal;
}

// ============================================
// HOOKS
// ============================================

export function useEventTypes() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["event_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_types")
        .select(`
          *,
          event_team_members (
            id,
            user_id,
            role,
            is_required,
            created_at,
            updated_at
          )
        `)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Parse JSON fields and ensure defaults
      return (data || []).map(event => ({
        ...event,
        reminder_settings: event.reminder_settings || { '24h': true, '1h': false, '15min': false },
        custom_fields: event.custom_fields || [],
        max_attendees: event.max_attendees ?? 1,
        min_attendees: event.min_attendees ?? 1,
        allow_additional_guests: event.allow_additional_guests ?? false,
        guests_can_invite_others: event.guests_can_invite_others ?? false,
        require_approval: event.require_approval ?? false,
        team_event: event.team_event ?? false,
        waiting_list_enabled: event.waiting_list_enabled ?? false,
        payment_required_per_attendee: event.payment_required_per_attendee ?? false,
        show_attendees_to_guests: event.show_attendees_to_guests ?? true,
        generate_meeting_link: event.generate_meeting_link ?? true,
        meeting_provider: event.meeting_provider || 'google_meet',
        host_join_first: event.host_join_first ?? true,
        schedule_type: event.schedule_type || 'flexible',
        one_time_event: event.one_time_event || null
      })) as EventType[];
    },
    enabled: !!user,
  });
}

export function useEventTypeBySlug(userId: string | undefined, slug: string | undefined) {
  return useQuery({
    queryKey: ["event_type", userId, slug],
    queryFn: async () => {
      if (!userId || !slug) throw new Error("User ID and slug are required");

      const { data, error } = await supabase
        .from("event_types")
        .select(`
          *,
          event_team_members (
            id,
            user_id,
            role,
            is_required,
            created_at,
            updated_at
          )
        `)
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

      return {
        ...data,
        reminder_settings: data.reminder_settings || { '24h': true, '1h': false, '15min': false },
        custom_fields: data.custom_fields || [],
        max_attendees: data.max_attendees ?? 1,
        min_attendees: data.min_attendees ?? 1,
        allow_additional_guests: data.allow_additional_guests ?? false,
        guests_can_invite_others: data.guests_can_invite_others ?? false,
        require_approval: data.require_approval ?? false,
        team_event: data.team_event ?? false,
        waiting_list_enabled: data.waiting_list_enabled ?? false,
        payment_required_per_attendee: data.payment_required_per_attendee ?? false,
        show_attendees_to_guests: data.show_attendees_to_guests ?? true,
        generate_meeting_link: data.generate_meeting_link ?? true,
        meeting_provider: data.meeting_provider || 'google_meet',
        host_join_first: data.host_join_first ?? true,
        schedule_type: data.schedule_type || 'flexible',
        one_time_event: data.one_time_event || null
      } as EventType;
    },
    enabled: !!userId && !!slug,
    retry: false,
  });
}

export function useEventType(id: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["event_type", id],
    queryFn: async () => {
      if (!id) throw new Error("Event ID is required");

      const { data, error } = await supabase
        .from("event_types")
        .select(`
          *,
          event_team_members (
            id,
            user_id,
            role,
            is_required,
            created_at,
            updated_at
          )
        `)
        .eq("id", id)
        .eq("user_id", user!.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error("Event not found");
        }
        throw error;
      }

      return {
        ...data,
        reminder_settings: data.reminder_settings || { '24h': true, '1h': false, '15min': false },
        custom_fields: data.custom_fields || [],
        max_attendees: data.max_attendees ?? 1,
        min_attendees: data.min_attendees ?? 1,
        allow_additional_guests: data.allow_additional_guests ?? false,
        guests_can_invite_others: data.guests_can_invite_others ?? false,
        require_approval: data.require_approval ?? false,
        team_event: data.team_event ?? false,
        waiting_list_enabled: data.waiting_list_enabled ?? false,
        payment_required_per_attendee: data.payment_required_per_attendee ?? false,
        show_attendees_to_guests: data.show_attendees_to_guests ?? true,
        generate_meeting_link: data.generate_meeting_link ?? true,
        meeting_provider: data.meeting_provider || 'google_meet',
        host_join_first: data.host_join_first ?? true,
        schedule_type: data.schedule_type || 'flexible',
        one_time_event: data.one_time_event || null
      } as EventType;
    },
    enabled: !!id && !!user,
  });
}

export function usePublicEventTypeBySlug(userId: string | undefined, slug: string | undefined) {
  return useQuery({
    queryKey: ["public_event_type", userId, slug],
    queryFn: async () => {
      if (!userId || !slug) throw new Error("User ID and slug are required");

      const { data, error } = await supabase
        .from("event_types")
        .select(`
          *,
          event_team_members (
            id,
            user_id,
            role,
            is_required,
            created_at,
            updated_at
          )
        `)
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

      return {
        ...data,
        reminder_settings: data.reminder_settings || { '24h': true, '1h': false, '15min': false },
        custom_fields: data.custom_fields || [],
        max_attendees: data.max_attendees ?? 1,
        min_attendees: data.min_attendees ?? 1,
        allow_additional_guests: data.allow_additional_guests ?? false,
        guests_can_invite_others: data.guests_can_invite_others ?? false,
        require_approval: data.require_approval ?? false,
        team_event: data.team_event ?? false,
        waiting_list_enabled: data.waiting_list_enabled ?? false,
        payment_required_per_attendee: data.payment_required_per_attendee ?? false,
        show_attendees_to_guests: data.show_attendees_to_guests ?? true,
        generate_meeting_link: data.generate_meeting_link ?? true,
        meeting_provider: data.meeting_provider || 'google_meet',
        host_join_first: data.host_join_first ?? true,
        schedule_type: data.schedule_type || 'flexible',
        one_time_event: data.one_time_event || null
      } as EventType;
    },
    enabled: !!userId && !!slug,
    retry: false,
  });
}

export function useCreateEventType() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateEventTypeData) => {
      const { team_members, ...eventData } = data;
      
      // Calculate duration from one_time_event if present
      let duration = eventData.duration;
      if (eventData.schedule_type === 'one_time' && eventData.one_time_event) {
        duration = calculateDurationFromOneTimeEvent(eventData.one_time_event);
      }
      
      // Set defaults for multi-attendee fields
      const eventWithDefaults = {
        max_attendees: 1,
        min_attendees: 1,
        allow_additional_guests: false,
        guests_can_invite_others: false,
        require_approval: false,
        team_event: false,
        waiting_list_enabled: false,
        reminder_settings: { '24h': true, '1h': false, '15min': false },
        custom_fields: [],
        payment_required_per_attendee: false,
        show_attendees_to_guests: true,
        generate_meeting_link: true,
        meeting_provider: 'google_meet',
        host_join_first: true,
        schedule_type: 'flexible',
        one_time_event: null,
        ...eventData,
        duration, // Use calculated duration
      };

      // Insert event type
      const { data: eventType, error: eventError } = await supabase
        .from("event_types")
        .insert(eventWithDefaults)
        .select()
        .single();

      if (eventError) throw eventError;

      // Insert team members if any
      if (team_members && team_members.length > 0) {
        const { error: teamError } = await supabase
          .from("event_team_members")
          .insert(
            team_members.map(member => ({
              ...member,
              event_type_id: eventType.id
            }))
          );

        if (teamError) throw teamError;
      }

      return eventType;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event_types"] });
    },
  });
}

export function useUpdateEventType() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateEventTypeData) => {
      const { team_members, ...eventData } = data;
      
      // Calculate duration from one_time_event if present
      let duration = eventData.duration;
      if (eventData.schedule_type === 'one_time' && eventData.one_time_event) {
        duration = calculateDurationFromOneTimeEvent(eventData.one_time_event);
      }
      
      // Update event type with calculated duration
      const updateData = {
        ...eventData,
        ...(duration ? { duration } : {})
      };

      const { data: eventType, error: eventError } = await supabase
        .from("event_types")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (eventError) throw eventError;

      // Update team members if provided
      if (team_members) {
        // Delete existing team members
        await supabase
          .from("event_team_members")
          .delete()
          .eq("event_type_id", id);

        // Insert new team members
        if (team_members.length > 0) {
          const { error: teamError } = await supabase
            .from("event_team_members")
            .insert(
              team_members.map(member => ({
                ...member,
                event_type_id: id
              }))
            );

          if (teamError) throw teamError;
        }
      }

      return eventType;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["event_types"] });
      qc.invalidateQueries({ queryKey: ["event_type", variables.id] });
    },
  });
}

export function useDeleteEventType() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Delete team members first (cascade should handle this, but being explicit)
      await supabase
        .from("event_team_members")
        .delete()
        .eq("event_type_id", id);

      // Delete event type
      const { error } = await supabase
        .from("event_types")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event_types"] });
    },
  });
}