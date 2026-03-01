import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle, 
  FileText, 
  HelpCircle,
  Mail,
  ExternalLink,
  ChevronRight,
  Calendar,
  Users,
  Clock,
  CreditCard,
  Settings,
  Shield,
  Zap,
  Globe,
  Download,
  Phone,
  LifeBuoy
} from "lucide-react";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      title: "Getting Started",
      icon: <BookOpen className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
      articles: [
        "Create your account",
        "Set up your availability",
        "Create your first event type",
        "Share your booking link",
        "Connect your calendar"
      ]
    },
    {
      title: "Bookings & Scheduling",
      icon: <Calendar className="h-5 w-5" />,
      color: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
      articles: [
        "How bookings work",
        "Manage your bookings",
        "Cancellation policy",
        "Reschedule meetings",
        "Booking notifications"
      ]
    },
    {
      title: "Team Management",
      icon: <Users className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
      articles: [
        "Add team members",
        "Team roles & permissions",
        "Create departments",
        "Team availability",
        "Round-robin events"
      ]
    },
    {
      title: "Payments & Billing",
      icon: <CreditCard className="h-5 w-5" />,
      color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400",
      articles: [
        "M-Pesa integration",
        "Stripe setup",
        "Payment processing",
        "Invoices & receipts",
        "Subscription plans"
      ]
    },
    {
      title: "Integrations",
      icon: <Globe className="h-5 w-5" />,
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
      articles: [
        "Google Calendar",
        "Microsoft Outlook",
        "Zoom integration",
        "Google Meet",
        "Microsoft Teams"
      ]
    },
    {
      title: "Account & Settings",
      icon: <Settings className="h-5 w-5" />,
      color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      articles: [
        "Profile settings",
        "Change password",
        "Notification preferences",
        "Timezone settings",
        "Delete account"
      ]
    }
  ];

  const popularArticles = [
    { title: "How to set up M-Pesa payments", views: "2.5k views", icon: <CreditCard className="h-4 w-4" /> },
    { title: "Connect Google Calendar", views: "2.1k views", icon: <Calendar className="h-4 w-4" /> },
    { title: "Add team members to your organization", views: "1.8k views", icon: <Users className="h-4 w-4" /> },
    { title: "Create your first event type", views: "1.6k views", icon: <Zap className="h-4 w-4" /> },
    { title: "Understanding team roles", views: "1.4k views", icon: <Shield className="h-4 w-4" /> }
  ];

  const faqs = [
    {
      question: "How do I get started with SBPMeet?",
      answer: "Sign up for a free account, set your availability, create your first event type, and share your booking link."
    },
    {
      question: "Can I accept payments through SBPMeet?",
      answer: "Yes! We integrate with M-Pesa and Stripe for seamless payment processing.For now the services are free of Charge."
    },
    {
      question: "How do I add team members?",
      answer: "Go to Team > Members and click 'Invite members'. You can assign different roles and permissions."
    },
    {
      question: "What calendar integrations are supported?",
      answer: "We support Google Calendar.Later,we will focus on  Microsoft Outlook, and Apple Calendar with two-way sync."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A]/95 to-[#C2410C]/80 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                <LifeBuoy className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold">Help Center</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              How can we help you?
            </h1>
            
            <p className="text-lg text-white/80 mb-8">
              Search our guides, FAQs, and resources to get the most out of SBPMeet
            </p>
            
            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for help articles..."
                className="pl-10 h-12 bg-white text-gray-900 border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Popular Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularArticles.map((article, index) => (
              <Link
                key={index}
                to="#"
                className="group p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                      {article.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-[#1E3A8A] dark:group-hover:text-[#C2410C]">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{article.views}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#1E3A8A] dark:group-hover:text-[#C2410C]" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Categories */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    {category.icon}
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.articles.map((article, idx) => (
                    <li key={idx}>
                      <Link
                        to="#"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-[#C2410C] flex items-center gap-2"
                      >
                        <FileText className="h-3 w-3" />
                        {article}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-[#C2410C]" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <Card className="bg-gradient-to-br from-[#1E3A8A]/5 via-white to-[#C2410C]/5 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border-0">
          <CardContent className="py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-[#1E3A8A]/10 rounded-full">
                <MessageCircle className="h-8 w-8 text-[#1E3A8A] dark:text-[#C2410C]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Still need help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
                <Mail className="mr-2 h-4 w-4" />
                Email Support
              </Button>
              <Button variant="outline" className="border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white dark:border-[#C2410C] dark:text-[#C2410C] dark:hover:bg-[#C2410C]">
                <MessageCircle className="mr-2 h-4 w-4" />
                Live Chat
              </Button>
            </div>
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-500">
              <p>📞 Or call us: +254 795 751 700</p>
              <p className="mt-1">📧 support@pasbestventures.com</p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="https://drive.google.com/file/d/1wJ6Gqwa8QyDLwn7Atr8laMsqi57bzBPm/view?usp=sharing" className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <Video className="h-6 w-6 text-[#1E3A8A] dark:text-[#C2410C] mb-2" />
            <h3 className="font-semibold mb-1">Video Tutorials</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Watch step-by-step guides</p>
          </Link>
          <Link to="/docs" className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <Download className="h-6 w-6 text-[#1E3A8A] dark:text-[#C2410C] mb-2" />
            <h3 className="font-semibold mb-1">API Documentation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Build with our API</p>
          </Link>
          <Link to="#" className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <Phone className="h-6 w-6 text-[#1E3A8A] dark:text-[#C2410C] mb-2" />
            <h3 className="font-semibold mb-1">Community Forum</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Connect with other users</p>
          </Link>
        </div>
      </div>
    </div>
  );
}