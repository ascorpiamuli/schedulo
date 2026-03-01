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
  console.log("🧮 [calculateDurationFromOneTimeEvent] Calculating duration from:", oneTimeEvent);
  
  if (!oneTimeEvent) {
    console.log("🧮 [calculateDurationFromOneTimeEvent] No oneTimeEvent provided, returning default 30");
    return 30;
  }
  
  const { start_time, end_time } = oneTimeEvent;
  console.log(`🧮 [calculateDurationFromOneTimeEvent] Start: ${start_time}, End: ${end_time}`);
  
  const [startH, startM] = start_time.split(':').map(Number);
  const [endH, endM] = end_time.split(':').map(Number);
  
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  
  const duration = endTotal - startTotal;
  console.log(`🧮 [calculateDurationFromOneTimeEvent] Calculated duration: ${duration} minutes`);
  
  return duration;
}

// Helper function to fetch user data for team members
async function fetchUsersForTeamMembers(teamMembers: any[]): Promise<any[]> {
  console.log("👥 [fetchUsersForTeamMembers] Fetching user data for", teamMembers?.length || 0, "team members");
  
  if (!teamMembers || teamMembers.length === 0) {
    console.log("👥 [fetchUsersForTeamMembers] No team members to fetch");
    return [];
  }
  
  const userIds = teamMembers.map(tm => tm.user_id);
  console.log("👥 [fetchUsersForTeamMembers] User IDs:", userIds);
  
  const { data: users, error } = await supabase
    .from('profiles')
    .select('user_id, email, full_name, avatar_url')
    .in('user_id', userIds);
  
  if (error) {
    console.error("❌ [fetchUsersForTeamMembers] Error fetching user profiles:", error);
    return teamMembers;
  }
  
  console.log("👥 [fetchUsersForTeamMembers] Found", users?.length || 0, "user profiles");
  
  const userMap = new Map(users?.map(u => [u.user_id, u]) || []);
  
  const enrichedMembers = teamMembers.map(tm => ({
    ...tm,
    user: userMap.get(tm.user_id) || { email: 'Unknown', full_name: null }
  }));
  
  console.log("👥 [fetchUsersForTeamMembers] Enriched team members:", enrichedMembers.length);
  return enrichedMembers;
}

export function useEventTypes(scope?: EventScope, departmentId?: string) {
  const { user } = useAuth();
  const { data: teamMembers } = useCurrentTeamMember();
  
  // Create a query key that includes all relevant info
  const orgIds = teamMembers?.map(tm => tm.organization_id).join(',') || '';
  const deptNames = teamMembers?.filter(tm => tm.department).map(tm => tm.department).join(',') || '';
  
  console.log("🏁 [useEventTypes] Hook called with:", { 
    scope, 
    departmentId, 
    userId: user?.id,
    teamMembers: teamMembers?.length,
    orgIds,
    deptNames
  });
  
  return useQuery({
    queryKey: ["event_types", scope, departmentId, user?.id, orgIds, deptNames],
    queryFn: async () => {
      console.log("🔍 [useEventTypes] Starting fetch...");
      
      if (!user) {
        console.error("❌ [useEventTypes] No authenticated user");
        return []; // Return empty array instead of throwing
      }

      if (!teamMembers || teamMembers.length === 0) {
        console.log("📭 [useEventTypes] No team members found");
        return []; // Return empty array
      }

      try {
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
        else if (scope === 'organization') {
          // Get all organizations the user belongs to
          const orgIds = teamMembers.map(tm => tm.organization_id);
          query = query
            .in('organization_id', orgIds)
            .eq('scope', 'organization');
        } 
        else if (scope === 'department') {
          // Get all departments the user belongs to
          const userDepts = teamMembers
            .filter(tm => tm.department)
            .map(tm => tm.department);
          
          if (userDepts.length > 0) {
            // Get department IDs for these department names
            const { data: departments, error: deptError } = await supabase
              .from('departments')
              .select('id, organization_id')
              .in('name', userDepts);
              
            if (deptError) {
              console.error("❌ [useEventTypes] Error fetching departments:", deptError);
              return [];
            }
            
            const deptIds = departments?.map(d => d.id) || [];
            console.log("🔍 [useEventTypes] Department IDs:", deptIds);
            
            if (deptIds.length > 0) {
              query = query
                .in('department_id', deptIds)
                .eq('scope', 'department');
            } else {
              return []; // No departments found
            }
          } else {
            return []; // User has no departments
          }
        } 
        else {
          // Show ALL accessible events across all orgs
          const orgIds = teamMembers.map(tm => tm.organization_id);
          const userDepts = teamMembers
            .filter(tm => tm.department)
            .map(tm => tm.department);
          
          console.log("🔍 [useEventTypes] All orgs:", orgIds);
          console.log("🔍 [useEventTypes] All depts:", userDepts);
          
          let conditions = [
            `and(user_id.eq.${user.id},scope.eq.personal)`
          ];
          
          if (orgIds.length > 0) {
            conditions.push(`and(scope.eq.organization,organization_id.in.(${orgIds.join(',')}))`);
          }
          
          if (userDepts.length > 0) {
            // Get department IDs for these department names
            const { data: departments, error: deptError } = await supabase
              .from('departments')
              .select('id')
              .in('name', userDepts);
              
            if (deptError) {
              console.error("❌ [useEventTypes] Error fetching departments:", deptError);
            } else {
              const deptIds = departments?.map(d => d.id) || [];
              console.log("🔍 [useEventTypes] Department IDs:", deptIds);
              
              if (deptIds.length > 0) {
                conditions.push(`and(scope.eq.department,department_id.in.(${deptIds.join(',')}))`);
              }
            }
          }
          
          console.log("🔍 [useEventTypes] OR conditions:", conditions);
          query = query.or(conditions.join(','));
        }

        console.log("🚀 [useEventTypes] Executing query...");
        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) {
          console.error("❌ [useEventTypes] Query error:", error);
          return []; // Return empty array on error
        }

        console.log("✅ [useEventTypes] Raw data received:", data?.length || 0, "events");
        
        if (!data || data.length === 0) {
          console.log("📭 [useEventTypes] No events found");
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
                event_team_members: undefined
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
        console.log(`📊 [useEventTypes] Final event counts: ${personal} personal, ${org} organization, ${dept} department`);

        return transformedData;
        
      } catch (error) {
        console.error("❌ [useEventTypes] Unexpected error:", error);
        return []; // Return empty array on any error
      }
    },
    enabled: !!user && !!teamMembers, // Only run when we have user and team members
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
}
export function usePersonalEvents() {
  console.log("🏁 [usePersonalEvents] Hook called");
  return useEventTypes('personal');
}

export function useOrganizationEvents() {
  console.log("🏁 [useOrganizationEvents] Hook called");
  return useEventTypes('organization');
}

export function useDepartmentEvents(departmentId: string) {
  console.log("🏁 [useDepartmentEvents] Hook called with departmentId:", departmentId);
  return useEventTypes('department', departmentId);
}

export function useEventTypeBySlug(userId: string | undefined, slug: string | undefined) {
  console.log("🏁 [useEventTypeBySlug] Hook called with:", { userId, slug });
  
  return useQuery({
    queryKey: ["event_type", userId, slug],
    queryFn: async () => {
      console.log("🔍 [useEventTypeBySlug] Fetching event by slug:", { userId, slug });
      
      if (!userId || !slug) {
        console.error("❌ [useEventTypeBySlug] Missing required parameters");
        throw new Error("User ID and slug are required");
      }

      console.log("🔍 [useEventTypeBySlug] Building query...");
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
        console.error("❌ [useEventTypeBySlug] Query error:", error);
        if (error.code === 'PGRST116') {
          throw new Error("Event not found");
        }
        throw error;
      }

      if (!data) {
        console.log("📭 [useEventTypeBySlug] No event found for slug:", slug);
        throw new Error("Event not found");
      }

      console.log("✅ [useEventTypeBySlug] Raw event data found:", data.title);

      // Fetch user data for team members
      let teamMembersWithUsers = [];
      if (data.event_team_members && data.event_team_members.length > 0) {
        console.log("👥 [useEventTypeBySlug] Fetching user data for", data.event_team_members.length, "team members");
        teamMembersWithUsers = await fetchUsersForTeamMembers(data.event_team_members);
      }

      const transformedData = {
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
      
      console.log("✅ [useEventTypeBySlug] Returning transformed event:", transformedData.title);
      return transformedData;
    },
    enabled: !!userId && !!slug,
    retry: false,
  });
}

export const useCurrentTeamMember = (organizationId?: string) => {
  const { user } = useAuth();
  
  console.log("🏁 [useCurrentTeamMember] Hook called with user:", user?.id, "org:", organizationId);
  
  return useQuery({
    queryKey: ['currentTeamMember', user?.id, organizationId],
    queryFn: async () => {
      console.log("🔍 [useCurrentTeamMember] Fetching team member for user:", user?.id);
      
      if (!user) {
        console.log("🔍 [useCurrentTeamMember] No user, returning null");
        return null;
      }

      let query = supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id);

      // If organization ID is provided, filter by it
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [useCurrentTeamMember] Error fetching team members:', error);
        return null;
      }

      console.log("✅ [useCurrentTeamMember] Found", data?.length || 0, "team member records");
      
      // Return ALL team member records, not just one
      return data || [];
    },
    enabled: !!user,
  });
};
export function useEventType(id: string | undefined) {
  const { user } = useAuth();
  
  console.log("🏁 [useEventType] Hook called with id:", id, "user:", user?.id);
  
  return useQuery({
    queryKey: ["event_type", id],
    queryFn: async () => {
      console.log("🔍 [useEventType] Fetching event by id:", id);
      
      if (!id) {
        console.error("❌ [useEventType] No event ID provided");
        throw new Error("Event ID is required");
      }
      if (!user) {
        console.error("❌ [useEventType] No authenticated user");
        throw new Error("Not authenticated");
      }

      console.log("🔍 [useEventType] Building query...");
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
        console.error("❌ [useEventType] Query error:", error);
        if (error.code === 'PGRST116') {
          throw new Error("Event not found");
        }
        throw error;
      }

      console.log("✅ [useEventType] Raw event data found:", data.title);

      // Check access
      console.log("🔍 [useEventType] Checking access for user:", user.id);
      let hasAccess = data.user_id === user.id;
      console.log("🔍 [useEventType] Is owner?", hasAccess);
      
      if (!hasAccess && data.scope === 'organization' && data.organization_id) {
        console.log("🔍 [useEventType] Checking organization access for org:", data.organization_id);
        const { data: member, error: memberError } = await supabase
          .from('team_members')
          .select('id')
          .eq('user_id', user.id)
          .eq('organization_id', data.organization_id)
          .maybeSingle();
          
        if (memberError) {
          console.error("❌ [useEventType] Error checking team membership:", memberError);
        }
        
        hasAccess = !!member;
        console.log("🔍 [useEventType] Organization access result:", hasAccess);
      }
      
      if (!hasAccess && data.scope === 'department' && data.department_id) {
        console.log("🔍 [useEventType] Checking department access for dept:", data.department_id);
        const { data: dept, error: deptError } = await supabase
          .from('departments')
          .select('organization_id')
          .eq('id', data.department_id)
          .single();
          
        if (deptError) {
          console.error("❌ [useEventType] Error fetching department:", deptError);
        }
          
        if (dept) {
          console.log("🔍 [useEventType] Department belongs to org:", dept.organization_id);
          const { data: member, error: memberError } = await supabase
            .from('team_members')
            .select('id')
            .eq('user_id', user.id)
            .eq('organization_id', dept.organization_id)
            .maybeSingle();
            
          if (memberError) {
            console.error("❌ [useEventType] Error checking team membership:", memberError);
          }
            
          hasAccess = !!member;
          console.log("🔍 [useEventType] Department access result:", hasAccess);
        }
      }

      if (!hasAccess) {
        console.error("❌ [useEventType] User does not have permission to view this event");
        throw new Error("You don't have permission to view this event");
      }

      // Fetch user data for team members
      let teamMembersWithUsers = [];
      if (data.event_team_members && data.event_team_members.length > 0) {
        console.log("👥 [useEventType] Fetching user data for", data.event_team_members.length, "team members");
        teamMembersWithUsers = await fetchUsersForTeamMembers(data.event_team_members);
      }

      const transformedData = {
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
      
      console.log("✅ [useEventType] Returning transformed event:", transformedData.title);
      return transformedData;
    },
    enabled: !!id && !!user,
  });
}

export function usePublicEventTypeBySlug(userId: string | undefined, slug: string | undefined) {
  console.log("🏁 [usePublicEventTypeBySlug] Hook called with:", { userId, slug });
  
  return useQuery({
    queryKey: ["public_event_type", userId, slug],
    queryFn: async () => {
      console.log("🔍 [usePublicEventTypeBySlug] Fetching public event by slug:", { userId, slug });
      
      if (!userId || !slug) {
        console.error("❌ [usePublicEventTypeBySlug] Missing required parameters");
        throw new Error("User ID and slug are required");
      }

      console.log("🔍 [usePublicEventTypeBySlug] Building query...");
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
        console.error("❌ [usePublicEventTypeBySlug] Query error:", error);
        if (error.code === 'PGRST116') {
          throw new Error("Event not found");
        }
        throw error;
      }

      if (!data) {
        console.log("📭 [usePublicEventTypeBySlug] No event found for slug:", slug);
        throw new Error("Event not found");
      }

      console.log("✅ [usePublicEventTypeBySlug] Raw event data found:", data.title);

      // Fetch user data for team members
      let teamMembersWithUsers = [];
      if (data.event_team_members && data.event_team_members.length > 0) {
        console.log("👥 [usePublicEventTypeBySlug] Fetching user data for", data.event_team_members.length, "team members");
        teamMembersWithUsers = await fetchUsersForTeamMembers(data.event_team_members);
      }

      const transformedData = {
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
      
      console.log("✅ [usePublicEventTypeBySlug] Returning transformed event:", transformedData.title);
      return transformedData;
    },
    enabled: !!userId && !!slug,
    retry: false,
  });
}

export function useCreateEventType() {
  const qc = useQueryClient();
  const { user } = useAuth();
  
  console.log("🏁 [useCreateEventType] Hook initialized");
  
  return useMutation({
    mutationFn: async (data: CreateEventTypeData) => {
      console.log("📝 [useCreateEventType] Creating event type with data:", data);
      
      if (!user) {
        console.error("❌ [useCreateEventType] No authenticated user");
        throw new Error("Not authenticated");
      }
      
      const { team_members, ...eventData } = data;
      console.log("📝 [useCreateEventType] Separated team_members:", team_members?.length || 0, "members");
      
      let duration = eventData.duration;
      if (eventData.schedule_type === 'one_time' && eventData.one_time_event) {
        console.log("📝 [useCreateEventType] One-time event detected, calculating duration");
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

      console.log("📝 [useCreateEventType] Inserting event with defaults:", eventWithDefaults);

      const { data: eventType, error } = await supabase
        .from("event_types")
        .insert(eventWithDefaults)
        .select()
        .single();

      if (error) {
        console.error("❌ [useCreateEventType] Error creating event:", error);
        throw error;
      }

      console.log("✅ [useCreateEventType] Event created successfully:", eventType);

      if (team_members && team_members.length > 0) {
        console.log("👥 [useCreateEventType] Adding", team_members.length, "team members");
        const { error: teamError } = await supabase
          .from("event_team_members")
          .insert(
            team_members.map(member => ({
              ...member,
              event_type_id: eventType.id
            }))
          );

        if (teamError) {
          console.error("❌ [useCreateEventType] Error adding team members:", teamError);
          throw teamError;
        }
        
        console.log("✅ [useCreateEventType] Team members added successfully");
      }

      return eventType;
    },
    onSuccess: (data) => {
      console.log("✅ [useCreateEventType] Mutation success, invalidating queries");
      qc.invalidateQueries({ queryKey: ["event_types"] });
    },
    onError: (error) => {
      console.error("❌ [useCreateEventType] Mutation error:", error);
    },
  });
}

export function useUpdateEventType() {
  const qc = useQueryClient();
  
  console.log("🏁 [useUpdateEventType] Hook initialized");
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateEventTypeData) => {
      console.log("📝 [useUpdateEventType] Updating event type:", { id, data });
      
      const { team_members, ...eventData } = data;
      console.log("📝 [useUpdateEventType] Separated team_members:", team_members?.length || 0, "members");
      
      let duration = eventData.duration;
      if (eventData.schedule_type === 'one_time' && eventData.one_time_event) {
        console.log("📝 [useUpdateEventType] One-time event detected, calculating duration");
        duration = calculateDurationFromOneTimeEvent(eventData.one_time_event);
      }
      
      const updateData: any = {
        ...eventData,
        ...(duration ? { duration } : {})
      };

      console.log("📝 [useUpdateEventType] Updating event with data:", updateData);

      const { data: eventType, error } = await supabase
        .from("event_types")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("❌ [useUpdateEventType] Error updating event:", error);
        throw error;
      }

      console.log("✅ [useUpdateEventType] Event updated successfully:", eventType);

      if (team_members) {
        console.log("👥 [useUpdateEventType] Updating team members - deleting existing");
        const { error: deleteError } = await supabase
          .from("event_team_members")
          .delete()
          .eq("event_type_id", id);
          
        if (deleteError) {
          console.error("❌ [useUpdateEventType] Error deleting team members:", deleteError);
          throw deleteError;
        }

        if (team_members.length > 0) {
          console.log("👥 [useUpdateEventType] Adding", team_members.length, "new team members");
          const { error: teamError } = await supabase
            .from("event_team_members")
            .insert(
              team_members.map(member => ({
                ...member,
                event_type_id: id
              }))
            );

          if (teamError) {
            console.error("❌ [useUpdateEventType] Error adding team members:", teamError);
            throw teamError;
          }
          
          console.log("✅ [useUpdateEventType] Team members updated successfully");
        }
      }

      return eventType;
    },
    onSuccess: (_, variables) => {
      console.log("✅ [useUpdateEventType] Mutation success, invalidating queries for id:", variables.id);
      qc.invalidateQueries({ queryKey: ["event_types"] });
      qc.invalidateQueries({ queryKey: ["event_type", variables.id] });
    },
    onError: (error) => {
      console.error("❌ [useUpdateEventType] Mutation error:", error);
    },
  });
}

export function useDeleteEventType() {
  const qc = useQueryClient();
  
  console.log("🏁 [useDeleteEventType] Hook initialized");
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log("🗑️ [useDeleteEventType] Deleting event type:", id);
      
      console.log("🗑️ [useDeleteEventType] Deleting team members first");
      const { error: deleteTeamError } = await supabase
        .from("event_team_members")
        .delete()
        .eq("event_type_id", id);
        
      if (deleteTeamError) {
        console.error("❌ [useDeleteEventType] Error deleting team members:", deleteTeamError);
        throw deleteTeamError;
      }

      console.log("🗑️ [useDeleteEventType] Deleting event type");
      const { error } = await supabase
        .from("event_types")
        .delete()
        .eq("id", id);
        
      if (error) {
        console.error("❌ [useDeleteEventType] Error deleting event type:", error);
        throw error;
      }
      
      console.log("✅ [useDeleteEventType] Event type deleted successfully");
    },
    onSuccess: () => {
      console.log("✅ [useDeleteEventType] Mutation success, invalidating queries");
      qc.invalidateQueries({ queryKey: ["event_types"] });
    },
    onError: (error) => {
      console.error("❌ [useDeleteEventType] Mutation error:", error);
    },
  });
}

export function useAvailableTeamMembers(organizationId?: string | null, departmentId?: string | null) {
  console.log("🏁 [useAvailableTeamMembers] Hook called with:", { organizationId, departmentId });
  
  return useQuery({
    queryKey: ["available_team_members", organizationId, departmentId],
    queryFn: async () => {
      console.log("🔍 [useAvailableTeamMembers] Fetching available team members");
      
      if (!organizationId) {
        console.log("🔍 [useAvailableTeamMembers] No organizationId, returning empty array");
        return [];
      }

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
        console.log("🔍 [useAvailableTeamMembers] Filtering by departmentId:", departmentId);
        const { data: dept, error: deptError } = await supabase
          .from('departments')
          .select('name')
          .eq('id', departmentId)
          .single();
          
        if (deptError) {
          console.error("❌ [useAvailableTeamMembers] Error fetching department:", deptError);
        } else {
          console.log("🔍 [useAvailableTeamMembers] Department name:", dept?.name);
          query = query.eq('department', dept.name);
        }
      }

      console.log("🔍 [useAvailableTeamMembers] Executing team members query...");
      const { data, error } = await query;
      if (error) {
        console.error("❌ [useAvailableTeamMembers] Error fetching team members:", error);
        throw error;
      }

      console.log("✅ [useAvailableTeamMembers] Found", data?.length || 0, "team members");
      
      if (!data || data.length === 0) {
        console.log("📭 [useAvailableTeamMembers] No team members found");
        return [];
      }

      // Fetch user profiles
      const userIds = data.map(m => m.user_id).filter(Boolean);
      console.log("👥 [useAvailableTeamMembers] Fetching profiles for user IDs:", userIds);
      
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, avatar_url')
        .in('user_id', userIds);

      if (usersError) {
        console.error("❌ [useAvailableTeamMembers] Error fetching user profiles:", usersError);
        throw usersError;
      }

      console.log("✅ [useAvailableTeamMembers] Found", users?.length || 0, "user profiles");

      const userMap = new Map(users?.map(u => [u.user_id, u]) || []);

      const enrichedMembers = data.map(member => ({
        id: member.user_id,
        email: userMap.get(member.user_id)?.email || '',
        full_name: userMap.get(member.user_id)?.full_name,
        role: member.role,
        department: member.department,
        avatar_url: userMap.get(member.user_id)?.avatar_url
      }));
      
      console.log("✅ [useAvailableTeamMembers] Returning", enrichedMembers.length, "enriched team members");
      return enrichedMembers;
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
  console.log("🔧 [slugify] Converting string to slug:", s);
  const slug = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  console.log("🔧 [slugify] Result:", slug);
  return slug;
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