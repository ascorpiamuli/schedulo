// ============================================
// UTILITY FUNCTIONS & CONSTANTS
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