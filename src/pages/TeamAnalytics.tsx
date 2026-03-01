"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  Building2, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Loader2,
  ChevronDown,
  Download,
  Filter,
  CalendarRange,
  UserCheck,
  UserX,
  PieChart,
  BarChart3,
  Activity,
  Zap,
  Target,
  Award,
  Star,
  MoreHorizontal,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  PlusCircle,
  Mail,
  Phone,
  Video,
  MapPin,
  Sparkles,
  AlertCircle
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Fallback scroll area component if @radix-ui/react-scroll-area is not available
const ScrollArea = ({ children, className, ...props }: any) => {
  return (
    <div className={`overflow-auto ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

import { useAuth } from "@/lib/auth";
import { useOrganization, useTeamMembers, useTeamActivity, useDepartments as useTeamDepartments } from "@/hooks/use-team-management";
import { useDepartmentAnalytics } from "@/hooks/use-departments";
import { useBookings, useCancelBooking, useRescheduleBooking } from "@/hooks/use-bookings";
import { useEventTypes } from "@/hooks/use-event-types";
import { useAvailability, useAvailabilityOverrides, DAYS } from "@/hooks/use-availability";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, differenceInDays, formatDistanceToNow } from "date-fns";

// Types
interface AnalyticsSummary {
  totalBookings: number;
  totalRevenue: number;
  totalEvents: number;
  totalTeamMembers: number;
  activeTeamMembers: number;
  upcomingBookings: number;
  cancelledBookings: number;
  completionRate: number;
  averageBookingValue: number;
  peakHours: { hour: number; count: number }[];
  popularEvents: { id: string; title: string; count: number }[];
  teamPerformance: { member: string; bookings: number; revenue: number }[];
  departmentBreakdown: { name: string; color: string; bookings: number; revenue: number }[];
}

interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

export default function TeamAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
    label: "This Month"
  });
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [showCharts, setShowCharts] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);

  // Data fetching
  const { data: organization, isLoading: orgLoading } = useOrganization();
  const { data: teamMembers = [], isLoading: membersLoading, refetch: refetchMembers } = useTeamMembers();
  const { data: departments = [], isLoading: deptsLoading } = useTeamDepartments();
  const { data: departmentAnalytics = [], isLoading: deptAnalyticsLoading } = useDepartmentAnalytics({ enabled: true });
  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useBookings("upcoming");
  const { data: pastBookings = [], isLoading: pastLoading } = useBookings("past");
  const { data: cancelledBookings = [], isLoading: cancelledLoading } = useBookings("cancelled");
  const { data: eventTypes = [], isLoading: eventsLoading, refetch: refetchEvents } = useEventTypes();
  const { data: availability = [], isLoading: availabilityLoading } = useAvailability();
  const { data: overrides = [], isLoading: overridesLoading } = useAvailabilityOverrides();
  const { data: activity = [], isLoading: activityLoading } = useTeamActivity(50);

  // Mutations
  const cancelBooking = useCancelBooking();
  const rescheduleBooking = useRescheduleBooking();

  const isLoading = orgLoading || membersLoading || deptsLoading || deptAnalyticsLoading || 
                    bookingsLoading || pastLoading || cancelledLoading || eventsLoading || 
                    availabilityLoading || overridesLoading || activityLoading;

  // Calculate analytics when data changes
  useEffect(() => {
    if (!bookings.length && !pastBookings.length && !cancelledBookings.length) return;

    const allBookings = [...bookings, ...pastBookings, ...cancelledBookings];
    const dateFilteredBookings = allBookings.filter(booking => {
      const bookingDate = new Date(booking.start_time);
      return isWithinInterval(bookingDate, { start: dateRange.from, end: dateRange.to });
    });

    // Department filtered bookings
    const departmentFilteredBookings = selectedDepartment === "all" 
      ? dateFilteredBookings 
      : dateFilteredBookings.filter(booking => {
          const dept = departments.find(d => d.name === selectedDepartment);
          return booking.event_types?.department_id === dept?.id;
        });

    // Calculate summary stats
    const confirmedBookings = departmentFilteredBookings.filter(b => b.status === "confirmed");
    const cancelled = departmentFilteredBookings.filter(b => b.status === "cancelled");
    
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.payment_amount_cents || 0), 0) / 100;
    
    // Peak hours calculation
    const hourCounts: Record<number, number> = {};
    confirmedBookings.forEach(booking => {
      const hour = new Date(booking.start_time).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Popular events
    const eventCounts: Record<string, { title: string; count: number }> = {};
    confirmedBookings.forEach(booking => {
      if (booking.event_types?.id) {
        if (!eventCounts[booking.event_types.id]) {
          eventCounts[booking.event_types.id] = {
            title: booking.event_types.title,
            count: 0
          };
        }
        eventCounts[booking.event_types.id].count++;
      }
    });
    const popularEvents = Object.entries(eventCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Team performance
    const teamPerformance: Record<string, { bookings: number; revenue: number }> = {};
    confirmedBookings.forEach(booking => {
      if (booking.host_user_id) {
        if (!teamPerformance[booking.host_user_id]) {
          teamPerformance[booking.host_user_id] = { bookings: 0, revenue: 0 };
        }
        teamPerformance[booking.host_user_id].bookings++;
        teamPerformance[booking.host_user_id].revenue += (booking.payment_amount_cents || 0) / 100;
      }
    });

    const teamPerformanceArray = Object.entries(teamPerformance)
      .map(([userId, stats]) => {
        const member = teamMembers.find(m => m.user_id === userId);
        return {
          member: member?.full_name || member?.email || "Unknown",
          ...stats
        };
      })
      .sort((a, b) => b.bookings - a.bookings);

    // Department breakdown
    const departmentBreakdown = departments.map(dept => {
      const deptBookings = confirmedBookings.filter(b => {
        const eventDeptId = b.event_types?.department_id;
        return eventDeptId === dept.id;
      });
      const deptRevenue = deptBookings.reduce((sum, b) => sum + ((b.payment_amount_cents || 0) / 100), 0);
      
      return {
        name: dept.name,
        color: dept.color,
        bookings: deptBookings.length,
        revenue: deptRevenue
      };
    }).filter(d => d.bookings > 0 || d.revenue > 0);

    setAnalyticsSummary({
      totalBookings: confirmedBookings.length,
      totalRevenue,
      totalEvents: eventTypes.length,
      totalTeamMembers: teamMembers.length,
      activeTeamMembers: teamMembers.filter(m => m.status === "active").length,
      upcomingBookings: bookings.length,
      cancelledBookings: cancelled.length,
      completionRate: departmentFilteredBookings.length > 0 
        ? (confirmedBookings.length / departmentFilteredBookings.length) * 100 
        : 0,
      averageBookingValue: confirmedBookings.length > 0 ? totalRevenue / confirmedBookings.length : 0,
      peakHours,
      popularEvents,
      teamPerformance: teamPerformanceArray,
      departmentBreakdown
    });

  }, [bookings, pastBookings, cancelledBookings, eventTypes, teamMembers, departments, dateRange, selectedDepartment]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchBookings(),
      refetchEvents(),
      refetchMembers()
    ]);
    setIsRefreshing(false);
    toast({
      title: "Success",
      description: "Analytics data refreshed",
    });
  };

  const dateRangeOptions: DateRange[] = [
    { from: subDays(new Date(), 7), to: new Date(), label: "Last 7 Days" },
    { from: startOfMonth(new Date()), to: endOfMonth(new Date()), label: "This Month" },
    { from: startOfMonth(subDays(new Date(), 30)), to: endOfMonth(subDays(new Date(), 30)), label: "Last Month" },
    { from: new Date(new Date().getFullYear(), 0, 1), to: new Date(), label: "Year to Date" },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Organization Found</AlertTitle>
          <AlertDescription>
            You need to be part of an organization to view team analytics.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your team's performance and booking activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={dateRange.label}
            onValueChange={(label) => {
              const range = dateRangeOptions.find(opt => opt.label === label);
              if (range) setDateRange(range);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <CalendarRange className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map(option => (
                <SelectItem key={option.label} value={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-[180px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.name}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                    {dept.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Schedule Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      {analyticsSummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsSummary.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsSummary.upcomingBookings} upcoming · {analyticsSummary.cancelledBookings} cancelled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(analyticsSummary.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg. {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(analyticsSummary.averageBookingValue)} per booking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsSummary.activeTeamMembers}/{analyticsSummary.totalTeamMembers}</div>
              <p className="text-xs text-muted-foreground">
                Active members · {((analyticsSummary.activeTeamMembers / analyticsSummary.totalTeamMembers) * 100).toFixed(0)}% engagement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsSummary.completionRate.toFixed(1)}%</div>
              <Progress value={analyticsSummary.completionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Peak Hours */}
            {analyticsSummary && analyticsSummary.peakHours.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Peak Booking Hours</CardTitle>
                  <CardDescription>Most popular times for bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsSummary.peakHours.map(({ hour, count }) => (
                      <div key={hour} className="flex items-center gap-4">
                        <div className="w-20 text-sm">
                          {hour % 12 || 12}{hour >= 12 ? 'pm' : 'am'}
                        </div>
                        <Progress value={(count / analyticsSummary.peakHours[0].count) * 100} className="flex-1" />
                        <div className="w-12 text-sm text-right">{count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Popular Events */}
            {analyticsSummary && analyticsSummary.popularEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Popular Events</CardTitle>
                  <CardDescription>Most booked event types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsSummary.popularEvents.map((event, index) => (
                      <div key={event.id} className="flex items-center gap-4">
                        <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">{event.title}</p>
                        </div>
                        <div className="text-sm font-bold">{event.count} bookings</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Department Breakdown */}
          {analyticsSummary && analyticsSummary.departmentBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Department Breakdown</CardTitle>
                <CardDescription>Performance by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsSummary.departmentBreakdown.map(dept => (
                    <div key={dept.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                          <span className="font-medium">{dept.name}</span>
                        </div>
                        <span className="text-sm">{dept.bookings} bookings</span>
                      </div>
                      <Progress value={(dept.bookings / analyticsSummary.totalBookings) * 100} />
                      <p className="text-xs text-muted-foreground">
                        Revenue: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dept.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departmentAnalytics.map((dept) => (
              <Card 
                key={dept.department_id} 
                className="hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => setSelectedDepartment(dept.department_name)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.department_color }} />
                      <CardTitle className="text-lg">{dept.department_name}</CardTitle>
                    </div>
                    <Badge variant="outline">{dept.total_members} members</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Bookings</p>
                        <p className="text-2xl font-bold">{dept.total_bookings}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Events</p>
                        <p className="text-2xl font-bold">{dept.total_events}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Active Members</span>
                        <span>{dept.active_members}/{dept.total_members}</span>
                      </div>
                      <Progress value={(dept.active_members / dept.total_members) * 100} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion Rate</span>
                        <span>{dept.completion_rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={dept.completion_rate} />
                    </div>

                    <div className="pt-2">
                      <Button variant="ghost" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Team Performance Tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Team members with most bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsSummary?.teamPerformance.slice(0, 5).map((performer, index) => (
                    <div key={performer.member} className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{performer.member.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1">
                            <Award className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{performer.member}</p>
                        <p className="text-sm text-muted-foreground">
                          {performer.bookings} bookings · {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(performer.revenue)}
                        </p>
                      </div>
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Stats</CardTitle>
                <CardDescription>Overall team metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Members</span>
                    <span className="font-bold">{teamMembers.filter(m => m.status === "active").length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Invites</span>
                    <span className="font-bold">0</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Bookings/Member</span>
                    <span className="font-bold">
                      {analyticsSummary && teamMembers.length > 0 
                        ? (analyticsSummary.totalBookings / teamMembers.length).toFixed(1) 
                        : 0}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Top Department</span>
                    <span className="font-bold">
                      {analyticsSummary?.departmentBreakdown[0]?.name || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eventTypes.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/event-types/${event.id}`)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }} />
                      <CardTitle className="text-base">{event.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className={
                      event.scope === 'personal' ? 'bg-blue-50 text-blue-700' : 
                      event.scope === 'organization' ? 'bg-green-50 text-green-700' : 
                      'bg-purple-50 text-purple-700'
                    }>
                      {event.scope}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Duration</span>
                      <span>{event.duration} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Bookings</span>
                      <span>
                        {bookings.filter(b => b.event_type_id === event.id).length + 
                         pastBookings.filter(b => b.event_type_id === event.id).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Location</span>
                      <span className="capitalize">{event.location_type}</span>
                    </div>
                    {event.price_cents && event.price_cents > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Price</span>
                        <span>
                          {new Intl.NumberFormat('en-US', { 
                            style: 'currency', 
                            currency: event.currency || 'USD' 
                          }).format(event.price_cents / 100)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Regular Availability</CardTitle>
                <CardDescription>Your weekly schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DAYS.map((day, index) => {
                    const slots = availability.filter(s => s.day_of_week === index);
                    return (
                      <div key={day} className="flex items-start gap-4">
                        <div className="w-24 font-medium">{day}</div>
                        <div className="flex-1">
                          {slots.length > 0 ? (
                            slots.map((slot, i) => (
                              <div key={i} className="text-sm">
                                {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Not available</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Overrides</CardTitle>
                <CardDescription>Special availability changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overrides.length > 0 ? (
                    overrides.map(override => (
                      <div key={override.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{format(parseISO(override.date), 'MMMM d, yyyy')}</p>
                          {override.is_blocked ? (
                            <p className="text-sm text-red-500">Unavailable</p>
                          ) : (
                            <p className="text-sm">
                              {override.start_time?.slice(0, 5)} - {override.end_time?.slice(0, 5)}
                            </p>
                          )}
                          {override.reason && (
                            <p className="text-xs text-muted-foreground mt-1">{override.reason}</p>
                          )}
                        </div>
                        <Badge variant={override.is_blocked ? "destructive" : "default"}>
                          {override.is_blocked ? "Blocked" : "Override"}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No overrides scheduled</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Team Activity</CardTitle>
              <CardDescription>Latest actions across the organization</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {activity.length > 0 ? (
                    activity.map((item) => (
                      <div key={item.id} className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{item.user_name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{item.user_name || 'System'}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(parseISO(item.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">{item.details || `${item.action} ${item.type}`}</p>
                          {item.metadata && (
                            <pre className="text-xs text-muted-foreground mt-2 overflow-x-auto bg-muted p-2 rounded">
                              {JSON.stringify(item.metadata, null, 2)}
                            </pre>
                          )}
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {item.type}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent activity
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}