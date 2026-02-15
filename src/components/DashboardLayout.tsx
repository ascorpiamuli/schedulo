import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  LayoutDashboard,
  Clock,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  ChevronDown,
  User,
  HelpCircle,
  Sun,
  Moon,
  CheckCircle2,
  CreditCard,
  Clock3,
  CalendarCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types for notifications
interface Notification {
  id: string;
  type: 'booking_confirmed' | 'payment_received' | 'reminder' | 'team_invite' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Event Types", href: "/dashboard/events", icon: CalendarDays },
  { label: "Availability", href: "/dashboard/availability", icon: Clock },
  { label: "Bookings", href: "/dashboard/bookings", icon: Calendar },
  { label: "Team", href: "/dashboard/team", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

// Notification icons mapping
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'booking_confirmed':
      return <CalendarCheck className="h-4 w-4 text-[#1E3A8A]" />;
    case 'payment_received':
      return <CreditCard className="h-4 w-4 text-[#C2410C]" />;
    case 'reminder':
      return <Clock3 className="h-4 w-4 text-[#1E3A8A]" />;
    case 'team_invite':
      return <Users className="h-4 w-4 text-[#C2410C]" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

// Format time ago
const timeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  
  return 'just now';
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'booking_confirmed':
        // Navigate to booking details
        if (notification.data?.bookingId) {
          window.location.href = `/dashboard/bookings/${notification.data.bookingId}`;
        }
        break;
      case 'payment_received':
        // Navigate to payments
        window.location.href = '/dashboard/payments';
        break;
      case 'team_invite':
        // Navigate to team
        window.location.href = '/dashboard/team';
        break;
      default:
        // Do nothing
        break;
    }
    
    setNotificationsOpen(false);
  };

  // Delete notification
  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          toast.info(newNotification.title, {
            description: newNotification.message,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - fixed height, no scroll */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo - fixed at top */}
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <div className="bg-gradient-to-br from-[#1E3A8A] to-[#C2410C] p-1.5 rounded-lg shadow-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-[#C2410C] rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-[#C2410C] rounded-full" />
            </div>

            <span className="font-['Space_Grotesk'] font-bold text-base md:text-lg tracking-tight">
              <span className="text-white">SBP</span>
              <span className="text-[#C2410C]">Meet</span>
            </span>
          </Link>
        </div>

        {/* Nav - scrollable if needed, but usually fits */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-[#C2410C] animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section - fixed at bottom */}
        <div className="border-t border-sidebar-border p-4 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#C2410C] text-white text-sm font-semibold shadow-md shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-sidebar-foreground/60">Online</p>
            </div>

            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="truncate">Sign out</span>
          </Button>
        </div>
      </aside>

      {/* Main content - scrolls independently */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center gap-4 border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-4 shrink-0">
          {/* Mobile menu button */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </button>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 w-full bg-slate-50 dark:bg-slate-800 border-0 focus-visible:ring-1 focus-visible:ring-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden ml-auto"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Right side icons */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications Dropdown - Enhanced */}
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#C2410C] rounded-full text-[10px] text-white flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#C2410C] rounded-full animate-ping opacity-75" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <DropdownMenuLabel className="p-0 text-base font-semibold">
                    Notifications
                  </DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs text-[#1E3A8A] hover:text-[#C2410C] h-auto py-1"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Mark all as read
                    </Button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                        <Bell className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        We'll notify you when something arrives
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          "flex flex-col items-start p-4 cursor-pointer border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                          !notification.read && "bg-[#1E3A8A]/5"
                        )}
                      >
                        <div className="flex items-start gap-3 w-full">
                          {/* Icon */}
                          <div className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                            !notification.read ? "bg-[#1E3A8A]/10" : "bg-gray-100 dark:bg-gray-800"
                          )}>
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={cn(
                                "text-sm font-medium truncate",
                                !notification.read && "text-[#1E3A8A]"
                              )}>
                                {notification.title}
                              </p>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {timeAgo(notification.created_at)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            {notification.data?.amount && (
                              <p className="text-xs font-medium text-[#C2410C] mt-1">
                                {notification.data.amount}
                              </p>
                            )}
                          </div>

                          {/* Delete button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                            onClick={(e) => deleteNotification(notification.id, e)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#1E3A8A]" />
                        )}
                      </DropdownMenuItem>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-[#1E3A8A] hover:text-[#C2410C]"
                      onClick={() => {
                        setNotificationsOpen(false);
                        // Navigate to notifications page if you have one
                        // window.location.href = '/dashboard/notifications';
                      }}
                    >
                      View all notifications
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-[#1E3A8A] to-[#C2410C] text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings?tab=billing" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/help" className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600" 
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile search bar (when open) */}
        {searchOpen && (
          <div className="md:hidden p-4 border-b bg-white dark:bg-slate-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 w-full"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Main content area - scrolls, full width */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}