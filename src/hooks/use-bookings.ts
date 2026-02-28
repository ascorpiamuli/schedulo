import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

// ============================================
// TYPE DEFINITIONS
// ============================================

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
  meeting_link?: string | null;
  meeting_provider?: string | null;
  meeting_settings?: any;
  calendar_html_link?: string | null;
  conference_data?: any;
  event_types?: { 
    id: string;
    title: string; 
    color: string; 
    duration: number; 
    location_type: string;
    location_details?: string;
    scope?: string;
    organization_id?: string | null;
    department_id?: string | null;
    schedule_type?: string;
    price_cents?: number;
    meeting_provider?: string;
    permanent_meeting_link?: string | null;
  } | null;
}

export interface TeamMember {
  id: string;
  user_id: string;
  organization_id: string;
  department: string | null;
  role: string;
  status: string;
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook to get current user's team member info
 */
export const useCurrentTeamMember = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['currentTeamMember', user?.id],
    queryFn: async (): Promise<TeamMember | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
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

/**
 * Hook to get all accessible bookings for the current user
 * This includes:
 * - Personal bookings (where user is host)
 * - Organization bookings (any booking for org events)
 * - Department bookings (any booking for dept events where user is in that dept)
 */
export function useBookings(filter: "upcoming" | "past" | "cancelled" = "upcoming", searchTerm: string = "") {
  const { user } = useAuth();
  const { data: teamMember, isLoading: teamMemberLoading } = useCurrentTeamMember();
  
  return useQuery({
    queryKey: ["bookings", filter, searchTerm, user?.id, teamMember?.organization_id, teamMember?.department],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('🔍 [useBookings] Fetching with:', {
        filter,
        userId: user.id,
        orgId: teamMember?.organization_id,
        department: teamMember?.department
      });

      const now = new Date().toISOString();

      // Step 1: Get all event types the user has access to
      let eventTypeIds: string[] = [];
      
      if (teamMember?.organization_id) {
        // User is in an organization
        
        if (teamMember.department) {
          // User is in a department - get department event IDs
          const { data: departments } = await supabase
            .from('departments')
            .select('id')
            .eq('organization_id', teamMember.organization_id)
            .eq('name', teamMember.department);

          const departmentIds = departments?.map(d => d.id) || [];

          // Get all event types this user can access:
          // 1. Personal events (created by user)
          // 2. Organization events (any in their org)
          // 3. Department events (any in their department)
          const { data: eventTypes } = await supabase
            .from('event_types')
            .select('id')
            .eq('is_active', true)
            .or(
              `and(user_id.eq.${user.id},scope.eq.personal),` +
              `and(scope.eq.organization,organization_id.eq.${teamMember.organization_id}),` +
              `and(scope.eq.department,department_id.in.(${departmentIds.join(',') || 'null'}))`
            );

          eventTypeIds = eventTypes?.map(et => et.id) || [];
        } else {
          // User in org but no department - personal + org events only
          const { data: eventTypes } = await supabase
            .from('event_types')
            .select('id')
            .eq('is_active', true)
            .or(
              `and(user_id.eq.${user.id},scope.eq.personal),` +
              `and(scope.eq.organization,organization_id.eq.${teamMember.organization_id})`
            );

          eventTypeIds = eventTypes?.map(et => et.id) || [];
        }
      } else {
        // No organization - personal events only
        const { data: eventTypes } = await supabase
          .from('event_types')
          .select('id')
          .eq('user_id', user.id)
          .eq('scope', 'personal')
          .eq('is_active', true);

        eventTypeIds = eventTypes?.map(et => et.id) || [];
      }

      console.log('📊 [useBookings] Accessible event types:', eventTypeIds.length);

      if (eventTypeIds.length === 0) {
        return [];
      }

      // Step 2: Get all bookings for these event types
      let query = supabase
        .from("bookings")
        .select(`
          *,
          event_types!inner (
            id,
            title,
            color,
            duration,
            location_type,
            location_details,
            scope,
            organization_id,
            department_id,
            schedule_type,
            price_cents,
            meeting_provider,
            permanent_meeting_link
          )
        `)
        .in("event_type_id", eventTypeIds);

      // Apply filter
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

      if (error) {
        console.error('❌ [useBookings] Error:', error);
        throw error;
      }

      // Step 3: Filter by search term if provided
      let filteredData = data || [];
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(booking => 
          booking.guest_name?.toLowerCase().includes(term) ||
          booking.guest_email?.toLowerCase().includes(term) ||
          booking.event_types?.title?.toLowerCase().includes(term)
        );
      }

      // Log counts by scope for debugging
      const personal = filteredData.filter(b => b.event_types?.scope === 'personal').length;
      const org = filteredData.filter(b => b.event_types?.scope === 'organization').length;
      const dept = filteredData.filter(b => b.event_types?.scope === 'department').length;
      
      console.log(`📊 [useBookings] Found: ${filteredData.length} total (${personal} personal, ${org} org, ${dept} dept)`);

      return filteredData as Booking[];
    },
    enabled: !!user?.id && !teamMemberLoading,
  });
}

/**
 * Hook to get bookings for a specific department
 */
export function useDepartmentBookings(departmentId?: string | null) {
  const { user } = useAuth();
  const { data: teamMember } = useCurrentTeamMember();
  
  return useQuery({
    queryKey: ["departmentBookings", departmentId, user?.id, teamMember?.organization_id],
    queryFn: async () => {
      if (!user?.id || !teamMember?.organization_id) return [];
      
      // If no departmentId provided, use user's department
      let targetDepartmentId = departmentId;
      
      if (!targetDepartmentId && teamMember.department) {
        const { data: dept } = await supabase
          .from("departments")
          .select("id")
          .eq("organization_id", teamMember.organization_id)
          .eq("name", teamMember.department)
          .single();
        
        targetDepartmentId = dept?.id;
      }

      if (!targetDepartmentId) return [];

      // Get all event types for this department
      const { data: eventTypes } = await supabase
        .from("event_types")
        .select("id")
        .eq("department_id", targetDepartmentId)
        .eq("scope", "department")
        .eq("is_active", true);

      const eventTypeIds = eventTypes?.map(et => et.id) || [];
      
      if (eventTypeIds.length === 0) return [];

      // Get bookings for these event types
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          event_types!inner (
            id,
            title,
            color,
            duration,
            location_type,
            location_details,
            scope,
            department_id,
            schedule_type,
            price_cents,
            meeting_provider,
            permanent_meeting_link
          )
        `)
        .in("event_type_id", eventTypeIds)
        .order("start_time", { ascending: false });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user?.id && !!teamMember?.organization_id,
  });
}

/**
 * Hook to get bookings for a specific organization
 */
export function useOrganizationBookings() {
  const { user } = useAuth();
  const { data: teamMember } = useCurrentTeamMember();
  
  return useQuery({
    queryKey: ["organizationBookings", user?.id, teamMember?.organization_id],
    queryFn: async () => {
      if (!user?.id || !teamMember?.organization_id) return [];

      // Get all organization event types
      const { data: eventTypes } = await supabase
        .from("event_types")
        .select("id")
        .eq("organization_id", teamMember.organization_id)
        .eq("scope", "organization")
        .eq("is_active", true);

      const eventTypeIds = eventTypes?.map(et => et.id) || [];
      
      if (eventTypeIds.length === 0) return [];

      // Get bookings for these event types
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          event_types!inner (
            id,
            title,
            color,
            duration,
            location_type,
            location_details,
            scope,
            organization_id,
            schedule_type,
            price_cents,
            meeting_provider,
            permanent_meeting_link
          )
        `)
        .in("event_type_id", eventTypeIds)
        .order("start_time", { ascending: false });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user?.id && !!teamMember?.organization_id,
  });
}

/**
 * Hook to cancel a booking
 */
export function useCancelBooking() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      // First verify the booking belongs to the user or they have permission
      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("host_user_id, event_types(scope, organization_id, department_id)")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Check if user has permission to cancel
      let hasPermission = booking.host_user_id === user.id;
      
      if (!hasPermission && booking.event_types) {
        const eventType = booking.event_types as any;
        
        if (eventType.scope === 'organization') {
          // Check if user is in the organization
          const { data: teamMember } = await supabase
            .from('team_members')
            .select('id')
            .eq('user_id', user.id)
            .eq('organization_id', eventType.organization_id)
            .maybeSingle();
          
          hasPermission = !!teamMember;
        } else if (eventType.scope === 'department' && eventType.department_id) {
          // Check if user is in the department
          const { data: dept } = await supabase
            .from('departments')
            .select('name')
            .eq('id', eventType.department_id)
            .single();
          
          if (dept) {
            const { data: teamMember } = await supabase
              .from('team_members')
              .select('id')
              .eq('user_id', user.id)
              .eq('organization_id', eventType.organization_id)
              .eq('department', dept.name)
              .maybeSingle();
            
            hasPermission = !!teamMember;
          }
        }
      }

      if (!hasPermission) {
        throw new Error("You don't have permission to cancel this booking");
      }

      // Then cancel it
      const { error } = await supabase
        .from("bookings")
        .update({ 
          status: "cancelled", 
          cancelled_at: new Date().toISOString() 
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["departmentBookings"] });
      qc.invalidateQueries({ queryKey: ["organizationBookings"] });
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to reschedule a booking
 */
export function useRescheduleBooking() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, start_time, end_time }: { id: string; start_time: string; end_time: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      // Verify permission (similar to cancel)
      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("host_user_id, event_types(scope, organization_id, department_id)")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      let hasPermission = booking.host_user_id === user.id;
      
      if (!hasPermission && booking.event_types) {
        const eventType = booking.event_types as any;
        
        if (eventType.scope === 'organization') {
          const { data: teamMember } = await supabase
            .from('team_members')
            .select('id')
            .eq('user_id', user.id)
            .eq('organization_id', eventType.organization_id)
            .maybeSingle();
          
          hasPermission = !!teamMember;
        } else if (eventType.scope === 'department' && eventType.department_id) {
          const { data: dept } = await supabase
            .from('departments')
            .select('name')
            .eq('id', eventType.department_id)
            .single();
          
          if (dept) {
            const { data: teamMember } = await supabase
              .from('team_members')
              .select('id')
              .eq('user_id', user.id)
              .eq('organization_id', eventType.organization_id)
              .eq('department', dept.name)
              .maybeSingle();
            
            hasPermission = !!teamMember;
          }
        }
      }

      if (!hasPermission) {
        throw new Error("You don't have permission to reschedule this booking");
      }

      // Then reschedule it
      const { error } = await supabase
        .from("bookings")
        .update({ start_time, end_time })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      toast({
        title: "Success",
        description: "Booking rescheduled successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to fetch a single booking by ID
 */
export function useBooking(id: string | undefined) {
  const { user } = useAuth();
  const { data: teamMember } = useCurrentTeamMember();

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
            color,
            scope,
            organization_id,
            department_id,
            schedule_type,
            price_cents,
            meeting_provider,
            permanent_meeting_link
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) throw new Error('Booking not found');

      // Check if user has permission to view this booking
      let hasPermission = data.host_user_id === user.id;
      
      if (!hasPermission && data.event_types && teamMember?.organization_id) {
        const eventType = data.event_types as any;
        
        if (eventType.scope === 'organization' && eventType.organization_id === teamMember.organization_id) {
          hasPermission = true;
        } else if (eventType.scope === 'department' && eventType.department_id && teamMember.department) {
          const { data: dept } = await supabase
            .from('departments')
            .select('name')
            .eq('id', eventType.department_id)
            .single();
          
          if (dept && dept.name === teamMember.department) {
            hasPermission = true;
          }
        }
      }

      if (!hasPermission) {
        throw new Error("You don't have permission to view this booking");
      }

      return data as Booking;
    },
    enabled: !!id && !!user?.id,
  });
}

/**
 * Hook to get booking count for an event type
 */
export function useEventTypesBookingCounts(
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
        .eq("event_type_id", eventTypeId);

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
 * Hook to get booking stats for an event type
 */
export function useEventTypeBookingStats(eventTypeId: string | undefined) {
  const { user } = useAuth();
  const { data: teamMember } = useCurrentTeamMember();

  return useQuery({
    queryKey: ['eventTypeBookings', 'stats', eventTypeId, user?.id, teamMember?.organization_id, teamMember?.department],
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

      // First, check if user has access to this event type
      const { data: eventType, error: eventError } = await supabase
        .from("event_types")
        .select("scope, organization_id, department_id, user_id, price_cents")
        .eq("id", eventTypeId)
        .single();

      if (eventError) throw eventError;

      // Check access
      let hasAccess = false;
      
      if (eventType.user_id === user.id) {
        hasAccess = true; // Personal event
      } else if (eventType.scope === 'organization' && teamMember?.organization_id === eventType.organization_id) {
        hasAccess = true; // Organization event
      } else if (eventType.scope === 'department' && eventType.department_id && teamMember?.department) {
        // Check if user is in this department
        const { data: dept } = await supabase
          .from("departments")
          .select("name")
          .eq("id", eventType.department_id)
          .single();
          
        if (dept && teamMember.department === dept.name) {
          hasAccess = true; // Department event
        }
      }

      if (!hasAccess) {
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
        .eq("event_type_id", eventTypeId);

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