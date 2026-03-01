import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen,
  Code,
  Terminal,
  Zap,
  Users,
  Calendar,
  CreditCard,
  Globe,
  Lock,
  Settings,
  ChevronRight,
  BookMarked,
  FileText,
  Video,
  Download,
  Github,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Menu,
  Moon,
  Sun,
  Book,
  Braces,
  Workflow,
  Webhook,
  Shield,
  Clock,
  Mail,
  MessageCircle,
  Copy,
  CheckCheck,
  AlertCircle,
  Info,
  HelpCircle,
  Star,
  Github as GithubIcon,
  Twitter,
  Youtube,
  Linkedin,
  Puzzle,
  Cloud,
  Database,
  Key,
  UsersRound,
  Building2,
  RefreshCw,
  Bell,
  Share2,
  Link as LinkIcon,
  Smartphone,
  Laptop,
  Globe2,
  LockKeyhole,
  Eye,
  EyeOff,
  Filter,
  SlidersHorizontal,
  DownloadCloud,
  UploadCloud,
  Wallet,
  Landmark,
  Receipt,
  Clock3,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  CalendarX,
  Clock4,
  Hourglass,
  Timer,
  AlarmClock,
  BellRing,
  MessageSquare,
  Phone,
  Video as VideoIcon,
  MapPin,
  Building,
  Home,
  Briefcase,
  GraduationCap,
  Heart,
  Award,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  AreaChart,
  ScatterChart,
  Radar,
  Activity,
  Cpu,
  HardDrive,
  Server,
  Network,
  Wifi,
  Bluetooth,
  Battery,
  Power,
  Zap as ZapIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bell as BellIcon,
  Mail as MailIcon,
  MessageCircle as MessageCircleIcon,
  Send,
  Inbox,
  Archive,
  Trash2,
  Edit3,
  PenTool,
  Feather,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Unlink,
  Image,
  Video as VideoIcon2,
  Music,
  Mic,
  Headphones,
  Speaker,
  Volume1,
  Volume2,
  VolumeX,
  Radio,
  Podcast,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Shuffle,
  Repeat,
  Repeat1,
  HeartPulse,
  Stethoscope,
  Pill,
  Syringe,
  Thermometer,
  Droplets,
  Wind,
  Waves,
  Leaf,
  TreePine,
  Flower,
  Sun as SunIcon,
  Moon as MoonIcon,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Cloudy,
  Tornado,
  Hurricane,
  Compass,
  Navigation,
  Map,
  MapPin as MapPinIcon,
  Route,
  Bike,
  Car,
  Bus,
  Train,
  Tram,
  Ship,
  Plane,
  Rocket,
  Satellite,
  Telescope,
  Microscope,
  Atom,
  Dna,
  FlaskConical,
  TestTubes,
  Beaker,
  Brain,
  Eye as EyeIcon,
  Ear,
  Nose,
  Mouth,
  Tooth,
  Bone,
  Muscle,
  Heart as HeartIcon2,
  Lungs,
  Kidney,
  Liver,
  Stomach,
  Uterus,
  Baby,
  Child,
  Adult,
  Elderly,
  Dog,
  Cat,
  Fish,
  Bird,
  Rabbit,
  Turtle,
  Snake,
  Dragon,
  Spider,
  Insect,
  Bug,
  Ant,
  Bee,
  Butterfly,
  Feather as FeatherIcon,
  Egg,
  EggOff,
  Shell,
  Clover,
  Shamrock,
  FourLeafClover,
  Flower2,
  Sprout,
  Seed,
  Plant,
  Tree,
  Forest,
  Mountain,
  Volcano,
  Wave,
  Water,
  Droplet,
  Flood,
  Tsunami,
  Earthquake,
  Fire,
  Flame,
  FlameKindling,
  Cigarette,
  CigaretteOff,
  Alcohol,
  Wine,
  Beer,
  Coffee,
  Tea,
  Soda,
  Milk,
  Juice,
  Pizza,
  Burger,
  Fries,
  HotDog,
  Sandwich,
  Salad,
  Apple,
  Banana,
  Cherry,
  Grape,
  Lemon,
  Orange,
  Pear,
  Pineapple,
  Strawberry,
  Watermelon,
  Cake,
  Cookie,
  Candy,
  Lollipop,
  IceCream,
  Milkshake,
  Donut,
  Croissant,
  Bread,
  Rice,
  Noodles,
  Soup,
  Stew,
  EggFried,
  Pancakes,
  Waffle,
  Honey,
  Salt,
  Pepper,
  Spice,
  CoffeeBean,
  TeaLeaf,
  Gem
} from "lucide-react";

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("getting-started");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const sections = [
    { id: "getting-started", title: "Getting Started", icon: <Rocket className="h-4 w-4" /> },
    { id: "core-concepts", title: "Core Concepts", icon: <BookOpen className="h-4 w-4" /> },
    { id: "api-reference", title: "API Reference", icon: <Code className="h-4 w-4" /> },
    { id: "webhooks", title: "Webhooks", icon: <Webhook className="h-4 w-4" /> },
    { id: "integrations", title: "Integrations", icon: <Puzzle className="h-4 w-4" /> },
    { id: "payments", title: "Payments", icon: <CreditCard className="h-4 w-4" /> },
    { id: "team-management", title: "Team Management", icon: <Users className="h-4 w-4" /> },
    { id: "security", title: "Security", icon: <Lock className="h-4 w-4" /> },
    { id: "sdk-cli", title: "SDK & CLI", icon: <Terminal className="h-4 w-4" /> },
    { id: "best-practices", title: "Best Practices", icon: <Award className="h-4 w-4" /> },
    { id: "troubleshooting", title: "Troubleshooting", icon: <AlertCircle className="h-4 w-4" /> },
    { id: "changelog", title: "Changelog", icon: <Clock className="h-4 w-4" /> }
  ];

  const apiEndpoints = [
    {
      method: "GET",
      path: "/api/v1/events",
      description: "Retrieve all event types",
      auth: "Bearer token required",
      response: `{
  "data": [
    {
      "id": "evt_123",
      "name": "30 Minute Meeting",
      "duration": 30,
      "slug": "30min",
      "color": "#1E3A8A",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10
  }
}`,
      curl: `curl -X GET https://api.sbpmeet.com/api/v1/events \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
    },
    {
      method: "POST",
      path: "/api/v1/events",
      description: "Create a new event type",
      auth: "Bearer token required",
      body: `{
  "name": "45 Minute Consultation",
  "duration": 45,
  "slug": "consultation",
  "description": "Initial consultation call",
  "color": "#C2410C",
  "location_type": "video",
  "price": 50,
  "currency": "KES"
}`,
      response: `{
  "success": true,
  "data": {
    "id": "evt_456",
    "name": "45 Minute Consultation",
    "duration": 45,
    "slug": "consultation",
    "created_at": "2024-01-01T00:00:00Z"
  }
}`,
      curl: `curl -X POST https://api.sbpmeet.com/api/v1/events \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "45 Minute Consultation",
    "duration": 45,
    "slug": "consultation",
    "location_type": "video",
    "price": 50
  }'`
    },
    {
      method: "GET",
      path: "/api/v1/bookings",
      description: "List all bookings",
      auth: "Bearer token required",
      response: `{
  "data": [
    {
      "id": "bkg_789",
      "event_id": "evt_123",
      "guest_name": "John Doe",
      "guest_email": "john@example.com",
      "start_time": "2024-01-15T14:00:00Z",
      "end_time": "2024-01-15T14:30:00Z",
      "status": "confirmed",
      "payment_status": "paid",
      "amount": 50,
      "currency": "KES"
    }
  ]
}`,
      curl: `curl -X GET https://api.sbpmeet.com/api/v1/bookings \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    },
    {
      method: "POST",
      path: "/api/v1/bookings",
      description: "Create a booking",
      auth: "Public (no auth required)",
      body: `{
  "event_id": "evt_123",
  "guest_name": "Jane Smith",
  "guest_email": "jane@example.com",
  "start_time": "2024-01-16T15:00:00Z",
  "timezone": "Africa/Nairobi",
  "notes": "Looking forward to the call",
  "payment_method": "mpesa"
}`,
      response: `{
  "success": true,
  "data": {
    "id": "bkg_790",
    "status": "confirmed",
    "meet_link": "https://meet.google.com/abc-xyz",
    "payment": {
      "status": "completed",
      "transaction_id": "MPESA123456"
    }
  }
}`,
      curl: `curl -X POST https://api.sbpmeet.com/api/v1/bookings \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_id": "evt_123",
    "guest_name": "Jane Smith",
    "guest_email": "jane@example.com",
    "start_time": "2024-01-16T15:00:00Z"
  }'`
    },
    {
      method: "GET",
      path: "/api/v1/availability",
      description: "Get user availability",
      auth: "Bearer token required",
      response: `{
  "data": {
    "timezone": "Africa/Nairobi",
    "schedule": {
      "monday": [
        { "start": "09:00", "end": "12:00" },
        { "start": "13:00", "end": "17:00" }
      ],
      "tuesday": [
        { "start": "09:00", "end": "17:00" }
      ]
    },
    "exceptions": [
      {
        "date": "2024-01-20",
        "available": false
      }
    ]
  }
}`,
      curl: `curl -X GET https://api.sbpmeet.com/api/v1/availability \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    },
    {
      method: "PUT",
      path: "/api/v1/availability",
      description: "Update availability",
      auth: "Bearer token required",
      body: `{
  "timezone": "Africa/Nairobi",
  "schedule": {
    "monday": [
      { "start": "08:00", "end": "12:00" },
      { "start": "13:00", "end": "16:00" }
    ]
  }
}`,
      response: `{
  "success": true,
  "data": {
    "updated": true,
    "message": "Availability updated successfully"
  }
}`,
      curl: `curl -X PUT https://api.sbpmeet.com/api/v1/availability \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "timezone": "Africa/Nairobi",
    "schedule": {
      "monday": [
        { "start": "08:00", "end": "12:00" }
      ]
    }
  }'`
    },
    {
      method: "POST",
      path: "/api/v1/team/invites",
      description: "Invite team member",
      auth: "Bearer token required (Admin only)",
      body: `{
  "email": "newmember@company.com",
  "role": "member",
  "department": "engineering"
}`,
      response: `{
  "success": true,
  "data": {
    "invite_id": "inv_123",
    "status": "pending",
    "expires_at": "2024-02-01T00:00:00Z"
  }
}`,
      curl: `curl -X POST https://api.sbpmeet.com/api/v1/team/invites \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "newmember@company.com",
    "role": "member"
  }'`
    }
  ];

  const webhookEvents = [
    {
      event: "booking.created",
      description: "Triggered when a new booking is created",
      payload: `{
  "event": "booking.created",
  "timestamp": "2024-01-15T14:00:00Z",
  "data": {
    "booking_id": "bkg_123",
    "event_name": "30 Minute Meeting",
    "guest_name": "John Doe",
    "guest_email": "john@example.com",
    "start_time": "2024-01-16T15:00:00Z",
    "end_time": "2024-01-16T15:30:00Z",
    "status": "confirmed"
  }
}`
    },
    {
      event: "booking.cancelled",
      description: "Triggered when a booking is cancelled",
      payload: `{
  "event": "booking.cancelled",
  "timestamp": "2024-01-15T16:30:00Z",
  "data": {
    "booking_id": "bkg_123",
    "cancelled_by": "guest",
    "reason": "Schedule conflict",
    "original_time": "2024-01-16T15:00:00Z"
  }
}`
    },
    {
      event: "booking.rescheduled",
      description: "Triggered when a booking is rescheduled",
      payload: `{
  "event": "booking.rescheduled",
  "timestamp": "2024-01-15T10:15:00Z",
  "data": {
    "booking_id": "bkg_123",
    "old_time": "2024-01-16T15:00:00Z",
    "new_time": "2024-01-17T14:00:00Z",
    "reason": "Client request"
  }
}`
    },
    {
      event: "payment.succeeded",
      description: "Triggered when a payment is successful",
      payload: `{
  "event": "payment.succeeded",
  "timestamp": "2024-01-15T14:05:00Z",
  "data": {
    "booking_id": "bkg_123",
    "transaction_id": "MPESA123456",
    "amount": 50,
    "currency": "KES",
    "payment_method": "mpesa",
    "phone": "254700000000"
  }
}`
    },
    {
      event: "payment.failed",
      description: "Triggered when a payment fails",
      payload: `{
  "event": "payment.failed",
  "timestamp": "2024-01-15T14:05:00Z",
  "data": {
    "booking_id": "bkg_123",
    "reason": "Insufficient funds",
    "amount": 50,
    "currency": "KES",
    "retry_count": 1
  }
}`
    },
    {
      event: "team.member.joined",
      description: "Triggered when a team member accepts invite",
      payload: `{
  "event": "team.member.joined",
  "timestamp": "2024-01-15T09:00:00Z",
  "data": {
    "user_id": "usr_123",
    "email": "member@company.com",
    "role": "member",
    "department": "engineering",
    "joined_at": "2024-01-15T09:00:00Z"
  }
}`
    }
  ];

  const sdkExamples = [
    {
      language: "JavaScript",
      icon: <Braces className="h-5 w-5" />,
      code: `// Initialize SBPMeet SDK
import { SBPMeet } from '@sbpmeet/sdk';

const sbpmeet = new SBPMeet({
  apiKey: 'your_api_key_here',
  environment: 'production' // or 'sandbox'
});

// Create an event type
const event = await sbpmeet.events.create({
  name: 'Consultation Call',
  duration: 30,
  price: 50,
  currency: 'KES'
});

// Get availability
const availability = await sbpmeet.availability.get({
  userId: 'user_123',
  date: '2024-01-20'
});

// Create a booking
const booking = await sbpmeet.bookings.create({
  eventId: 'evt_123',
  guestName: 'John Doe',
  guestEmail: 'john@example.com',
  startTime: '2024-01-20T14:00:00Z',
  timezone: 'Africa/Nairobi'
});

// Handle webhooks
sbpmeet.webhooks.on('booking.created', (payload) => {
  console.log('New booking:', payload);
  // Send notification, update CRM, etc.
});`
    },
    {
      language: "Python",
      icon: <Terminal className="h-5 w-5" />,
      code: `# Initialize SBPMeet SDK
from sbpmeet import SBPMeet

sbpmeet = SBPMeet(
    api_key='your_api_key_here',
    environment='production'  # or 'sandbox'
)

# Create an event type
event = sbpmeet.events.create({
    'name': 'Consultation Call',
    'duration': 30,
    'price': 50,
    'currency': 'KES'
})

# Get availability
availability = sbpmeet.availability.get(
    user_id='user_123',
    date='2024-01-20'
)

# Create a booking
booking = sbpmeet.bookings.create({
    'event_id': 'evt_123',
    'guest_name': 'John Doe',
    'guest_email': 'john@example.com',
    'start_time': '2024-01-20T14:00:00Z',
    'timezone': 'Africa/Nairobi'
})

# Webhook handler
@sbpmeet.webhooks.handler('booking.created')
def handle_booking(payload):
    print(f"New booking: {payload}")
    # Send notification, update CRM, etc.`
    },
    {
      language: "PHP",
      icon: <Code className="h-5 w-5" />,
      code: `<?php
// Initialize SBPMeet SDK
require_once 'vendor/autoload.php';

use SBPMeet\Client;

$sbpmeet = new Client([
    'api_key' => 'your_api_key_here',
    'environment' => 'production' // or 'sandbox'
]);

// Create an event type
$event = $sbpmeet->events->create([
    'name' => 'Consultation Call',
    'duration' => 30,
    'price' => 50,
    'currency' => 'KES'
]);

// Get availability
$availability = $sbpmeet->availability->get([
    'user_id' => 'user_123',
    'date' => '2024-01-20'
]);

// Create a booking
$booking = $sbpmeet->bookings->create([
    'event_id' => 'evt_123',
    'guest_name' => 'John Doe',
    'guest_email' => 'john@example.com',
    'start_time' => '2024-01-20T14:00:00Z',
    'timezone' => 'Africa/Nairobi'
]);

// Webhook handler
$sbpmeet->webhooks->on('booking.created', function($payload) {
    echo "New booking: " . json_encode($payload);
    // Send notification, update CRM, etc.
});
?>`
    },
    {
      language: "Ruby",
      icon: <Gem className="h-5 w-5" />,
      code: `# Initialize SBPMeet SDK
require 'sbpmeet'

sbpmeet = SBPMeet::Client.new(
  api_key: 'your_api_key_here',
  environment: 'production' # or 'sandbox'
)

# Create an event type
event = sbpmeet.events.create(
  name: 'Consultation Call',
  duration: 30,
  price: 50,
  currency: 'KES'
)

# Get availability
availability = sbpmeet.availability.get(
  user_id: 'user_123',
  date: '2024-01-20'
)

# Create a booking
booking = sbpmeet.bookings.create(
  event_id: 'evt_123',
  guest_name: 'John Doe',
  guest_email: 'john@example.com',
  start_time: '2024-01-20T14:00:00Z',
  timezone: 'Africa/Nairobi'
)

# Webhook handler
sbpmeet.webhooks.on('booking.created') do |payload|
  puts "New booking: #{payload}"
  # Send notification, update CRM, etc.
end`
    },
    {
      language: "Go",
      icon: <Code className="h-5 w-5" />,
      code: `package main

import (
    "context"
    "log"
    "github.com/sbpmeet/sdk-go"
)

func main() {
    // Initialize client
    client := sbpmeet.NewClient(
        "your_api_key_here",
        sbpmeet.WithEnvironment("production"),
    )

    // Create event
    event, err := client.Events.Create(context.Background(), &sbpmeet.CreateEventRequest{
        Name:     "Consultation Call",
        Duration: 30,
        Price:    50,
        Currency: "KES",
    })
    if err != nil {
        log.Fatal(err)
    }

    // Get availability
    availability, err := client.Availability.Get(context.Background(), &sbpmeet.AvailabilityRequest{
        UserID: "user_123",
        Date:   "2024-01-20",
    })
    if err != nil {
        log.Fatal(err)
    }

    // Create booking
    booking, err := client.Bookings.Create(context.Background(), &sbpmeet.CreateBookingRequest{
        EventID:     "evt_123",
        GuestName:   "John Doe",
        GuestEmail:  "john@example.com",
        StartTime:   "2024-01-20T14:00:00Z",
        Timezone:    "Africa/Nairobi",
    })
    if err != nil {
        log.Fatal(err)
    }

    // Webhook handler
    client.Webhooks.On("booking.created", func(payload *sbpmeet.WebhookPayload) {
        log.Printf("New booking: %+v", payload)
    })
}`
    }
  ];

  const integrations = [
    {
      category: "Calendar",
      items: [
        { name: "Google Calendar", icon: <Calendar className="h-5 w-5" />, status: "active", docs: "/docs/integrations/google-calendar" },
        { name: "Microsoft Outlook", icon: <Mail className="h-5 w-5" />, status: "active", docs: "/docs/integrations/outlook" },
        { name: "Apple Calendar", icon: <Calendar className="h-5 w-5" />, status: "beta", docs: "/docs/integrations/apple-calendar" },
        { name: "Zoho Calendar", icon: <Calendar className="h-5 w-5" />, status: "coming-soon", docs: "#" }
      ]
    },
    {
      category: "Video Conferencing",
      items: [
        { name: "Google Meet", icon: <VideoIcon className="h-5 w-5" />, status: "active", docs: "/docs/integrations/google-meet" },
        { name: "Zoom", icon: <VideoIcon className="h-5 w-5" />, status: "active", docs: "/docs/integrations/zoom" },
        { name: "Microsoft Teams", icon: <VideoIcon className="h-5 w-5" />, status: "active", docs: "/docs/integrations/teams" },
        { name: "Webex", icon: <VideoIcon className="h-5 w-5" />, status: "beta", docs: "/docs/integrations/webex" }
      ]
    },
    {
      category: "Payments",
      items: [
        { name: "M-Pesa", icon: <Wallet className="h-5 w-5" />, status: "active", docs: "/docs/integrations/mpesa" },
        { name: "Stripe", icon: <CreditCard className="h-5 w-5" />, status: "active", docs: "/docs/integrations/stripe" },
        { name: "PayPal", icon: <CreditCard className="h-5 w-5" />, status: "beta", docs: "/docs/integrations/paypal" },
        { name: "Flutterwave", icon: <CreditCard className="h-5 w-5" />, status: "coming-soon", docs: "#" }
      ]
    },
    {
      category: "CRM",
      items: [
        { name: "Salesforce", icon: <Building className="h-5 w-5" />, status: "beta", docs: "/docs/integrations/salesforce" },
        { name: "HubSpot", icon: <Building className="h-5 w-5" />, status: "beta", docs: "/docs/integrations/hubspot" },
        { name: "Pipedrive", icon: <Building className="h-5 w-5" />, status: "coming-soon", docs: "#" },
        { name: "Zoho CRM", icon: <Building className="h-5 w-5" />, status: "coming-soon", docs: "#" }
      ]
    },
    {
      category: "Analytics",
      items: [
        { name: "Google Analytics", icon: <BarChart3 className="h-5 w-5" />, status: "active", docs: "/docs/integrations/google-analytics" },
        { name: "Mixpanel", icon: <BarChart3 className="h-5 w-5" />, status: "beta", docs: "/docs/integrations/mixpanel" },
        { name: "Amplitude", icon: <BarChart3 className="h-5 w-5" />, status: "beta", docs: "/docs/integrations/amplitude" },
        { name: "Segment", icon: <BarChart3 className="h-5 w-5" />, status: "coming-soon", docs: "#" }
      ]
    },
    {
      category: "Communication",
      items: [
        { name: "Slack", icon: <MessageCircle className="h-5 w-5" />, status: "active", docs: "/docs/integrations/slack" },
        { name: "Microsoft Teams", icon: <MessageCircle className="h-5 w-5" />, status: "active", docs: "/docs/integrations/teams-chat" },
        { name: "Discord", icon: <MessageCircle className="h-5 w-5" />, status: "beta", docs: "/docs/integrations/discord" },
        { name: "Telegram", icon: <Send className="h-5 w-5" />, status: "coming-soon", docs: "#" }
      ]
    }
  ];

  const bestPractices = [
    {
      title: "Rate Limiting",
      description: "Respect API rate limits to ensure reliable service",
      rules: [
        "Maximum 100 requests per minute per API key",
        "Burst limit of 200 requests per minute",
        "Exponential backoff for retries",
        "Cache responses when possible"
      ]
    },
    {
      title: "Error Handling",
      description: "Proper error handling improves user experience",
      rules: [
        "Handle 4xx and 5xx status codes appropriately",
        "Implement retry logic with backoff",
        "Log errors for debugging",
        "Show user-friendly error messages"
      ]
    },
    {
      title: "Webhook Reliability",
      description: "Ensure your webhooks are processed reliably",
      rules: [
        "Return 2xx status to acknowledge receipt",
        "Implement retry logic with exponential backoff",
        "Verify webhook signatures",
        "Process webhooks asynchronously"
      ]
    },
    {
      title: "Security",
      description: "Follow security best practices",
      rules: [
        "Store API keys securely",
        "Use environment variables",
        "Implement proper authentication",
        "Validate and sanitize input"
      ]
    }
  ];

  const troubleshooting = [
    {
      issue: "Webhook not receiving events",
      solutions: [
        "Verify webhook URL is publicly accessible",
        "Check webhook signature verification",
        "Ensure you're returning 200 status",
        "Check webhook logs in dashboard"
      ]
    },
    {
      issue: "API returns 401 Unauthorized",
      solutions: [
        "Verify API key is correct",
        "Check if API key has expired",
        "Ensure proper authentication header format",
        "Regenerate API key if compromised"
      ]
    },
    {
      issue: "Bookings not syncing with calendar",
      solutions: [
        "Re-authenticate calendar connection",
        "Check calendar permissions",
        "Verify timezone settings",
        "Check for calendar conflicts"
      ]
    },
    {
      issue: "M-Pesa payments failing",
      solutions: [
        "Verify phone number format",
        "Check if M-Pesa service is available",
        "Ensure sufficient balance",
        "Check transaction limits"
      ]
    },
    {
      issue: "Team invites not being received",
      solutions: [
        "Check spam folder",
        "Verify email address is correct",
        "Check if invite has expired",
        "Resend invite from dashboard"
      ]
    }
  ];

  const changelog = [
    {
      version: "2.5.0",
      date: "March 15, 2024",
      type: "major",
      changes: [
        "Added M-Pesa payment integration",
        "New team analytics dashboard",
        "Improved webhook delivery system",
        "API rate limiting increased to 100/min"
      ]
    },
    {
      version: "2.4.2",
      date: "February 28, 2024",
      type: "patch",
      changes: [
        "Fixed calendar sync issues",
        "Improved error messages",
        "Performance optimizations",
        "Security patches"
      ]
    },
    {
      version: "2.4.0",
      date: "February 1, 2024",
      type: "minor",
      changes: [
        "Added team availability feature",
        "New booking confirmation emails",
        "API endpoint for bulk operations",
        "Enhanced reporting tools"
      ]
    },
    {
      version: "2.3.0",
      date: "January 15, 2024",
      type: "minor",
      changes: [
        "Google Meet integration",
        "Zoom meeting provider",
        "Custom email templates",
        "Improved mobile responsiveness"
      ]
    },
    {
      version: "2.2.0",
      date: "January 1, 2024",
      type: "minor",
      changes: [
        "Team management features",
        "Role-based permissions",
        "Department organization",
        "Team booking analytics"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-[#1E3A8A] to-[#C2410C] p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">
                  SBP<span className="text-[#C2410C]">Meet</span>
                </span>
                <Badge variant="outline" className="ml-2">Docs v2.5</Badge>
              </Link>
              
              <nav className="hidden md:flex items-center gap-6">
                {sections.slice(0, 4).map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`text-sm font-medium transition-colors hover:text-[#1E3A8A] dark:hover:text-[#C2410C] ${
                      activeSection === section.id 
                        ? 'text-[#1E3A8A] dark:text-[#C2410C]' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search docs..."
                  className="pl-9 w-64 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon">
                <GithubIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Moon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  Documentation
                </p>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#C2410C]/10 dark:text-[#C2410C]'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {section.icon}
                    {section.title}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="space-y-2 px-3">
                  <a href="#" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-[#C2410C]">
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-[#C2410C]">
                    <MessageCircle className="h-4 w-4" />
                    Community
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-[#C2410C]">
                    <Mail className="h-4 w-4" />
                    Support
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-[#C2410C]">
                    <Download className="h-4 w-4" />
                    Download SDK
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="h-4 w-4 text-[#C2410C]" />
                    <p className="text-sm font-semibold">API Status</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">All systems operational</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">99.9% uptime this month</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            {/* Getting Started Section */}
            {activeSection === "getting-started" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Getting Started with SBPMeet
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Learn how to integrate SBPMeet into your application and start accepting bookings in minutes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg w-fit mb-4">
                        <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold mb-1">1. Get API Key</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Generate your API key from the dashboard
                      </p>
                      <Button variant="link" className="p-0 h-auto text-[#1E3A8A] dark:text-[#C2410C]">
                        Go to Dashboard <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg w-fit mb-4">
                        <Code className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-semibold mb-1">2. Make API Calls</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Start making requests to our REST API
                      </p>
                      <Button variant="link" className="p-0 h-auto text-[#1E3A8A] dark:text-[#C2410C]">
                        View API Reference <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg w-fit mb-4">
                        <Webhook className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="font-semibold mb-1">3. Set Up Webhooks</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Receive real-time updates about bookings
                      </p>
                      <Button variant="link" className="p-0 h-auto text-[#1E3A8A] dark:text-[#C2410C]">
                        Configure Webhooks <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Quick Start Guide</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-[#1E3A8A]/10 rounded-full mt-1">
                        <CheckCircle2 className="h-4 w-4 text-[#1E3A8A]" />
                      </div>
                      <div>
                        <h3 className="font-medium">Create an account</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Sign up for a free account at app.sbpmeet.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-[#1E3A8A]/10 rounded-full mt-1">
                        <CheckCircle2 className="h-4 w-4 text-[#1E3A8A]" />
                      </div>
                      <div>
                        <h3 className="font-medium">Create your first event</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Set up an event type with duration, price, and location
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-[#1E3A8A]/10 rounded-full mt-1">
                        <CheckCircle2 className="h-4 w-4 text-[#1E3A8A]" />
                      </div>
                      <div>
                        <h3 className="font-medium">Share your booking link</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Share your personal booking link with clients
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-[#1E3A8A]/10 rounded-full mt-1">
                        <CheckCircle2 className="h-4 w-4 text-[#1E3A8A]" />
                      </div>
                      <div>
                        <h3 className="font-medium">Connect your calendar</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Sync with Google Calendar or Outlook to avoid conflicts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <h2>Authentication</h2>
                  <p>
                    All API requests require authentication using an API key. You can generate API keys from your 
                    dashboard. Include your API key in the Authorization header:
                  </p>
                  <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
                    <code>Authorization: Bearer YOUR_API_KEY</code>
                  </pre>

                  <h2>Base URL</h2>
                  <p>All API endpoints are relative to the following base URL:</p>
                  <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
                    <code>https://api.sbpmeet.com/api/v1</code>
                  </pre>

                  <h2>Environments</h2>
                  <p>We provide two environments for testing and production:</p>
                  <ul>
                    <li><strong>Sandbox:</strong> https://sandbox.api.sbpmeet.com/api/v1</li>
                    <li><strong>Production:</strong> https://api.sbpmeet.com/api/v1</li>
                  </ul>
                </div>
              </div>
            )}

            {/* API Reference Section */}
            {activeSection === "api-reference" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    API Reference
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Complete documentation for the SBPMeet REST API.
                  </p>
                </div>

                <Tabs defaultValue="endpoints" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                    <TabsTrigger value="errors">Errors</TabsTrigger>
                  </TabsList>

                  <TabsContent value="endpoints" className="space-y-4 mt-6">
                    {apiEndpoints.map((endpoint, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={`
                                ${endpoint.method === 'GET' ? 'bg-green-100 text-green-700' : ''}
                                ${endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' : ''}
                                ${endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' : ''}
                                ${endpoint.method === 'DELETE' ? 'bg-red-100 text-red-700' : ''}
                              `}>
                                {endpoint.method}
                              </Badge>
                              <code className="text-sm">{endpoint.path}</code>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(endpoint.curl, `curl-${index}`)}
                            >
                              {copied === `curl-${index}` ? (
                                <CheckCheck className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <CardDescription>{endpoint.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <p className="text-xs font-semibold mb-2">Authentication: {endpoint.auth}</p>
                            {endpoint.body && (
                              <>
                                <p className="text-xs font-semibold mb-2">Request Body:</p>
                                <pre className="bg-gray-900 text-white p-3 rounded-lg text-xs overflow-x-auto">
                                  {endpoint.body}
                                </pre>
                              </>
                            )}
                            <p className="text-xs font-semibold mt-3 mb-2">Response:</p>
                            <pre className="bg-gray-900 text-white p-3 rounded-lg text-xs overflow-x-auto">
                              {endpoint.response}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="examples" className="space-y-4 mt-6">
                    {sdkExamples.map((example, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            {example.icon}
                            <CardTitle className="text-lg">{example.language}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="relative">
                            <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{example.code}</code>
                            </pre>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(example.code, `sdk-${index}`)}
                            >
                              {copied === `sdk-${index}` ? (
                                <CheckCheck className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="errors" className="space-y-4 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Error Codes</CardTitle>
                        <CardDescription>
                          Common error codes and their meanings
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <Badge variant="destructive">400</Badge>
                              <div>
                                <p className="font-medium">Bad Request</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  The request was malformed or missing required parameters.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <Badge variant="destructive">401</Badge>
                              <div>
                                <p className="font-medium">Unauthorized</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Invalid or missing API key.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <Badge variant="destructive">403</Badge>
                              <div>
                                <p className="font-medium">Forbidden</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  You don't have permission to access this resource.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <Badge variant="destructive">404</Badge>
                              <div>
                                <p className="font-medium">Not Found</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  The requested resource doesn't exist.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <Badge variant="destructive">429</Badge>
                              <div>
                                <p className="font-medium">Too Many Requests</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Rate limit exceeded. Please slow down your requests.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <Badge variant="destructive">500</Badge>
                              <div>
                                <p className="font-medium">Internal Server Error</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Something went wrong on our end. Please try again later.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Webhooks Section */}
            {activeSection === "webhooks" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Webhooks
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Receive real-time notifications about events in your SBPMeet account.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Setting Up Webhooks</CardTitle>
                    <CardDescription>
                      Follow these steps to configure webhooks for your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ol className="list-decimal list-inside space-y-3">
                      <li className="text-sm">
                        Go to Dashboard → Settings → Webhooks
                      </li>
                      <li className="text-sm">
                        Click "Add Webhook" and enter your endpoint URL
                      </li>
                      <li className="text-sm">
                        Select the events you want to receive
                      </li>
                      <li className="text-sm">
                        Save your webhook and copy the signing secret
                      </li>
                    </ol>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Webhook Events</CardTitle>
                    <CardDescription>
                      All available webhook events and their payloads
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {webhookEvents.map((event, index) => (
                      <div key={index} className="border-b last:border-0 pb-6 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{event.event}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {event.description}
                        </p>
                        <div className="relative">
                          <pre className="bg-gray-900 text-white p-3 rounded-lg text-xs overflow-x-auto">
                            {event.payload}
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(event.payload, `webhook-${index}`)}
                          >
                            {copied === `webhook-${index}` ? (
                              <CheckCheck className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Webhook Security</CardTitle>
                    <CardDescription>
                      Verify webhook signatures to ensure requests are from SBPMeet
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-sm font-mono mb-2">X-SBPMeet-Signature: sha256=...</p>
                      <pre className="bg-gray-900 text-white p-3 rounded-lg text-sm overflow-x-auto">
{`// Verify webhook signature
const crypto = require('crypto');

const secret = 'your_webhook_secret';
const signature = req.headers['x-sbpmeet-signature'];
const payload = JSON.stringify(req.body);

const expectedSignature = 
  'sha256=' + 
  crypto.createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid signature');
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Integrations Section */}
            {activeSection === "integrations" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Integrations
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Connect SBPMeet with your favorite tools and services.
                  </p>
                </div>

                {integrations.map((category, idx) => (
                  <div key={idx} className="space-y-4">
                    <h2 className="text-xl font-semibold">{category.category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.items.map((item, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                {item.icon}
                              </div>
                              <div>
                                <h3 className="font-medium">{item.name}</h3>
                                <Badge variant={
                                  item.status === 'active' ? 'default' :
                                  item.status === 'beta' ? 'secondary' :
                                  'outline'
                                } className="mt-1">
                                  {item.status}
                                </Badge>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={item.docs}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Best Practices Section */}
            {activeSection === "best-practices" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Best Practices
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Follow these guidelines to build reliable and scalable applications with SBPMeet.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {bestPractices.map((practice, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle>{practice.title}</CardTitle>
                        <CardDescription>{practice.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {practice.rules.map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Troubleshooting Section */}
            {activeSection === "troubleshooting" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Troubleshooting
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Common issues and their solutions.
                  </p>
                </div>

                <div className="space-y-4">
                  {troubleshooting.map((item, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                          {item.issue}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {item.solutions.map((solution, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <span>{solution}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Changelog Section */}
            {activeSection === "changelog" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Changelog
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    All notable changes to the SBPMeet platform.
                  </p>
                </div>

                <div className="space-y-6">
                  {changelog.map((release, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant={
                              release.type === 'major' ? 'destructive' :
                              release.type === 'minor' ? 'default' :
                              'secondary'
                            }>
                              v{release.version}
                            </Badge>
                            <span className="text-sm text-gray-500">{release.date}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {release.changes.map((change, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2" />
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Right Sidebar - On This Page */}
          <aside className="hidden xl:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                On this page
              </p>
              <div className="space-y-1">
                <a href="#" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-[#C2410C]">
                  Introduction
                </a>
                <a href="#" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-[#C2410C]">
                  Authentication
                </a>
                <a href="#" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-[#C2410C]">
                  Base URL
                </a>
                <a href="#" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-[#C2410C]">
                  Rate Limits
                </a>
                <a href="#" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-[#C2410C]">
                  Errors
                </a>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm font-semibold mb-3">Need help?</p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub Issues
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}