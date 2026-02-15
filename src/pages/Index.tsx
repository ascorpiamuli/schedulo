import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  Users, 
  ArrowRight, 
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
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Clock3,
  Phone,
  MapPin,
  Network,
  Bot,
  Workflow,
  Menu,
  X,
  Send,
  MessageSquare,
  Building2,
  HelpCircle,
  ChevronDown,
  CalendarDays,
  BarChart3
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Toaster, toast } from "sonner";

// Color scheme: Primary Dark Blue (#1E3A8A), Secondary Orange Dark (#C2410C)
const features = [
  { 
    icon: CalendarCheck, 
    title: "One-click scheduling", 
    description: "Share your link and let clients book instantly. No more back-and-forth emails.",
    gradient: "from-[#1E3A8A] to-[#C2410C]"
  },
  { 
    icon: RefreshCw, 
    title: "Two-way sync", 
    description: "Google Calendar, iCloud, Outlook - we keep everything in sync automatically.",
    gradient: "from-[#1E3A8A] to-[#C2410C]"
  },
  { 
    icon: Users, 
    title: "Team availability", 
    description: "See when your whole team is free and route leads to the right person.",
    gradient: "from-[#1E3A8A] to-[#C2410C]"
  },
  { 
    icon: DollarSign, 
    title: "Collect payments", 
    description: "Stripe & M-Pesa integration for paid bookings, deposits, and subscriptions.",
    gradient: "from-[#1E3A8A] to-[#C2410C]"
  },
  { 
    icon: BarChart, 
    title: "Insights & analytics", 
    description: "Understand your booking patterns and no-show rates with detailed reports.",
    gradient: "from-[#1E3A8A] to-[#C2410C]"
  },
  { 
    icon: Globe, 
    title: "Timezone intelligence", 
    description: "Automatic timezone detection so you never get the time wrong.",
    gradient: "from-[#1E3A8A] to-[#C2410C]"
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
    company: "Pasbest Ventures Limited",
    text: "We've cut scheduling time by 80% and increased meeting show-rates by 25%. The M-Pesa integration was seamless.", 
    rating: 5,
    image: "SM"
  },
  { 
    name: "Benedict Musyoki", 
    role: "Chief Technology Officer", 
    company: "Pasbest Ventures Limited",
    text: "My clients love how easy it is to book and pay. I've saved 5+ hours weekly that I now dedicate to patient care.", 
    rating: 5,
    image: "BM"
  },
  { 
    name: "Pascal Ngathike", 
    role: "Director of Operations", 
    company: "Pasbest Ventures Limited",
    text: "From solo consultant to 12-person team, SBPMeet has scaled perfectly with us. Round-robin is a lifesaver.", 
    rating: 5,
    image: "PN"
  },
];

// FAQ Data
const faqs = [
  {
    question: "How does SBPMeet handle payments?",
    answer: "We integrate with Stripe and M-Pesa for seamless payment processing. You can collect deposits, full payments, or set up subscriptions for your services."
  },
  {
    question: "Can I use SBPMeet with my existing calendar?",
    answer: "Yes! We sync two-way with Google Calendar, iCloud, Outlook, and more. Your calendar stays updated automatically."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, we offer a 14-day free trial on our Pro plan. No credit card required to start."
  },
  {
    question: "What happens if a client no-shows?",
    answer: "You can set cancellation policies, require deposits, and we'll send automated reminders to reduce no-shows by up to 80%."
  },
  {
    question: "Can my team use SBPMeet?",
    answer: "Absolutely! Our Team plan includes round-robin routing, team availability, and unified scheduling for up to 12 team members."
  },
  {
    question: "Is SBPMeet secure?",
    answer: "Yes, we're GDPR compliant and use enterprise-grade encryption. Your data is always protected."
  }
];

// Get current date for calendar
const today = new Date();

// Kenyan national holidays for 2025
const nationalHolidays = [
  {
    title: 'New Year\'s Day',
    start: '2025-01-01',
    allDay: true,
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
    textColor: '#FFFFFF',
    display: 'background',
    classNames: ['holiday-event']
  },
  {
    title: 'Good Friday',
    start: '2025-04-18',
    allDay: true,
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
    textColor: '#FFFFFF',
    display: 'background',
    classNames: ['holiday-event']
  },
  {
    title: 'Easter Monday',
    start: '2025-04-21',
    allDay: true,
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
    textColor: '#FFFFFF',
    display: 'background',
    classNames: ['holiday-event']
  },
  {
    title: 'Labour Day',
    start: '2025-05-01',
    allDay: true,
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
    textColor: '#FFFFFF',
    display: 'background',
    classNames: ['holiday-event']
  },
  {
    title: 'Madaraka Day',
    start: '2025-06-01',
    allDay: true,
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
    textColor: '#FFFFFF',
    display: 'background',
    classNames: ['holiday-event']
  },
  {
    title: 'Mashujaa Day',
    start: '2025-10-20',
    allDay: true,
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
    textColor: '#FFFFFF',
    display: 'background',
    classNames: ['holiday-event']
  },
  {
    title: 'Jamhuri Day',
    start: '2025-12-12',
    allDay: true,
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
    textColor: '#FFFFFF',
    display: 'background',
    classNames: ['holiday-event']
  },
  {
    title: 'Christmas Day',
    start: '2025-12-25',
    allDay: true,
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
    textColor: '#FFFFFF',
    display: 'background',
    classNames: ['holiday-event']
  },
  {
    title: 'Boxing Day',
    start: '2025-12-26',
    allDay: true,
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
    textColor: '#FFFFFF',
    display: 'background',
    classNames: ['holiday-event']
  }
];

// Sample events with paid/free indicators
const calendarEvents = [
  {
    title: '💰 Strategy Call',
    start: '2025-01-20T10:00:00',
    end: '2025-01-20T10:30:00',
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
    extendedProps: {
      type: 'paid',
      amount: '$120',
      client: 'Sarah J.'
    }
  },
  {
    title: '🎥 Product Demo',
    start: '2025-01-20T14:00:00',
    end: '2025-01-20T14:45:00',
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
    extendedProps: {
      type: 'free',
      amount: 'Free',
      client: 'TechCorp'
    }
  },
  {
    title: '💰 Consultation',
    start: '2025-01-21T09:30:00',
    end: '2025-01-21T10:30:00',
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
    extendedProps: {
      type: 'paid',
      amount: '$150',
      client: 'Dr. Mwangi'
    }
  },
  {
    title: '🎥 Team Meeting',
    start: '2025-01-22T11:00:00',
    end: '2025-01-22T12:00:00',
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
    extendedProps: {
      type: 'free',
      amount: 'Free',
      client: 'Internal'
    }
  },
  {
    title: '💰 Client Workshop',
    start: '2025-01-23T13:00:00',
    end: '2025-01-23T15:00:00',
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
    extendedProps: {
      type: 'paid',
      amount: '$300',
      client: 'ABC Corp'
    }
  },
  ...nationalHolidays
];

const integrations = [
  { name: "Google Calendar", icon: Calendar, color: "text-[#1E3A8A]" },
  { name: "Stripe", icon: CreditCard, color: "text-[#C2410C]" },
  { name: "Zoom", icon: Video, color: "text-[#1E3A8A]" },
  { name: "M-Pesa", icon: Smartphone, color: "text-[#C2410C]" },
  { name: "Outlook", icon: Mail, color: "text-[#1E3A8A]" },
  { name: "Slack", icon: Bot, color: "text-[#C2410C]" },
  { name: "Salesforce", icon: TrendingUp, color: "text-[#1E3A8A]" },
  { name: "HubSpot", icon: Award, color: "text-[#C2410C]" }
];

// Partner logos
const partnerLogos = [
  { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1024px-Microsoft_logo.svg.png" },
  { name: "Zoom", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Zoom_Communications_Logo.svg/1200px-Zoom_Communications_Logo.svg.png" },
  { name: "Stripe", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png" },
  { name: "Slack", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/2048px-Slack_icon_2019.svg.png" },
  { name: "Salesforce", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/2560px-Salesforce.com_logo.svg.png" },
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
  const [calendarApi, setCalendarApi] = useState(null);
  
  // Footer waitlist state
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState('idle');
  
  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Demo request flag - to track if message should be read-only
  const [isDemoRequest, setIsDemoRequest] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for demo request in sessionStorage on component mount
  useEffect(() => {
    const demoRequested = sessionStorage.getItem('demoRequest') === 'true';
    if (demoRequested) {
      setIsDemoRequest(true);
      setFormData(prev => ({
        ...prev,
        message: "I would like to request a product demo. Please show me how SBPMeet works for scheduling and payments."
      }));
      // Clear the flag after setting
      sessionStorage.removeItem('demoRequest');
    }
  }, []);

  const handleCalendarInit = (calendar) => {
    setCalendarApi(calendar);
    if (calendar) {
      calendar.gotoDate(today);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Contact form submit - FIXED version
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    

    // Validate before sending
    if (!formData.name || !formData.email || !formData.message) {
      console.error('❌ Validation failed:', {
        name: formData.name,
        email: formData.email,
        message: formData.message
      });
      
      toast.error('Please fill in all required fields');
      setFormStatus('idle');
      return;
    }

    try {
      // Invoke the contact-form edge function
      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          company: formData.company?.trim() || null,
          message: formData.message.trim(),
          type: isDemoRequest ? 'demo' : 'contact'
        }
      });
      
      if (error) {
        console.error('❌ Edge function error:', error);
        throw error;
      }
      
      setFormStatus('success');
      setFormData({ name: '', email: '', company: '', message: '' });
      setIsDemoRequest(false);
      
      // Show success message
      toast.success(
        isDemoRequest 
          ? 'Demo request sent! Check your email for confirmation.' 
          : 'Message sent successfully! We\'ll get back to you soon.'
      );
      
      setTimeout(() => setFormStatus('idle'), 3000);
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      setFormStatus('error');
      toast.error('Failed to send message. Please try again.');
      setTimeout(() => setFormStatus('idle'), 3000);
    }
  };

  // Footer waitlist handler - UPDATED to use edge function
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistStatus('submitting');
    
    try {
      // Invoke the waitlist edge function
      const { data, error } = await supabase.functions.invoke('waitlist', {
        body: {
          email: waitlistEmail,
          name: null,
          company: null
        }
      });
      
      if (error) throw error;
      
      setWaitlistStatus('success');
      setWaitlistEmail('');
      toast.success('You\'ve been added to the waitlist! Check your email for confirmation.');
      setTimeout(() => setWaitlistStatus('idle'), 3000);
    } catch (error) {
      console.error('Error joining waitlist:', error);
      setWaitlistStatus('error');
      toast.error('Failed to join waitlist. Please try again.');
      setTimeout(() => setWaitlistStatus('idle'), 3000);
    }
  };
  const handleDemoRequest = () => {
    // ---- New code: redirect to video ----
    window.open(
      "https://drive.google.com/file/d/1wJ6Gqwa8QyDLwn7Atr8laMsqi57bzBPm/view?usp=sharing",
      "_blank"
    );

    // ---- Old demo request logic (commented out) ----
    /*
    // Set demo request flag in sessionStorage
    sessionStorage.setItem('demoRequest', 'true');
    
    // Scroll to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Update state
    setIsDemoRequest(true);
    setFormData(prev => ({
      ...prev,
      message: "I would like to request a product demo. Please show me how SBPMeet works for scheduling and payments."
    }));
    
    // Show a toast notification
    toast.info('Please fill in your details to request a demo', {
      duration: 5000,
    });
    */
  };

  // Contact sales - redirects to contact form with sales type
  const handleContactSales = () => {
    // Set sales request flag
    sessionStorage.setItem('salesRequest', 'true');
    
    // Scroll to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Update state for sales
    setIsDemoRequest(false);
    setFormData(prev => ({
      ...prev,
      message: "I'm interested in learning more about your pricing and plans for my business."
    }));
    
    toast.info('Please fill in your details and our sales team will contact you', {
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
  
      
      {/* Header */}
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
            {/* Logo - Updated to SBPMeet */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <div className="relative">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-[#1E3A8A]" />
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-[#C2410C] rounded-full animate-pulse" />
                </div>
                <span className="font-semibold bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent text-base md:text-lg">
                  SBPMeet
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-1 lg:gap-2">
                {['Features', 'Testimonials', 'FAQ', 'Contact'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#1E3A8A] dark:hover:text-[#1E3A8A] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <Link 
                to="/login" 
                className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#1E3A8A] dark:hover:text-[#1E3A8A] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
              >
                Sign in
              </Link>
              
              <Link
                to="/signup"
                className="hidden md:inline-flex items-center gap-1.5 px-5 py-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl shadow-[#1E3A8A]/25 transition-all"
              >
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        } overflow-hidden`}>
          <div className="bg-white dark:bg-gray-950 border-t border-gray-200/50 dark:border-gray-800/50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-2">
                {['Features', 'Testimonials', 'FAQ', 'Contact'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#1E3A8A] dark:hover:text-[#1E3A8A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {item}
                  </a>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#1E3A8A] dark:hover:text-[#1E3A8A] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 mt-1 text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 rounded-lg transition-colors text-center"
                  >
                    Get started
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-24 lg:pt-28 mb-12 overflow-hidden">
        {/* Background gradients with updated colors */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/5 via-transparent to-transparent" />
        <div className="pointer-events-none absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#C2410C]/5 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-20"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1E3A8A]/10 to-[#C2410C]/5 px-4 py-2 rounded-full mb-6 border border-[#1E3A8A]/20">
                <Sparkles className="h-4 w-4 text-[#1E3A8A]" />
                <span className="text-sm font-medium text-[#1E3A8A]">Trusted by 100+ professionals</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent">
                  Schedule smarter,
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#C2410C] to-[#C2410C]/70 bg-clip-text text-transparent">
                  get paid faster
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-lg">
                Eliminate the back-and-forth. Share your link, accept payments, 
                and fill your calendar automatically.
              </p>

              {/* Clickable CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-8 relative z-30">
                <Button size="lg" asChild className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white h-12 px-8 shadow-lg group">
                  <Link to="/signup">
                    Start free trial
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleDemoRequest}
                  className="border-2 border-[#C2410C] text-[#C2410C] hover:bg-[#C2410C] hover:text-white h-12 px-8"
                >
                  <Video className="mr-2 h-4 w-4" />
                  View Demo
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 relative z-20">
                <div className="flex -space-x-3">
                  {['JD', 'SK', 'MP', 'AT'].map((initial, i) => (
                    <div
                      key={i}
                      className={`h-10 w-10 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#C2410C] border-2 border-white dark:border-gray-950 flex items-center justify-center text-xs font-medium text-white shadow-lg`}
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-[#C2410C] text-[#C2410C]" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">20+</span> professionals
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right Column – Feature Highlight Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-20"
            >
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-800/60 p-8 backdrop-blur-sm space-y-8">

                {/* Title */}
                <h3 className="text-2xl font-bold tracking-tight text-[#1E3A8A] dark:text-white">
                  Everything you need to run your business
                </h3>

                {/* Features */}
                <div className="space-y-6">

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A]">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#1E3A8A]">Smart online scheduling</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Clients book themselves into your calendar automatically.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#C2410C]/10 text-[#C2410C]">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#C2410C]">Frictionless payments</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Get paid upfront or after the session—no more chasing invoices.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A]">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#1E3A8A]">Automated reminders</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Reduce no-shows with email & SMS reminders sent automatically.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#C2410C]/10 text-[#C2410C]">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#C2410C]">Insights & analytics</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Track growth, revenue, and appointment trends in real time.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-gray-200 dark:border-gray-800">
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
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-[#1E3A8A]/10 to-[#C2410C]/5 group-hover:scale-110 transition-transform mb-3">
                  <stat.icon className="h-5 w-5 text-[#1E3A8A]" />
                </div>
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Logos */}
      <section className="py-16 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-sm font-medium text-[#1E3A8A] uppercase tracking-wider mb-2">
              Trusted by leading companies
            </p>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#1E3A8A] dark:text-white">
              Join 10,000+ businesses worldwide
            </h2>
          </motion.div>

          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-gray-950 dark:via-gray-950/80 z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-gray-950 dark:via-gray-950/80 z-10" />
            
            <div className="flex overflow-hidden">
              <motion.div 
                className="flex items-center gap-16 py-4"
                animate={{ x: [0, -1920] }}
                transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 40, ease: "linear" } }}
              >
                {[...partnerLogos, ...partnerLogos, ...partnerLogos].map((logo, index) => (
                  <div key={index} className="flex items-center gap-3 flex-shrink-0">
                    <div className="h-10 w-10 flex items-center justify-center">
                      <img src={logo.logo} alt={logo.name} className="max-h-8 max-w-8 object-contain grayscale hover:grayscale-0 transition-all duration-300" />
                    </div>
                    <span className="text-sm font-medium text-[#1E3A8A] dark:text-gray-300">{logo.name}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/5 px-4 py-2 rounded-full mb-4">
              <Zap className="h-4 w-4 text-[#1E3A8A]" />
              <span className="text-sm font-medium text-[#1E3A8A]">Powerful features</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1E3A8A] dark:text-white mb-4">
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
                className="group relative bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-[#1E3A8A]/30 hover:shadow-lg transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity`} />
                <div className="relative">
                  <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-[#1E3A8A]/10 to-[#C2410C]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-5 w-5 text-[#1E3A8A]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1E3A8A] dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-24 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/5 px-4 py-2 rounded-full mb-4">
              <HeartHandshake className="h-4 w-4 text-[#1E3A8A]" />
              <span className="text-sm font-medium text-[#1E3A8A]">Trusted by professionals</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1E3A8A] dark:text-white mb-4">
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
                className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-[#1E3A8A]/30 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#1E3A8A]/20 to-[#C2410C]/10 flex items-center justify-center text-[#1E3A8A] font-semibold">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E3A8A] dark:text-white">{testimonial.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#C2410C] text-[#C2410C]" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/5 px-4 py-2 rounded-full mb-4">
              <HelpCircle className="h-4 w-4 text-[#1E3A8A]" />
              <span className="text-sm font-medium text-[#1E3A8A]">Got questions?</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1E3A8A] dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Everything you need to know about SBPMeet
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <span className="font-semibold text-[#1E3A8A] dark:text-white">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-[#C2410C] transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-300 ${openFaq === index ? 'pb-4' : 'max-h-0'}`}>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 relative overflow-hidden bg-gradient-to-br from-[#1E3A8A]/10 via-[#C2410C]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent">
                Ready to save 10+ hours
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#C2410C] to-[#C2410C]/70 bg-clip-text text-transparent">
                every week?
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who've eliminated the email tennis match 
              and started getting paid faster.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white h-12 px-8 shadow-2xl shadow-[#1E3A8A]/30 group">
                <Link to="/signup">
                  Start your free 14-day trial
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleContactSales}
                className="border-2 border-[#C2410C] text-[#C2410C] hover:bg-[#C2410C] hover:text-white h-12 px-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
              >
                <Headphones className="mr-2 h-4 w-4" />
                Contact sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/5 px-4 py-2 rounded-full mb-4">
              <MessageSquare className="h-4 w-4 text-[#1E3A8A]" />
              <span className="text-sm font-medium text-[#1E3A8A]">Get in touch</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1E3A8A] dark:text-white mb-4">
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
              {isDemoRequest && (
                <div className="mb-6 p-4 bg-[#1E3A8A]/10 border border-[#C2410C]/30 rounded-lg">
                  <p className="text-sm text-[#1E3A8A] font-medium flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Demo Request
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Please fill in your details below and we'll schedule a personalized demo for you.
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#1E3A8A] dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#1E3A8A] dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] transition-colors"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-[#1E3A8A] dark:text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] transition-colors"
                    placeholder="Your Company Ltd"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#1E3A8A] dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    readOnly={isDemoRequest}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] transition-colors resize-none ${isDemoRequest ? 'bg-gray-50 dark:bg-gray-700 cursor-not-allowed' : ''}`}
                    placeholder="Tell us how we can help..."
                  />
                  {isDemoRequest && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This message is pre-filled for your demo request. You can still edit it if needed.
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className="w-full h-12 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white text-base font-medium rounded-lg shadow-lg shadow-[#1E3A8A]/25 disabled:opacity-70 disabled:cursor-not-allowed"
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
                      {isDemoRequest ? 'Request Demo' : 'Send Message'}
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
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1E3A8A]/20 to-[#C2410C]/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-[#1E3A8A]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#1E3A8A] dark:text-white">Pasbest Ventures Limited</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Parent Company</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#1E3A8A] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#1E3A8A] dark:text-gray-300">Headquarters</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Nairobi, Kenya</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-[#1E3A8A] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#1E3A8A] dark:text-gray-300">Email</p>
                      <a href="mailto:info@sbpgroup.com" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#C2410C] transition-colors">
                        info@sbpgroup.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-[#1E3A8A] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#1E3A8A] dark:text-gray-300">Phone</p>
                      <a href="tel:+254727200002" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#C2410C] transition-colors">
                        +254 727 200002
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="font-semibold text-[#1E3A8A] dark:text-white">SBPMeet</span> is a product of Pasbest Ventures Limited, 
                    dedicated to providing modern scheduling solutions for professionals worldwide.
                  </p>
                  <a 
                    href="https://pasbestventures.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#1E3A8A] hover:text-[#C2410C] transition-colors"
                  >
                    Visit Pasbest Ventures Official Website
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-[#1E3A8A] dark:text-white mb-4">Support Hours</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monday - Friday</span>
                    <span className="text-sm font-medium text-[#1E3A8A] dark:text-white">8:00 AM - 6:00 PM EAT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Saturday</span>
                    <span className="text-sm font-medium text-[#1E3A8A] dark:text-white">9:00 AM - 2:00 PM EAT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sunday</span>
                    <span className="text-sm font-medium text-[#1E3A8A] dark:text-white">Closed</span>
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

      {/* Footer with Waitlist Form */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
            {/* Company Info */}
            <div className="col-span-2 md:col-span-1 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-6 w-6 text-[#1E3A8A]" />
                <span className="text-xl font-semibold bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent">
                  SBPMeet
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs leading-relaxed mb-4">
                Modern scheduling for modern professionals. A product of Pasbest Ventures Limited, 
                based in Nairobi, serving the world.
              </p>
              <div className="flex gap-4 mt-4">
                <a href="https://twitter.com/sbpgroup" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-[#1E3A8A] hover:text-white transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://linkedin.com/company/sbpgroup" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-[#1E3A8A] hover:text-white transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="https://instagram.com/sbpgroup" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-[#1E3A8A] hover:text-white transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-[#1E3A8A] dark:text-white text-sm mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-[#C2410C] transition-colors">Features</a></li>
                <li><a href="#testimonials" className="text-gray-600 dark:text-gray-400 hover:text-[#C2410C] transition-colors">Testimonials</a></li>
                <li><a href="#faq" className="text-gray-600 dark:text-gray-400 hover:text-[#C2410C] transition-colors">FAQ</a></li>
                <li><a href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-[#C2410C] transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-[#1E3A8A] dark:text-white text-sm mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="https://sbpgroup.com/about" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-[#C2410C] transition-colors">About Us</a></li>
                <li><a href="https://sbpgroup.com/careers" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-[#C2410C] transition-colors">Careers</a></li>
                <li><a href="https://sbpgroup.com/blog" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-[#C2410C] transition-colors">Blog</a></li>
              </ul>
            </div>
            
            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-[#1E3A8A] dark:text-white text-sm mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-[#C2410C] transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-[#C2410C] transition-colors">Terms of Service</a></li>
                <li><a href="/security" className="text-gray-600 dark:text-gray-400 hover:text-[#C2410C] transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          {/* Waitlist Form and Parent Company Banner */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Waitlist Form */}
            <div className="bg-gradient-to-r from-[#1E3A8A]/5 via-[#C2410C]/10 to-[#1E3A8A]/5 dark:from-[#1E3A8A]/10 dark:via-[#C2410C]/20 dark:to-[#1E3A8A]/10 rounded-2xl border border-[#1E3A8A]/20 p-6">
              <h3 className="text-lg font-semibold text-[#1E3A8A] dark:text-white mb-2">Join the waitlist</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Be the first to know when we launch our pricing plans.
              </p>
              <form onSubmit={handleWaitlistSubmit} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] transition-colors text-sm"
                />
                <Button 
                  type="submit"
                  disabled={waitlistStatus === 'submitting'}
                  className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white px-6 h-10"
                >
                  {waitlistStatus === 'submitting' ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    'Join'
                  )}
                </Button>
              </form>
            </div>

            {/* Parent Company Banner */}
            <div className="bg-gradient-to-r from-[#1E3A8A]/5 via-[#C2410C]/10 to-[#1E3A8A]/5 dark:from-[#1E3A8A]/10 dark:via-[#C2410C]/20 dark:to-[#1E3A8A]/10 rounded-2xl border border-[#1E3A8A]/20 p-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-[#1E3A8A]" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">A product of</p>
                  <p className="text-lg font-semibold text-[#1E3A8A] dark:text-white">Pasbest Ventures Limited</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">Nairobi, Kenya</span>
                <a 
                  href="https://pasbestventures.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#1E3A8A] hover:text-[#C2410C] transition-colors flex items-center gap-1"
                >
                  Visit parent company
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 md:mb-0">
              © {new Date().getFullYear()} Pasbest Ventures Limited. All rights reserved. 
              SBPMeet is a trademark of Pasbest Ventures Limited.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Shield className="h-3 w-3 text-[#1E3A8A]" />
                GDPR Compliant
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Globe className="h-3 w-3 text-[#C2410C]" />
                Nairobi, Kenya
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}