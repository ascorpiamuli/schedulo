// Organized navigation structure with sections
const navigation = [
  {
    title: "MAIN",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Events", href: "/dashboard/events", icon: CalendarDays },
      { name: "Availability", href: "/dashboard/availability", icon: Clock },
      { name: "Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
    ]
  },
  {
    title: "TEAM",
    items: [
      { name: "Team Overview", href: "/dashboard/team", icon: Users },
      { name: "Members", href: "/dashboard/team/members", icon: UserPlus },
      { name: "Departments", href: "/dashboard/team/departments", icon: Building2 },
      { name: "Team Calendar", href: "/dashboard/team/calendar", icon: CalendarRange },
      { name: "Analytics", href: "/dashboard/team/analytics", icon: BarChart3 },
    ]
  },
  {
    title: "ORGANIZATION",
    items: [
      { name: "Settings", href: "/dashboard/organization", icon: Settings },
      { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
      { name: "Integrations", href: "/dashboard/integrations", icon: Link2 },
      { name: "Security", href: "/dashboard/security", icon: Shield },
    ]
  },
  {
    title: "SUPPORT",
    items: [
      { name: "Help Center", href: "/help", icon: HelpCircle },
      { name: "Documentation", href: "/docs", icon: BookOpen },
    ]
  }
];