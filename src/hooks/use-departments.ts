import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

// ============================================
// TYPES (matching your exact database schema)
// ============================================

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string | null;
  organization_id: string;
  role: 'admin' | 'manager' | 'member' | 'guest';
  department: string | null;
  title: string | null;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  timezone: string;
  location: string | null;
  bio: string | null;
  skills: string[] | null;
  phone: string | null;
  social_links: Record<string, string>;
  joined_at: string;
  last_active: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notification_preferences: {
    sms: boolean;
    push: boolean;
    email: boolean;
  };
  availability_settings: Record<string, any>;
  metadata: Record<string, any>;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  timezone: string;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface DepartmentWithStats extends Department {
  member_count?: number;
  manager_name?: string | null;
  manager_email?: string | null;
  manager_avatar?: string | null;
}

export interface DepartmentMember {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  title: string | null;
  status: string;
  joined_at: string;
}

export interface DepartmentManager {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  title: string | null;
}

export interface DepartmentDetails {
  department: Department;
  members: DepartmentMember[];
  manager: DepartmentManager | null;
}

export interface DepartmentAnalytics {
  department_id: string;
  department_name: string;
  department_color: string;
  total_members: number;
  active_members: number;
  total_events: number;
  total_bookings: number;
  completion_rate: number;
}

export interface AvailableMember {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  title: string | null;
  status: string;
  department: string | null;
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook to fetch all departments with member counts and manager info
 */
export const useDepartments = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // First get the user's organization
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (teamError || !teamMember) {
        toast({
          title: 'Error',
          description: 'Could not find your organization',
          variant: 'destructive',
        });
        throw teamError;
      }

      // Call the database function
      const { data, error } = await supabase
        .rpc('get_departments_with_stats', {
          p_organization_id: teamMember.organization_id
        });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch departments',
          variant: 'destructive',
        });
        throw error;
      }

      return data as DepartmentWithStats[];
    },
    enabled: !!user,
  });
};

/**
 * Hook to fetch single department with members and manager
 */
export const useDepartmentDetails = (departmentId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['department', departmentId],
    queryFn: async () => {
      if (!user || !departmentId) throw new Error('Not authenticated or no department ID');

      const { data, error } = await supabase
        .rpc('get_department_details', {
          p_department_id: departmentId
        });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch department details',
          variant: 'destructive',
        });
        throw error;
      }

      return data as DepartmentDetails;
    },
    enabled: !!user && !!departmentId,
  });
};

/**
 * Hook to fetch department analytics
 */
export const useDepartmentAnalytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['department-analytics'],
    queryFn: async () => {
      console.log('🔍 useDepartmentAnalytics - Starting fetch for user:', user?.id);
      
      if (!user) {
        console.error('❌ useDepartmentAnalytics - No user authenticated');
        throw new Error('Not authenticated');
      }

      try {
        // Step 1: Get team member info
        console.log('📊 useDepartmentAnalytics - Fetching team member for user:', user.id);
        const { data: teamMember, error: teamError } = await supabase
          .from('team_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();

        if (teamError) {
          console.error('❌ useDepartmentAnalytics - Team member error:', {
            error: teamError,
            message: teamError.message,
            details: teamError.details,
            hint: teamError.hint,
            code: teamError.code
          });
        }

        if (!teamMember) {
          console.warn('⚠️ useDepartmentAnalytics - No team member found for user:', user.id);
          toast({
            title: 'Error',
            description: 'Could not find your organization',
            variant: 'destructive',
          });
          throw new Error('No team member found');
        }

        console.log('✅ useDepartmentAnalytics - Team member found:', {
          organization_id: teamMember.organization_id,
          user_id: user.id
        });

        // Step 2: Call the RPC function
        console.log('📊 useDepartmentAnalytics - Calling get_department_analytics RPC with org_id:', teamMember.organization_id);
        const startTime = performance.now();
        
        const { data, error } = await supabase
          .rpc('get_department_analytics', {
            p_organization_id: teamMember.organization_id
          });

        const endTime = performance.now();
        console.log(`⏱️ useDepartmentAnalytics - RPC call took ${(endTime - startTime).toFixed(2)}ms`);

        if (error) {
          console.error('❌ useDepartmentAnalytics - RPC error:', {
            error,
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          
          toast({
            title: 'Error',
            description: 'Failed to fetch department analytics',
            variant: 'destructive',
          });
          throw error;
        }

        // Step 3: Log raw data from database
        console.log('📦 useDepartmentAnalytics - Raw data from database:', {
          hasData: !!data,
          dataLength: data?.length || 0,
          rawData: data ? JSON.parse(JSON.stringify(data)) : null // Deep copy to avoid reference issues
        });

        if (!data || data.length === 0) {
          console.log('ℹ️ useDepartmentAnalytics - No analytics data returned');
          return [];
        }

        // Step 4: Log each raw record before transformation
        data.forEach((stat: any, index: number) => {
          console.log(`📊 useDepartmentAnalytics - Raw record ${index + 1}:`, {
            department_id: stat.department_id,
            department_name: stat.department_name,
            department_color: stat.department_color,
            total_members: stat.total_members,
            active_members: stat.active_members,
            total_events: stat.total_events,
            team_events: stat.team_events,
            personal_events: stat.personal_events,
            total_bookings: stat.total_bookings,
            team_bookings: stat.team_bookings,
            personal_bookings: stat.personal_bookings,
            completion_rate: stat.completion_rate,
            // Show types to debug any string/number issues
            types: {
              total_members: typeof stat.total_members,
              active_members: typeof stat.active_members,
              total_events: typeof stat.total_events,
              team_events: typeof stat.team_events,
              personal_events: typeof stat.personal_events,
              completion_rate: typeof stat.completion_rate
            }
          });
        });

        // Step 5: Transform the data
        console.log('🔄 useDepartmentAnalytics - Transforming data...');
        const transformedData = (data || []).map((stat: any, index: number) => {
          const transformed = {
            department_id: stat.department_id || '',
            department_name: stat.department_name || 'Unnamed Department',
            department_color: stat.department_color || '#1E3A8A',
            total_members: Number(stat.total_members) || 0,
            active_members: Number(stat.active_members) || 0,
            total_events: Number(stat.total_events) || 0,
            team_events: Number(stat.team_events) || 0,
            personal_events: Number(stat.personal_events) || 0,
            total_bookings: Number(stat.total_bookings) || 0,
            team_bookings: Number(stat.team_bookings) || 0,
            personal_bookings: Number(stat.personal_bookings) || 0,
            completion_rate: Number(stat.completion_rate) || 0
          };

          // Log transformation result for first few records
          if (index < 3) {
            console.log(`✅ useDepartmentAnalytics - Transformed record ${index + 1}:`, transformed);
          }

          return transformed;
        });

        // Step 6: Log summary of transformed data
        console.log('📊 useDepartmentAnalytics - Transformation complete:', {
          originalCount: data?.length || 0,
          transformedCount: transformedData.length,
          departments: transformedData.map(d => ({
            name: d.department_name,
            members: d.total_members,
            team_events: d.team_events,
            personal_events: d.personal_events,
            completion_rate: d.completion_rate
          }))
        });

        return transformedData as DepartmentAnalytics[];
        
      } catch (error) {
        console.error('❌ useDepartmentAnalytics - Unexpected error:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
        
        throw error;
      }
    },
    enabled: !!user,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
/**
 * Hook to check if department name is available
 */
export const useCheckDepartmentName = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      name, 
      excludeId 
    }: { 
      name: string; 
      excludeId?: string 
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: teamMember } = await supabase
        .from('team_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!teamMember) throw new Error('Not a team member');

      const { data, error } = await supabase
        .rpc('is_department_name_available', {
          p_organization_id: teamMember.organization_id,
          p_name: name,
          p_exclude_id: excludeId || null
        });

      if (error) throw error;
      return data as boolean;
    },
  });
};

/**
 * Hook to create a new department
 */
export const useCreateDepartment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      color?: string;
      manager_id?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Get organization
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (teamError || !teamMember) throw new Error('Not a team member');

      // Insert department
      const { data: department, error } = await supabase
        .from('departments')
        .insert({
          organization_id: teamMember.organization_id,
          name: data.name.trim(),
          description: data.description?.trim() || null,
          color: data.color || '#1E3A8A',
          manager_id: data.manager_id || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('team_activity').insert({
        organization_id: teamMember.organization_id,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email,
        type: 'department',
        action: 'create',
        details: `Created department: ${data.name}`,
        metadata: { department_id: department.id },
      });

      return department;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department-analytics'] });
      toast({
        title: 'Success',
        description: 'Department created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create department',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to update an existing department
 */
export const useUpdateDepartment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      description?: string | null;
      color?: string;
      manager_id?: string | null;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: department, error } = await supabase
        .from('departments')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return department;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['department-analytics'] });
      toast({
        title: 'Success',
        description: 'Department updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update department',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to delete a department (only if no members)
 */
export const useDeleteDepartment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (departmentId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .rpc('delete_department', {
          p_department_id: departmentId
        });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department-analytics'] });
      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete department',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to bulk assign members to a department
 */
export const useUpdateDepartmentMembers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      departmentId,
      memberIds,
    }: {
      departmentId: string;
      memberIds: string[];
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .rpc('update_department_members', {
          p_department_id: departmentId,
          p_member_ids: memberIds,
        });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['department', variables.departmentId] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: 'Success',
        description: 'Department members updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update department members',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to get available members with batch email fetching
 */
export const useAvailableMembers = (departmentName?: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['available-members', departmentName],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (teamError || !teamMember) throw new Error('Not a team member');

      // Build base query
      let query = supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          role,
          title,
          status,
          department,
          joined_at
        `)
        .eq('organization_id', teamMember.organization_id)
        .eq('status', 'active');

      if (departmentName) {
        query = query.or(`department.eq.${departmentName},department.is.null`);
      } else {
        query = query.is('department', null);
      }

      const { data: members, error } = await query;

      if (error) throw error;

      if (!members || members.length === 0) {
        return [];
      }

      // Get all unique user_ids that are not null
      const userIds = members
        .map(m => m.user_id)
        .filter((id): id is string => id !== null);

      // Get profiles in batch
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);
        profiles = profileData || [];
      }

      // Get emails in batch using the new function
      let emailMap = new Map<string, string>();
      if (userIds.length > 0) {
        const { data: emails, error: emailError } = await supabase
          .rpc('get_user_emails_batch', {
            user_ids: userIds
          });
        
        if (!emailError && emails) {
          emailMap = new Map(emails.map((e: any) => [e.user_id, e.email]));
        }
      }

      // Create profile map for quick lookup
      const profileMap = new Map(profiles.map(p => [p.user_id, p]));

      // Combine all data
      return members.map(member => ({
        id: member.id,
        user_id: member.user_id,
        full_name: member.user_id ? profileMap.get(member.user_id)?.full_name || null : null,
        email: member.user_id ? emailMap.get(member.user_id) || null : null,
        avatar_url: member.user_id ? profileMap.get(member.user_id)?.avatar_url || null : null,
        role: member.role,
        title: member.title,
        status: member.status,
        department: member.department,
        joined_at: member.joined_at,
      }));
    },
    enabled: !!user,
  });
};

/**
 * Hook to get all members with batch email fetching
 */
export const useAllMembers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-members'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (teamError || !teamMember) throw new Error('Not a team member');

      // Get members
      const { data: members, error } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          role,
          title,
          status,
          department,
          joined_at
        `)
        .eq('organization_id', teamMember.organization_id)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (error) throw error;

      if (!members || members.length === 0) {
        return [];
      }

      // Get all unique user_ids that are not null
      const userIds = members
        .map(m => m.user_id)
        .filter((id): id is string => id !== null);

      // Get profiles in batch
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);
        profiles = profileData || [];
      }

      // Get emails in batch using the new function
      let emailMap = new Map<string, string>();
      if (userIds.length > 0) {
        const { data: emails, error: emailError } = await supabase
          .rpc('get_user_emails_batch', {
            user_ids: userIds
          });
        
        if (!emailError && emails) {
          emailMap = new Map(emails.map((e: any) => [e.user_id, e.email]));
        }
      }

      // Create profile map for quick lookup
      const profileMap = new Map(profiles.map(p => [p.user_id, p]));

      // Combine all data
      return members.map(member => ({
        id: member.id,
        user_id: member.user_id,
        full_name: member.user_id ? profileMap.get(member.user_id)?.full_name || null : null,
        email: member.user_id ? emailMap.get(member.user_id) || null : null,
        avatar_url: member.user_id ? profileMap.get(member.user_id)?.avatar_url || null : null,
        role: member.role,
        title: member.title,
        status: member.status,
        department: member.department,
        joined_at: member.joined_at,
      }));
    },
    enabled: !!user,
  });
};