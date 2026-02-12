import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  Users, 
  ArrowRight, 
  Check, 
  Zap, 
  Shield, 
  Globe, 
  Star, 
  Smartphone,
  Video,
  Mail,
  Linkedin,
  Twitter,
  Instagram,
  ChevronRight,
  BarChart,
  RefreshCw,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Award,
  Headphones,
  Layers,
  Sparkles,
  Rocket,
  HeartHandshake,
  CheckCircle2,
  Clock3,
  Phone,
  MapPin,
  Network,
  Bot,
  Workflow,
  Gauge,
  Menu,
  X,
  Send,
  MessageSquare,
  Building2
} from "lucide-react";
import { useState, useEffect } from "react";

const features = [
  { 
    icon: CalendarCheck, 
    title: "One-click scheduling", 
    description: "Share your link and let clients book instantly. No more back-and-forth emails.",
    gradient: "from-violet-500 to-purple-500"
  },
  { 
    icon: RefreshCw, 
    title: "Two-way sync", 
    description: "Google Calendar, iCloud, Outlook - we keep everything in sync automatically.",
    gradient: "from-blue-500 to-cyan-500"
  },
  { 
    icon: Users, 
    title: "Team availability", 
    description: "See when your whole team is free and route leads to the right person.",
    gradient: "from-emerald-500 to-teal-500"
  },
  { 
    icon: DollarSign, 
    title: "Collect payments", 
    description: "Stripe & M-Pesa integration for paid bookings, deposits, and subscriptions.",
    gradient: "from-amber-500 to-orange-500"
  },
  { 
    icon: BarChart, 
    title: "Insights & analytics", 
    description: "Understand your booking patterns and no-show rates with detailed reports.",
    gradient: "from-pink-500 to-rose-500"
  },
  { 
    icon: Globe, 
    title: "Timezone intelligence", 
    description: "Automatic timezone detection so you never get the time wrong.",
    gradient: "from-indigo-500 to-blue-500"
  },
];

const stats = [
  { value: "1500+", label: "meetings booked", icon: CalendarCheck },
  { value: "800+", label: "active users", icon: Users },
  { value: "98%", label: "satisfaction rate", icon: Star },
  { value: "50+", label: "integrations", icon: Network },
];

const testimonials = [
  { 
    name: "Stephen Muli", 
    role: "Software Developer", 
    company: "Pasbest Ventures",
    text: "We've cut scheduling time by 80% and increased meeting show-rates by 25%. The M-Pesa integration was seamless.", 
    rating: 5,
    image: "SM"
  },
  { 
    name: "Benedict Musyoki", 
    role: "Chief Technology Officer", 
    company: "Pasbest Ventures",
    text: "My clients love how easy it is to book and pay. I've saved 5+ hours weekly that I now dedicate to patient care.", 
    rating: 5,
    image: "BM"
  },
  { 
    name: "Pascal Ngathike", 
    role: "Director of Operations", 
    company: "Aldapas Limited",
    text: "From solo consultant to 12-person team, Pasbest Talks has scaled perfectly with us. Round-robin is a lifesaver.", 
    rating: 5,
    image: "PN"
  },
];

const calendarEvents = [
  {
    title: 'Strategy Call',
    start: '2025-01-20T10:00:00',
    end: '2025-01-20T10:30:00',
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    extendedProps: {
      type: 'paid',
      amount: '$120',
      client: 'Sarah J.'
    }
  },
  {
    title: 'Product Demo',
    start: '2025-01-20T14:00:00',
    end: '2025-01-20T14:45:00',
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    extendedProps: {
      type: 'free',
      amount: 'Free',
      client: 'TechCorp'
    }
  },
  {
    title: 'Consultation',
    start: '2025-01-21T09:30:00',
    end: '2025-01-21T10:30:00',
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    extendedProps: {
      type: 'paid',
      amount: '$150',
      client: 'Dr. Mwangi'
    }
  }
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for individuals getting started",
    features: [
      "1 event type",
      "Unlimited bookings",
      "Email notifications",
      "Calendar sync",
      "Basic analytics"
    ],
    notIncluded: [
      "Payment processing",
      "Team scheduling",
      "Custom branding"
    ],
    cta: "Get started",
    popular: false,
    gradient: "from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For professionals who need payments",
    features: [
      "Unlimited event types",
      "Stripe & M-Pesa",
      "Team scheduling (2 seats)",
      "Priority support",
      "Custom branding",
      "Advanced analytics",
      "SMS reminders"
    ],
    notIncluded: [
      "Round-robin routing",
      "API access"
    ],
    cta: "Start free trial",
    popular: true,
    gradient: "from-violet-500 to-purple-600"
  },
  {
    name: "Team",
    price: "$25",
    period: "per month",
    description: "For growing teams and agencies",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Round-robin routing",
      "Analytics dashboard",
      "API access",
      "SSO & advanced security",
      "Dedicated account manager"
    ],
    notIncluded: [],
    cta: "Contact sales",
    popular: false,
    gradient: "from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
  }
];

const integrations = [
  { name: "Google Calendar", icon: Calendar, color: "text-blue-500" },
  { name: "Stripe", icon: CreditCard, color: "text-purple-500" },
  { name: "Zoom", icon: Video, color: "text-blue-600" },
  { name: "M-Pesa", icon: Smartphone, color: "text-green-600" },
  { name: "Outlook", icon: Mail, color: "text-blue-400" },
  { name: "Slack", icon: Bot, color: "text-red-500" },
  { name: "Salesforce", icon: TrendingUp, color: "text-blue-700" },
  { name: "HubSpot", icon: Award, color: "text-orange-500" }
];

// Partner logos with actual image URLs
const partnerLogos = [
  { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1024px-Microsoft_logo.svg.png", width: 24, height: 24 },
  { name: "Zoom", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Zoom_Communications_Logo.svg/1200px-Zoom_Communications_Logo.svg.png", width: 24, height: 24 },
  { name: "Stripe", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png", width: 24, height: 24 },
  { name: "Slack", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/2048px-Slack_icon_2019.svg.png", width: 24, height: 24 },
  { name: "Salesforce", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/2560px-Salesforce.com_logo.svg.png", width: 24, height: 24 },
];

export default function Index() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState('idle');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    // Simulate form submission
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '', company: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* CLEAN HEADER - NEVER TOUCHES ENDS */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg' 
            : 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo - Left */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <div className="relative">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
                </div>
                <span className="font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent text-base md:text-lg">
                  Pasbest<span className="text-primary">Talks</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-1 lg:gap-2">
                {['Features', 'Pricing', 'Testimonials', 'Contact'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </nav>

            {/* Right Side Actions - Both Sign In & Get Started */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              {/* Sign In */}
              <Link 
                to="/login" 
                className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
              >
                Sign in
              </Link>
              
              {/* Get Started */}
              <Link
                to="/signup"
                className="hidden md:inline-flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all"
              >
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        } overflow-hidden`}>
          <div className="bg-white dark:bg-gray-950 border-t border-gray-200/50 dark:border-gray-800/50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-2">
                {['Features', 'Pricing', 'Testimonials', 'Contact'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {item}
                  </a>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 mt-1 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors text-center"
                  >
                    Get started
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero with Mini Calendar Preview */}
      <section className="relative pt-24 lg:pt-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 rounded-full mb-6 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Trusted by 100+ professionals</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Schedule smarter,
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  get paid faster
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-lg">
                Eliminate the back-and-forth. Share your link, accept payments, 
                and fill your calendar automatically.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-white h-12 px-6 shadow-lg shadow-primary/20 group">
                  <Link to="/signup">
                    Start for free
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 h-12 px-6">
                  <Link to="/demo">
                    <Video className="mr-2 h-4 w-4" />
                    Watch demo
                  </Link>
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[
                    { initial: 'JD', color: 'bg-blue-500' },
                    { initial: 'SK', color: 'bg-green-500' },
                    { initial: 'MP', color: 'bg-purple-500' },
                    { initial: 'AT', color: 'bg-amber-500' }
                  ].map((user, i) => (
                    <div
                      key={i}
                      className={`h-10 w-10 rounded-full ${user.color} border-2 border-white dark:border-gray-950 flex items-center justify-center text-xs font-medium text-white shadow-lg`}
                    >
                      {user.initial}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">20+</span> professionals
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Elegant Mini Calendar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              {/* Premium Calendar Card */}
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden backdrop-blur-sm">
                
                {/* Calendar Header */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                      </div>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                        pasbesttalks.app/pascal
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">Jan 20 - 26</span>
                    </div>
                  </div>
                </div>

                {/* Mini Calendar */}
                <div className="p-5">
                  <div className="custom-calendar-mini">
                    <style>{`
                      .custom-calendar-mini {
                        --fc-border-color: transparent;
                        --fc-button-text-color: #374151;
                        --fc-button-bg-color: transparent;
                        --fc-button-border-color: transparent;
                        --fc-button-hover-bg-color: #F3F4F6;
                        --fc-button-hover-border-color: transparent;
                        --fc-today-bg-color: #F9FAFB;
                      }
                      
                      .dark .custom-calendar-mini {
                        --fc-button-text-color: #E5E7EB;
                        --fc-button-hover-bg-color: #1F2937;
                        --fc-today-bg-color: #111827;
                      }

                      .custom-calendar-mini .fc {
                        font-family: inherit;
                        height: 260px;
                      }

                      .custom-calendar-mini .fc .fc-toolbar {
                        margin-bottom: 0.75rem;
                      }

                      .custom-calendar-mini .fc .fc-toolbar-title {
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: #111827;
                      }

                      .dark .custom-calendar-mini .fc .fc-toolbar-title {
                        color: #F9FAFB;
                      }

                      .custom-calendar-mini .fc .fc-button {
                        padding: 0.25rem 0.5rem;
                        font-size: 0.75rem;
                        border-radius: 0.375rem;
                      }

                      .custom-calendar-mini .fc .fc-daygrid-day {
                        padding: 0.125rem;
                      }

                      .custom-calendar-mini .fc .fc-daygrid-day-number {
                        font-size: 0.75rem;
                        font-weight: 500;
                        color: #374151;
                        padding: 0.25rem;
                      }

                      .dark .custom-calendar-mini .fc .fc-daygrid-day-number {
                        color: #E5E7EB;
                      }

                      .custom-calendar-mini .fc .fc-day-today .fc-daygrid-day-number {
                        background: #8B5CF6;
                        color: white;
                        border-radius: 9999px;
                        width: 22px;
                        height: 22px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      }

                      .custom-calendar-mini .fc .fc-event {
                        border-radius: 4px;
                        padding: 1px 2px;
                        font-size: 0.7rem;
                        border: none;
                        margin-bottom: 1px;
                      }

                      .custom-calendar-mini .fc .fc-col-header-cell-cushion {
                        font-size: 0.7rem;
                        font-weight: 600;
                        color: #6B7280;
                        padding: 0.25rem 0;
                      }
                    `}</style>
                    <FullCalendar
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      initialDate="2025-01-20"
                      headerToolbar={{
                        left: 'prev,next',
                        center: 'title',
                        right: ''
                      }}
                      events={calendarEvents}
                      height="260px"
                      dayMaxEvents={2}
                      weekends={true}
                      eventDisplay="block"
                    />
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Next available:</span>
                      <span className="font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm">
                        Today, 2:00 PM
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary hover:text-primary/90 hover:bg-primary/5">
                      View all
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-2xl -z-10" />
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar - Animated Stats */}
      <section className="py-12 mt-8 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 group-hover:scale-110 transition-transform mb-3">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ANIMATED PARTNER LOGOS - MARQUEE WITH ACTUAL IMAGES */}
      <section className="py-16 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
              Trusted by leading companies
            </p>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Join 10,000+ businesses worldwide
            </h2>
          </motion.div>

          <div className="relative overflow-hidden">
            {/* Gradient Fade Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-gray-950 dark:via-gray-950/80 z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-gray-950 dark:via-gray-950/80 z-10" />
            
            {/* Animated Marquee */}
            <div className="flex overflow-hidden">
              <motion.div 
                className="flex items-center gap-16 py-4"
                animate={{ x: [0, -1920] }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 40,
                    ease: "linear",
                  },
                }}
              >
                {/* Double the logos for seamless loop */}
                {[...partnerLogos, ...partnerLogos, ...partnerLogos].map((logo, index) => (
                  <div key={index} className="flex items-center gap-3 flex-shrink-0">
                    <div className="h-10 w-10 flex items-center justify-center">
                      <img 
                        src={logo.logo} 
                        alt={logo.name}
                        className="max-h-8 max-w-8 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {logo.name}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Integration Count */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800">
              <Network className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">50+</span> integrations available
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full mb-4">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powerful features</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to run your business
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              A complete scheduling platform with payments, team management, and analytics.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group relative bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity`} />
                <div className="relative">
                  <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-24 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full mb-4">
              <Workflow className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Simple process</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Get started in 3 simple steps
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Set your availability",
                description: "Define your working hours, buffer times, and custom rules once.",
                icon: Clock,
                color: "from-violet-500 to-purple-500"
              },
              {
                step: "2",
                title: "Share your link",
                description: "Send your unique Pasbest Talks URL or embed it on your website.",
                icon: Globe,
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "3",
                title: "Get booked & paid",
                description: "Clients book and pay instantly. We handle the reminders.",
                icon: DollarSign,
                color: "from-emerald-500 to-teal-500"
              }
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r ${step.color} text-white font-bold text-lg mb-4 shadow-lg`}>
                  {step.step}
                </div>
                <step.icon className="h-7 w-7 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full mb-4">
              <HeartHandshake className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Trusted by professionals</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by thousands of businesses
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-semibold">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  "{testimonial.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - FULL VERSION RESTORED */}
      <section id="pricing" className="py-20 lg:py-24 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full mb-4">
              <Rocket className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Simple pricing</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Transparent pricing, pay as you grow
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Start free. Upgrade when you need more.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: plan.popular ? 1.05 : 1.02 }}
                className={`relative rounded-2xl overflow-hidden ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-primary/5 to-white dark:from-primary/10 dark:to-gray-900 border-2 border-primary shadow-2xl shadow-primary/20' 
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-white px-4 py-1.5 rounded-bl-xl text-xs font-medium shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                    {plan.description}
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 opacity-50">
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0" />
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full h-12 text-base ${
                      plan.popular 
                        ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30' 
                        : 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white'
                    }`}
                    asChild
                  >
                    <Link to={plan.popular ? "/signup" : plan.name === "Free" ? "/signup" : "/contact"}>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Money-back guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-900 px-6 py-3 rounded-full border border-gray-200 dark:border-gray-800">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                14-day free trial on Pro plan. No credit card required.
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Works with your favorite tools
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Seamless integration with 50+ apps you already use.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {integrations.map((integration, i) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center group"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <integration.icon className={`h-6 w-6 ${integration.color}`} />
                </div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {integration.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-full mb-6 shadow-lg border border-gray-200 dark:border-gray-800">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Join 20+ professionals
              </span>
            </div>
            
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Ready to save 10+ hours
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                every week?
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who've eliminated the email tennis match 
              and started getting paid faster.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-white h-12 px-8 shadow-2xl shadow-primary/30 group">
                <Link to="/signup">
                  Start your free 14-day trial
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-2 border-gray-300 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 h-12 px-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <Link to="/contact">
                  <Headphones className="mr-2 h-4 w-4" />
                  Talk to sales
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONTACT FORM SECTION */}
      <section id="contact" className="py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full mb-4">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Get in touch</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Have questions? We're here to help
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Whether you're just starting out or scaling up, our team is ready to assist you.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-800"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Your Company Ltd"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white text-base font-medium rounded-lg shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {formStatus === 'submitting' ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : formStatus === 'success' ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Message Sent!
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Send Message
                    </span>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Company Info Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Pasbest Ventures Limited</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Parent Company</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Headquarters</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Nairobi, Kenya</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
                      <a href="mailto:info@pasbestventures.com" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                        info@pasbestventures.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</p>
                      <a href="tel:+254700000000" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                        +254 700 000 000
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="font-semibold text-gray-900 dark:text-white">Pasbest Talks</span> is a product of Pasbest Ventures Limited, 
                    dedicated to providing modern scheduling solutions for professionals worldwide.
                  </p>
                  <a 
                    href="https://pasbestventures.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Visit pasbestventures.com
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Support Hours */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Support Hours</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monday - Friday</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">8:00 AM - 6:00 PM EAT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Saturday</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">9:00 AM - 2:00 PM EAT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sunday</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Closed</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                  We typically respond within 24 hours during business days.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PREMIUM FOOTER - WITH PASBEST VENTURES LINKING */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
            {/* Company Info - Pasbest Talks */}
            <div className="col-span-2 md:col-span-1 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-6 w-6 text-primary" />
                <span className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Pasbest<span className="text-primary">Talks</span>
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs leading-relaxed mb-4">
                Modern scheduling for modern professionals. A product of Pasbest Ventures Limited, 
                based in Nairobi, serving the world.
              </p>
              <div className="flex gap-4 mt-4">
                <a href="https://twitter.com/pasbestventures" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://linkedin.com/company/pasbestventures" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="https://instagram.com/pasbestventures" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Testimonials</a></li>
                <li><a href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Contact</a></li>
                <li><a href="/integrations" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            {/* Company Links - All go to pasbestventures.com */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="https://pasbestventures.com/about" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">About Us</a></li>
                <li><a href="https://pasbestventures.com/careers" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Careers</a></li>
                <li><a href="https://pasbestventures.com/contact" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Contact HQ</a></li>
                <li><a href="https://pasbestventures.com/blog" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Blog</a></li>
                <li><a href="https://pasbestventures.com/press" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Press</a></li>
              </ul>
            </div>
            
            {/* Legal Links - Some local, some to parent company */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="/security" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Security</a></li>
                <li><a href="/cookies" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Cookie Policy</a></li>
                <li><a href="https://pasbestventures.com/compliance" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>

          {/* Parent Company Banner */}
          <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 rounded-2xl border border-primary/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">A product of</p>
                  <a 
                    href="https://pasbestventures.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hover:from-primary/80 hover:to-primary/50 transition-all"
                  >
                    Pasbest Ventures Limited
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Innovating for a connected Africa</span>
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              © 2026 Pasbest Talks by Pasbest Ventures Limited. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="https://pasbestventures.com/status" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 dark:text-gray-500 hover:text-primary transition-colors">
                System Status
              </a>
              <a href="https://pasbestventures.com/api" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 dark:text-gray-500 hover:text-primary transition-colors">
                API
              </a>
              <a href="https://pasbestventures.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 dark:text-gray-500 hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="https://pasbestventures.com/terms" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 dark:text-gray-500 hover:text-primary transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}