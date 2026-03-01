import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

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

// New types for multi-organization support
export interface OrganizationMembership {
  organization_id: string;
  role: string;
  department: string | null;
  joined_at: string;
}

export interface UserOrganizations {
  memberships: OrganizationMembership[];
  currentOrganizationId: string | null;
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook to get all organizations the user belongs to
 */
export const useUserOrganizations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-organizations', user?.id],
    queryFn: async (): Promise<OrganizationMembership[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('team_members')
        .select('organization_id, role, department, joined_at')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) {
        console.error('❌ useUserOrganizations - Error:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });
};
// Hook to fetch multiple organization details
export const useOrganizationsDetails = (orgIds: string[]) => {
  return useQuery({
    queryKey: ['organizations', orgIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, logo_url, settings, created_at')
        .in('id', orgIds);

      if (error) throw error;
      
      // Create a map for easy lookup
      return new Map(data.map(org => [org.id, org]));
    },
    enabled: orgIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch all departments with member counts and manager info
 * Now accepts optional organizationId parameter
 */
export const useDepartments = (organizationId?: string | null, options?: { enabled?: boolean }) => {
  const { user } = useAuth();
  const { data: organizations } = useUserOrganizations();
  const { toast } = useToast();
  const [targetOrgId, setTargetOrgId] = useState<string | null>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);

  // Determine which organization to use
  useEffect(() => {
    const determineOrganization = async () => {
      if (!user?.id) {
        setIsLoadingOrg(false);
        return;
      }

      // If organizationId is provided directly, use it
      if (organizationId) {
        setTargetOrgId(organizationId);
        setIsLoadingOrg(false);
        return;
      }

      // Otherwise, get from organizations list
      if (organizations && organizations.length > 0) {
        // For now, use the first one. In the UI, you can let user switch
        setTargetOrgId(organizations[0].organization_id);
      } else {
        setTargetOrgId(null);
      }
      setIsLoadingOrg(false);
    };

    determineOrganization();
  }, [user?.id, organizationId, organizations]);

  return useQuery({
    queryKey: ['departments', targetOrgId],
    queryFn: async () => {
      if (!targetOrgId) {
        return [];
      }

      const { data, error } = await supabase
        .rpc('get_departments_with_stats', {
          p_organization_id: targetOrgId
        });

      if (error) {
        console.error('❌ useDepartments - RPC error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch departments',
          variant: 'destructive',
        });
        return [];
      }

      return data as DepartmentWithStats[];
    },
    enabled: (options?.enabled ?? true) && !isLoadingOrg && !!user && !!targetOrgId,
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
 * Now accepts optional organizationId parameter
 */
export const useDepartmentAnalytics = (organizationId?: string | null, options?: { enabled?: boolean }) => {
  const { user } = useAuth();
  const { data: organizations } = useUserOrganizations();
  const { toast } = useToast();
  const [targetOrgId, setTargetOrgId] = useState<string | null>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);

  // Determine which organization to use
  useEffect(() => {
    const determineOrganization = async () => {
      if (!user?.id) {
        setIsLoadingOrg(false);
        return;
      }

      // If organizationId is provided directly, use it
      if (organizationId) {
        setTargetOrgId(organizationId);
        setIsLoadingOrg(false);
        return;
      }

      // Otherwise, get from organizations list
      if (organizations && organizations.length > 0) {
        setTargetOrgId(organizations[0].organization_id);
      } else {
        setTargetOrgId(null);
      }
      setIsLoadingOrg(false);
    };

    determineOrganization();
  }, [user?.id, organizationId, organizations]);

  return useQuery({
    queryKey: ['department-analytics', targetOrgId],
    queryFn: async () => {
      console.log('🔍 useDepartmentAnalytics - Starting fetch for organization:', targetOrgId);
      
      if (!targetOrgId) {
        console.log('ℹ️ useDepartmentAnalytics - No organization ID, returning empty array');
        return [];
      }

      try {
        const { data, error } = await supabase
          .rpc('get_department_analytics', {
            p_organization_id: targetOrgId
          });

        if (error) {
          console.error('❌ useDepartmentAnalytics - RPC error:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch department analytics',
            variant: 'destructive',
          });
          return [];
        }

        return (data || []).map((stat: any) => ({
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
        })) as DepartmentAnalytics[];
        
      } catch (error) {
        console.error('❌ useDepartmentAnalytics - Unexpected error:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: (options?.enabled ?? true) && !isLoadingOrg && !!user && !!targetOrgId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to get the current user's team member record for a specific organization
 */
export const useTeamMember = (organizationId?: string | null) => {
  const { user } = useAuth();
  const { data: organizations } = useUserOrganizations();

  return useQuery({
    queryKey: ['team-member', user?.id, organizationId],
    queryFn: async () => {
      if (!user) return null;

      let targetOrgId = organizationId;
      
      // If no organizationId provided, use the first one
      if (!targetOrgId && organizations && organizations.length > 0) {
        targetOrgId = organizations[0].organization_id;
      }

      if (!targetOrgId) return null;

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', targetOrgId)
        .maybeSingle();

      if (error) {
        console.error('❌ useTeamMember - Error:', error);
        return null;
      }

      return data;
    },
    enabled: !!user && (!!organizationId || (organizations && organizations.length > 0)),
  });
};

/**
 * Hook to check if department name is available
 * Updated to use organization from context
 */
export const useCheckDepartmentName = () => {
  const { user } = useAuth();
  const { data: organizations } = useUserOrganizations();

  return useMutation({
    mutationFn: async ({ 
      name, 
      excludeId 
    }: { 
      name: string; 
      excludeId?: string 
    }) => {
      if (!user) throw new Error('Not authenticated');
      if (!organizations || organizations.length === 0) throw new Error('No organization found');

      // Use the first organization for now
      const orgId = organizations[0].organization_id;

      const { data, error } = await supabase
        .rpc('is_department_name_available', {
          p_organization_id: orgId,
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
 * Updated to use organization from context
 */
export const useCreateDepartment = () => {
  const { user } = useAuth();
  const { data: organizations } = useUserOrganizations();
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
      if (!organizations || organizations.length === 0) throw new Error('No organization found');

      // Use the first organization for now
      const orgId = organizations[0].organization_id;

      // Insert department
      const { data: department, error } = await supabase
        .from('departments')
        .insert({
          organization_id: orgId,
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
        organization_id: orgId,
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
 * Updated to use organization from context
 */
export const useAvailableMembers = (departmentName?: string | null) => {
  const { user } = useAuth();
  const { data: organizations } = useUserOrganizations();

  return useQuery({
    queryKey: ['available-members', departmentName],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!organizations || organizations.length === 0) throw new Error('Not a team member');

      const orgId = organizations[0].organization_id;

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
        .eq('organization_id', orgId)
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

      // Get emails in batch
      let emailMap = new Map<string, string>();
      if (userIds.length > 0) {
        const { data: emails } = await supabase
          .rpc('get_user_emails_batch', {
            user_ids: userIds
          });
        
        if (emails) {
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
    enabled: !!user && !!organizations && organizations.length > 0,
  });
};

/**
 * Hook to get all members with batch email fetching
 * Updated to use organization from context
 */
export const useAllMembers = () => {
  const { user } = useAuth();
  const { data: organizations } = useUserOrganizations();

  return useQuery({
    queryKey: ['all-members'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!organizations || organizations.length === 0) throw new Error('Not a team member');

      const orgId = organizations[0].organization_id;

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
        .eq('organization_id', orgId)
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

      // Get emails in batch
      let emailMap = new Map<string, string>();
      if (userIds.length > 0) {
        const { data: emails } = await supabase
          .rpc('get_user_emails_batch', {
            user_ids: userIds
          });
        
        if (emails) {
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
    enabled: !!user && !!organizations && organizations.length > 0,
  });
};