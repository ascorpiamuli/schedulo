import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useOrganization } from "./use-team-management";

// ============================================
// TYPE DEFINITIONS (matching your actual schema)
// ============================================

export type AttendeeRole = 'host' | 'co-host' | 'presenter' | 'attendee' | 'guest' | 'observer';
export type LocationType = 'video' | 'phone' | 'in_person';
export type ScheduleType = 'flexible' | 'one_time';
export type EventScope = 'personal' | 'organization' | 'department';

export interface OneTimeEventData {
  date: string;
  start_time: string;
  end_time: string;
}

export interface EventTeamMember {
  id: string;
  event_type_id: string;
  user_id: string;
  role: AttendeeRole;
  is_required: boolean;
  created_at: string;
  updated_at: string;
  // We'll fetch user data separately
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
  
  organization_id: string | null;
  department_id: string | null;
  scope: EventScope;
  
  max_attendees: number;
  min_attendees: number;
  allow_additional_guests: boolean;
  guests_can_invite_others: boolean;
  require_approval: boolean;
  waiting_list_enabled: boolean;
  reminder_settings: ReminderSettings;
  custom_fields: CustomField[];
  payment_required_per_attendee: boolean;
  booking_confirmation_message: string | null;
  cancellation_policy: string | null;
  show_attendees_to_guests: boolean;
  
  permanent_meeting_link: string | null;
  generate_meeting_link: boolean;
  meeting_provider: 'google_meet' | 'zoom' | 'microsoft_teams' | 'custom';
  host_join_first: boolean;
  conference_data: any;
  
  schedule_type: ScheduleType;
  one_time_event: OneTimeEventData | null;
  
  team_members?: EventTeamMember[];
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  department?: {
    id: string;
    name: string;
    color: string;
  };
  // We'll add user data after fetching
  team_members_with_users?: Array<EventTeamMember & {
    user?: {
      email: string;
      full_name?: string;
      avatar_url?: string;
    }
  }>;
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
  
  organization_id?: string | null;
  department_id?: string | null;
  scope: EventScope;
  
  max_attendees?: number;
  min_attendees?: number;
  allow_additional_guests?: boolean;
  guests_can_invite_others?: boolean;
  require_approval?: boolean;
  waiting_list_enabled?: boolean;
  reminder_settings?: ReminderSettings;
  custom_fields?: CustomField[];
  payment_required_per_attendee?: boolean;
  booking_confirmation_message?: string | null;
  cancellation_policy?: string | null;
  show_attendees_to_guests?: boolean;
  
  permanent_meeting_link?: string | null;
  generate_meeting_link?: boolean;
  meeting_provider?: 'google_meet' | 'zoom' | 'microsoft_teams' | 'custom';
  host_join_first?: boolean;
  conference_data?: any;
  
  schedule_type?: ScheduleType;
  one_time_event?: OneTimeEventData | null;
  
  team_members?: Omit<EventTeamMember, 'id' | 'event_type_id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateEventTypeData extends Partial<CreateEventTypeData> {
  id: string;
}

// Helper function to calculate duration from one_time_event
function calculateDurationFromOneTimeEvent(oneTimeEvent: OneTimeEventData | null): number {
  if (!oneTimeEvent) return 30;
  
  const { start_time, end_time } = oneTimeEvent;
  const [startH, startM] = start_time.split(':').map(Number);
  const [endH, endM] = end_time.split(':').map(Number);
  
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  
  return endTotal - startTotal;
}

// Helper function to fetch user data for team members
async function fetchUsersForTeamMembers(teamMembers: any[]): Promise<any[]> {
  if (!teamMembers || teamMembers.length === 0) return [];
  
  const userIds = teamMembers.map(tm => tm.user_id);
  
  const { data: users, error } = await supabase
    .from('profiles')
    .select('user_id, email, full_name, avatar_url')
    .in('user_id', userIds);
  
  if (error) {
    console.error("Error fetching user profiles:", error);
    return teamMembers;
  }
  
  const userMap = new Map(users?.map(u => [u.user_id, u]) || []);
  
  return teamMembers.map(tm => ({
    ...tm,
    user: userMap.get(tm.user_id) || { email: 'Unknown', full_name: null }
  }));
}

// ============================================
// MAIN HOOKS
// ============================================

// hooks/use-event-types.ts - Update the useEventTypes function

// hooks/use-event-types.ts - Fix the query

export function useEventTypes(scope?: EventScope, departmentId?: string) {
  const { user } = useAuth();
  const { data: organization } = useOrganization();
  const { data: currentTeamMember } = useCurrentTeamMember();
  
  return useQuery({
    queryKey: ["event_types", scope, departmentId, organization?.id, user?.id, currentTeamMember?.department],
    queryFn: async () => {
      console.log("🔍 [useEventTypes] Starting fetch with params:", { 
        scope, 
        departmentId, 
        userId: user?.id,
        orgId: organization?.id,
        userDepartment: currentTeamMember?.department
      });
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      // Base query - select from event_types with relations
      let query = supabase
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
          ),
          organization:organizations!event_types_organization_id_fkey (
            id,
            name,
            slug
          ),
          department:departments!event_types_department_id_fkey (
            id,
            name,
            color
          )
        `);

      // Apply filters based on scope
      if (scope === 'personal') {
        query = query
          .eq('user_id', user.id)
          .eq('scope', 'personal');
      } 
      else if (scope === 'organization' && organization) {
        // Organization events - accessible to all team members
        query = query
          .eq('organization_id', organization.id)
          .eq('scope', 'organization');
      } 
      else if (scope === 'department' && departmentId) {
        // Specific department events
        query = query
          .eq('department_id', departmentId)
          .eq('scope', 'department');
      } 
      else {
        // No filter - show ALL events the user has access to:
        // 1. Personal events (created by user)
        // 2. Organization events (if user is in an organization)
        // 3. Department events (if user is in a department)
        
        if (organization) {
          // User is in an organization
          if (currentTeamMember?.department) {
            // First, get the department IDs for the user's department name
            const { data: departments } = await supabase
              .from('departments')
              .select('id')
              .eq('organization_id', organization.id)
              .eq('name', currentTeamMember.department);

            const departmentIds = departments?.map(d => d.id) || [];
            
            if (departmentIds.length > 0) {
              // User is in a department - show personal + organization + their department events
              query = query
                .or(
                  `and(user_id.eq.${user.id},scope.eq.personal),` +
                  `and(scope.eq.organization,organization_id.eq.${organization.id}),` +
                  `and(scope.eq.department,department_id.in.(${departmentIds.join(',')}))`
                );
            } else {
              // Department name found but no matching IDs (shouldn't happen)
              query = query
                .or(
                  `and(user_id.eq.${user.id},scope.eq.personal),` +
                  `and(scope.eq.organization,organization_id.eq.${organization.id})`
                );
            }
          } else {
            // User in organization but no department - show personal + organization events only
            query = query
              .or(
                `and(user_id.eq.${user.id},scope.eq.personal),` +
                `and(scope.eq.organization,organization_id.eq.${organization.id})`
              );
          }
        } else {
          // No organization - only personal events
          query = query.eq('user_id', user.id);
        }
      }

      console.log("🚀 [useEventTypes] Executing query...");
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("❌ [useEventTypes] Query error:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Fetch user data for team members
      const eventsWithUsers = await Promise.all(
        data.map(async (event) => {
          if (event.event_team_members && event.event_team_members.length > 0) {
            const teamMembersWithUsers = await fetchUsersForTeamMembers(event.event_team_members);
            return {
              ...event,
              team_members_with_users: teamMembersWithUsers,
              event_team_members: undefined // Remove raw data
            };
          }
          return event;
        })
      );

      // Transform the data
      const transformedData = eventsWithUsers.map(event => ({
        ...event,
        reminder_settings: event.reminder_settings || { '24h': true, '1h': false, '15min': false },
        custom_fields: event.custom_fields || [],
        max_attendees: event.max_attendees ?? 1,
        min_attendees: event.min_attendees ?? 1,
        allow_additional_guests: event.allow_additional_guests ?? false,
        guests_can_invite_others: event.guests_can_invite_others ?? false,
        require_approval: event.require_approval ?? false,
        waiting_list_enabled: event.waiting_list_enabled ?? false,
        payment_required_per_attendee: event.payment_required_per_attendee ?? false,
        show_attendees_to_guests: event.show_attendees_to_guests ?? true,
        generate_meeting_link: event.generate_meeting_link ?? true,
        meeting_provider: event.meeting_provider || 'google_meet',
        host_join_first: event.host_join_first ?? true,
        schedule_type: event.schedule_type || 'flexible',
        one_time_event: event.one_time_event || null,
      }));

      const personal = transformedData.filter(e => e.scope === 'personal').length;
      const org = transformedData.filter(e => e.scope === 'organization').length;
      const dept = transformedData.filter(e => e.scope === 'department').length;
      console.log(`📊 [useEventTypes] Events: ${personal} personal, ${org} organization, ${dept} department`);

      return transformedData as EventType[];
    },
    enabled: !!user,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
}
export function usePersonalEvents() {
  return useEventTypes('personal');
}

export function useOrganizationEvents() {
  return useEventTypes('organization');
}

export function useDepartmentEvents(departmentId: string) {
  return useEventTypes('department', departmentId);
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
          ),
          organization:organizations!event_types_organization_id_fkey (
            id,
            name,
            slug
          ),
          department:departments!event_types_department_id_fkey (
            id,
            name,
            color
          )
        `)
        .eq("slug", slug)
        .eq("is_active", true)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error("Event not found");
        }
        throw error;
      }

      if (!data) {
        throw new Error("Event not found");
      }

      // Fetch user data for team members
      let teamMembersWithUsers = [];
      if (data.event_team_members && data.event_team_members.length > 0) {
        teamMembersWithUsers = await fetchUsersForTeamMembers(data.event_team_members);
      }

      return {
        ...data,
        team_members_with_users: teamMembersWithUsers,
        reminder_settings: data.reminder_settings || { '24h': true, '1h': false, '15min': false },
        custom_fields: data.custom_fields || [],
        max_attendees: data.max_attendees ?? 1,
        min_attendees: data.min_attendees ?? 1,
        allow_additional_guests: data.allow_additional_guests ?? false,
        guests_can_invite_others: data.guests_can_invite_others ?? false,
        require_approval: data.require_approval ?? false,
        waiting_list_enabled: data.waiting_list_enabled ?? false,
        payment_required_per_attendee: data.payment_required_per_attendee ?? false,
        show_attendees_to_guests: data.show_attendees_to_guests ?? true,
        generate_meeting_link: data.generate_meeting_link ?? true,
        meeting_provider: data.meeting_provider || 'google_meet',
        host_join_first: data.host_join_first ?? true,
        schedule_type: data.schedule_type || 'flexible',
        one_time_event: data.one_time_event || null,
      } as EventType;
    },
    enabled: !!userId && !!slug,
    retry: false,
  });
}
// hooks/use-team-management.ts (add this hook)

export const useCurrentTeamMember = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['currentTeamMember', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching current team member:', error);
        return null;
      }

      return data;
    },
    enabled: !!user,
  });
};
export function useEventType(id: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["event_type", id],
    queryFn: async () => {
      if (!id) throw new Error("Event ID is required");
      if (!user) throw new Error("Not authenticated");

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
          ),
          organization:organizations!event_types_organization_id_fkey (
            id,
            name,
            slug
          ),
          department:departments!event_types_department_id_fkey (
            id,
            name,
            color
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error("Event not found");
        }
        throw error;
      }

      // Check access
      let hasAccess = data.user_id === user.id;
      
      if (!hasAccess && data.scope === 'organization' && data.organization_id) {
        const { data: member } = await supabase
          .from('team_members')
          .select('id')
          .eq('user_id', user.id)
          .eq('organization_id', data.organization_id)
          .maybeSingle();
          
        hasAccess = !!member;
      }
      
      if (!hasAccess && data.scope === 'department' && data.department_id) {
        const { data: dept } = await supabase
          .from('departments')
          .select('organization_id')
          .eq('id', data.department_id)
          .single();
          
        if (dept) {
          const { data: member } = await supabase
            .from('team_members')
            .select('id')
            .eq('user_id', user.id)
            .eq('organization_id', dept.organization_id)
            .maybeSingle();
            
          hasAccess = !!member;
        }
      }

      if (!hasAccess) {
        throw new Error("You don't have permission to view this event");
      }

      // Fetch user data for team members
      let teamMembersWithUsers = [];
      if (data.event_team_members && data.event_team_members.length > 0) {
        teamMembersWithUsers = await fetchUsersForTeamMembers(data.event_team_members);
      }

      return {
        ...data,
        team_members_with_users: teamMembersWithUsers,
        reminder_settings: data.reminder_settings || { '24h': true, '1h': false, '15min': false },
        custom_fields: data.custom_fields || [],
        max_attendees: data.max_attendees ?? 1,
        min_attendees: data.min_attendees ?? 1,
        allow_additional_guests: data.allow_additional_guests ?? false,
        guests_can_invite_others: data.guests_can_invite_others ?? false,
        require_approval: data.require_approval ?? false,
        waiting_list_enabled: data.waiting_list_enabled ?? false,
        payment_required_per_attendee: data.payment_required_per_attendee ?? false,
        show_attendees_to_guests: data.show_attendees_to_guests ?? true,
        generate_meeting_link: data.generate_meeting_link ?? true,
        meeting_provider: data.meeting_provider || 'google_meet',
        host_join_first: data.host_join_first ?? true,
        schedule_type: data.schedule_type || 'flexible',
        one_time_event: data.one_time_event || null,
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
          ),
          organization:organizations!event_types_organization_id_fkey (
            id,
            name,
            slug
          ),
          department:departments!event_types_department_id_fkey (
            id,
            name,
            color
          )
        `)
        .eq("slug", slug)
        .eq("is_active", true)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error("Event not found");
        }
        throw error;
      }

      if (!data) {
        throw new Error("Event not found");
      }

      // Fetch user data for team members
      let teamMembersWithUsers = [];
      if (data.event_team_members && data.event_team_members.length > 0) {
        teamMembersWithUsers = await fetchUsersForTeamMembers(data.event_team_members);
      }

      return {
        ...data,
        team_members_with_users: teamMembersWithUsers,
        reminder_settings: data.reminder_settings || { '24h': true, '1h': false, '15min': false },
        custom_fields: data.custom_fields || [],
        max_attendees: data.max_attendees ?? 1,
        min_attendees: data.min_attendees ?? 1,
        allow_additional_guests: data.allow_additional_guests ?? false,
        guests_can_invite_others: data.guests_can_invite_others ?? false,
        require_approval: data.require_approval ?? false,
        waiting_list_enabled: data.waiting_list_enabled ?? false,
        payment_required_per_attendee: data.payment_required_per_attendee ?? false,
        show_attendees_to_guests: data.show_attendees_to_guests ?? true,
        generate_meeting_link: data.generate_meeting_link ?? true,
        meeting_provider: data.meeting_provider || 'google_meet',
        host_join_first: data.host_join_first ?? true,
        schedule_type: data.schedule_type || 'flexible',
        one_time_event: data.one_time_event || null,
      } as EventType;
    },
    enabled: !!userId && !!slug,
    retry: false,
  });
}

export function useCreateEventType() {
  const qc = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: CreateEventTypeData) => {
      if (!user) throw new Error("Not authenticated");
      
      const { team_members, ...eventData } = data;
      
      let duration = eventData.duration;
      if (eventData.schedule_type === 'one_time' && eventData.one_time_event) {
        duration = calculateDurationFromOneTimeEvent(eventData.one_time_event);
      }
      
      const eventWithDefaults = {
        max_attendees: 1,
        min_attendees: 1,
        allow_additional_guests: false,
        guests_can_invite_others: false,
        require_approval: false,
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
        user_id: user.id,
        ...eventData,
        duration,
      };

      const { data: eventType, error } = await supabase
        .from("event_types")
        .insert(eventWithDefaults)
        .select()
        .single();

      if (error) throw error;

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
      
      let duration = eventData.duration;
      if (eventData.schedule_type === 'one_time' && eventData.one_time_event) {
        duration = calculateDurationFromOneTimeEvent(eventData.one_time_event);
      }
      
      const updateData: any = {
        ...eventData,
        ...(duration ? { duration } : {})
      };

      const { data: eventType, error } = await supabase
        .from("event_types")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      if (team_members) {
        await supabase
          .from("event_team_members")
          .delete()
          .eq("event_type_id", id);

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
      await supabase
        .from("event_team_members")
        .delete()
        .eq("event_type_id", id);

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

export function useAvailableTeamMembers(organizationId?: string | null, departmentId?: string | null) {
  return useQuery({
    queryKey: ["available_team_members", organizationId, departmentId],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = supabase
        .from('team_members')
        .select(`
          user_id,
          role,
          status,
          department
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      if (departmentId) {
        const { data: dept } = await supabase
          .from('departments')
          .select('name')
          .eq('id', departmentId)
          .single();
          
        if (dept) {
          query = query.eq('department', dept.name);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Fetch user profiles
      const userIds = data.map(m => m.user_id).filter(Boolean);
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, avatar_url')
        .in('user_id', userIds);

      if (usersError) throw usersError;

      const userMap = new Map(users?.map(u => [u.user_id, u]) || []);

      return data.map(member => ({
        id: member.user_id,
        email: userMap.get(member.user_id)?.email || '',
        full_name: userMap.get(member.user_id)?.full_name,
        role: member.role,
        department: member.department,
        avatar_url: userMap.get(member.user_id)?.avatar_url
      }));
    },
    enabled: !!organizationId,
  });
}

// ============================================
// CONSTANTS
// ============================================

export const MEETING_PROVIDERS = [
  { value: "google_meet", label: "Google Meet", icon: "Video", color: "text-blue-600", bgColor: "bg-blue-100", description: "Auto-generate Google Meet links" },
  { value: "zoom", label: "Zoom", icon: "Video", color: "text-blue-700", bgColor: "bg-blue-100", description: "Generate Zoom meeting links (requires Zoom account)" },
  { value: "microsoft_teams", label: "Microsoft Teams", icon: "Video", color: "text-purple-600", bgColor: "bg-purple-100", description: "Generate Teams meeting links" },
  { value: "custom", label: "Custom Link", icon: "Link2", color: "text-gray-600", bgColor: "bg-gray-100", description: "Use your own meeting link" },
];

export const EVENT_SCHEDULE_TYPES = [
  { value: "flexible", label: "Flexible - Guests pick time", icon: "CalendarDays", description: "Guests choose from your available slots" },
  { value: "one_time", label: "One-Time - Fixed date & time", icon: "CalendarCheck2", description: "Single specific date and time" },
];

export const EVENT_SCOPE_OPTIONS = [
  { 
    value: "personal", 
    label: "Personal Event", 
    icon: "User", 
    color: "blue", 
    bgColor: "bg-blue-50", 
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    description: "Only you can host. Perfect for 1:1 meetings, personal consultations." 
  },
  { 
    value: "organization", 
    label: "Organization Event", 
    icon: "Users", 
    color: "green", 
    bgColor: "bg-green-50", 
    borderColor: "border-green-200",
    textColor: "text-green-700",
    description: "Any team member in your organization can host. Round-robin assignment." 
  },
  { 
    value: "department", 
    label: "Department Event", 
    icon: "Building2", 
    color: "purple", 
    bgColor: "bg-purple-50", 
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    description: "Members of a specific department can host. Perfect for department-specific meetings." 
  },
];

export const LOCATION_OPTIONS = [
  { value: "video", label: "Video Call", icon: "Video", color: "text-blue-600", bgColor: "bg-blue-100", description: "Zoom, Google Meet, Teams" },
  { value: "phone", label: "Phone Call", icon: "Phone", color: "text-orange-600", bgColor: "bg-orange-100", description: "Phone number for call" },
  { value: "in_person", label: "In Person", icon: "Building2", color: "text-green-600", bgColor: "bg-green-100", description: "Physical meeting location" },
];

export const COLOR_OPTIONS = [
  { value: "#0F172A", name: "Slate 900", text: "text-slate-900" },
  { value: "#1E40AF", name: "Blue 800", text: "text-blue-800" },
  { value: "#B45309", name: "Amber 700", text: "text-amber-700" },
  { value: "#059669", name: "Emerald 600", text: "text-emerald-600" },
  { value: "#7C3AED", name: "Violet 600", text: "text-violet-600" },
  { value: "#DB2777", name: "Pink 600", text: "text-pink-600" },
  { value: "#DC2626", name: "Red 600", text: "text-red-600" },
  { value: "#2563EB", name: "Blue 600", text: "text-blue-600" },
];

export const CURRENCY_OPTIONS = [
  { value: "usd", label: "USD ($)", symbol: "$", flag: "🇺🇸" },
  { value: "eur", label: "EUR (€)", symbol: "€", flag: "🇪🇺" },
  { value: "gbp", label: "GBP (£)", symbol: "£", flag: "🇬🇧" },
  { value: "kes", label: "KES (KSh)", symbol: "KSh", flag: "🇰🇪" },
  { value: "ngn", label: "NGN (₦)", symbol: "₦", flag: "🇳🇬" },
];

export const ATTENDEE_ROLE_OPTIONS = [
  { value: "host", label: "Host", description: "Full control over the event" },
  { value: "co-host", label: "Co-host", description: "Can manage attendees and settings" },
  { value: "presenter", label: "Presenter", description: "Can present but not manage" },
  { value: "observer", label: "Observer", description: "View-only access" },
];

export const CUSTOM_FIELD_TYPES = [
  { value: "text", label: "Short Text", icon: "📝" },
  { value: "textarea", label: "Long Text", icon: "📄" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "phone", label: "Phone Number", icon: "📞" },
  { value: "select", label: "Dropdown", icon: "▼" },
  { value: "checkbox", label: "Checkbox", icon: "☑️" },
  { value: "radio", label: "Radio Buttons", icon: "⚪" },
];

export const REMINDER_OPTIONS = [
  { value: "15min", label: "15 minutes before", minutes: 15 },
  { value: "1h", label: "1 hour before", minutes: 60 },
  { value: "24h", label: "24 hours before", minutes: 1440 },
  { value: "3d", label: "3 days before", minutes: 4320 },
  { value: "7d", label: "7 days before", minutes: 10080 },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const truncateUserId = (id: string) => {
  if (!id) return '';
  if (id.length <= 10) return id;
  return `${id.slice(0, 4)}...${id.slice(-3)}`;
};

export const slugify = (s: string) => {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export const getInitials = (name?: string | null, email?: string | null) => {
  if (name) {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return '?';
};

export const getMeetingProviderLabel = (provider: string) => {
  switch(provider) {
    case 'google_meet':
      return 'Google Meet';
    case 'zoom':
      return 'Zoom';
    case 'microsoft_teams':
      return 'Microsoft Teams';
    case 'custom':
      return 'Custom Link';
    default:
      return 'Video Call';
  }
};

export const getScopeIcon = (scope: EventScope) => {
  switch(scope) {
    case 'personal':
      return 'User';
    case 'organization':
      return 'Users';
    case 'department':
      return 'Building2';
    default:
      return 'Calendar';
  }
};

export const getScopeColor = (scope: EventScope) => {
  switch(scope) {
    case 'personal':
      return 'blue';
    case 'organization':
      return 'green';
    case 'department':
      return 'purple';
    default:
      return 'slate';
  }
};

export const getScopeBadgeClass = (scope: EventScope) => {
  switch(scope) {
    case 'personal':
      return "bg-blue-50 text-blue-700 border-blue-200";
    case 'organization':
      return "bg-green-50 text-green-700 border-green-200";
    case 'department':
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};