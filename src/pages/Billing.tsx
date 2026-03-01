"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  Shield,
  Users,
  Clock,
  Download,
  Mail,
  Phone,
  Globe,
  Lock,
  Sparkles,
  TrendingUp,
  BarChart3,
  CalendarDays,
  Video,
  Link2,
  FileText,
  HelpCircle,
  ArrowRight,
  Check,
  Star,
  Gem,
  Rocket,
  Award,
  Gift,
  Percent,
  RefreshCw,
  Settings,
  Bell,
  MapPin,
  Building2,
  Briefcase,
  Heart,
  ThumbsUp,
  MessageCircle,
  Headphones,
  BookOpen,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Facebook,
  PlusCircle
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Types for billing data
interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  highlighted?: boolean;
  icon: React.ElementType;
  color: string;
  badge?: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  description: string;
}

interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "bank";
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

export default function Billing() {
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");

  // Mock data for demonstration
  const currentPlan: PricingPlan = {
    id: "pro",
    name: "Pro",
    description: "For growing teams",
    price: 29,
    interval: "month",
    features: [
      "Unlimited events",
      "Team members (up to 10)",
      "Advanced analytics",
      "Custom branding",
      "API access",
      "Priority support"
    ],
    icon: Rocket,
    color: "blue"
  };

  const invoices: Invoice[] = [
    {
      id: "INV-001",
      date: "2024-02-01",
      amount: 29.00,
      status: "paid",
      description: "Pro Plan - February 2024"
    },
    {
      id: "INV-002",
      date: "2024-01-01",
      amount: 29.00,
      status: "paid",
      description: "Pro Plan - January 2024"
    },
    {
      id: "INV-003",
      date: "2023-12-01",
      amount: 29.00,
      status: "paid",
      description: "Pro Plan - December 2023"
    }
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: "pm_1",
      type: "card",
      brand: "visa",
      last4: "4242",
      expMonth: 12,
      expYear: 2025,
      isDefault: true
    },
    {
      id: "pm_2",
      type: "paypal",
      isDefault: false
    }
  ];

  const plans: PricingPlan[] = [
    {
      id: "free",
      name: "Free",
      description: "Perfect for getting started",
      price: 0,
      interval: "month",
      features: [
        "Up to 5 events per month",
        "Basic analytics",
        "Email support",
        "Single user",
        "Standard branding",
        "Basic integrations"
      ],
      icon: Gift,
      color: "gray"
    },
    {
      id: "pro",
      name: "Pro",
      description: "For growing teams",
      price: 29,
      interval: "month",
      features: [
        "Unlimited events",
        "Team members (up to 10)",
        "Advanced analytics",
        "Custom branding",
        "API access",
        "Priority support",
        "Advanced integrations",
        "Custom fields",
        "Automated workflows"
      ],
      highlighted: true,
      icon: Rocket,
      color: "blue",
      badge: "Most Popular"
    },
    {
      id: "business",
      name: "Business",
      description: "For large organizations",
      price: 99,
      interval: "month",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "Enterprise analytics",
        "SSO & advanced security",
        "Dedicated account manager",
        "SLA guarantee",
        "Custom contract",
        "Volume discounts",
        "On-premise option"
      ],
      icon: Building2,
      color: "purple",
      badge: "Enterprise"
    }
  ];

  const yearlyPlans = plans.map(plan => ({
    ...plan,
    price: plan.price === 0 ? 0 : Math.round(plan.price * 10 * 0.8), // 20% discount for yearly
    interval: "year" as const
  }));

  const displayedPlans = billingInterval === "month" ? plans : yearlyPlans;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Sparkles className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            We're building a powerful billing system to help you manage your subscription and payments
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/settings")}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Coming Soon Alert */}
      <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-800 font-semibold">Billing Features Coming Soon!</AlertTitle>
        <AlertDescription className="text-blue-700">
          We're working hard to bring you a comprehensive billing system. Here's a preview of what's coming.
        </AlertDescription>
      </Alert>

      {/* Current Plan Preview */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Rocket className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Current Plan Preview</CardTitle>
                <CardDescription>
                  Your plan will be managed here
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold">Pro Plan</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Billed monthly · Cancel anytime
              </p>
              <div className="mt-4 space-y-2">
                {plans.find(p => p.id === "pro")?.features.slice(0, 5).map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
                <Button variant="link" className="px-0 text-blue-600">
                  View all features <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Next billing date</p>
                    <p className="text-2xl font-bold">March 1, 2024</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Payment method</p>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-blue-50/50 border-t">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-blue-700">
              <Zap className="h-4 w-4 inline mr-1" />
              Your subscription is active and managed securely
            </p>
            <Button variant="ghost" size="sm" className="text-blue-700" disabled>
              Manage Subscription
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Pricing Plans Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Available Plans</h2>
          <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={billingInterval === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingInterval("month")}
              className="relative"
            >
              Monthly
            </Button>
            <Button
              variant={billingInterval === "year" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingInterval("year")}
              className="relative"
            >
              Yearly
              {billingInterval === "year" && (
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-[10px] px-1 py-0">
                  -20%
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {displayedPlans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.id} 
                className={`relative hover:shadow-lg transition-shadow ${
                  plan.highlighted ? 'border-2 border-blue-200 shadow-md' : ''
                }`}
              >
                {plan.badge && (
                  <Badge 
                    className={`absolute -top-2 left-4 ${
                      plan.id === 'pro' 
                        ? 'bg-blue-500' 
                        : 'bg-purple-500'
                    }`}
                  >
                    {plan.badge}
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className={`p-2 bg-${plan.color}-100 rounded-lg`}>
                      <Icon className={`h-5 w-5 text-${plan.color}-600`} />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-3xl font-bold">
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground ml-1">
                        /{plan.interval}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-sm text-muted-foreground">
                        +{plan.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.id === selectedPlan ? "default" : "outline"}
                    onClick={() => setSelectedPlan(plan.id)}
                    disabled
                  >
                    {plan.price === 0 ? 'Get Started' : 'Choose Plan'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>
            Compare what's included in each plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Feature</TableHead>
                <TableHead>Free</TableHead>
                <TableHead>Pro</TableHead>
                <TableHead>Business</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Events per month</TableCell>
                <TableCell>5</TableCell>
                <TableCell>Unlimited</TableCell>
                <TableCell>Unlimited</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Team members</TableCell>
                <TableCell>1</TableCell>
                <TableCell>Up to 10</TableCell>
                <TableCell>Unlimited</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Analytics</TableCell>
                <TableCell>Basic</TableCell>
                <TableCell>Advanced</TableCell>
                <TableCell>Enterprise</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Custom branding</TableCell>
                <TableCell>
                  <XCircle className="h-4 w-4 text-red-500" />
                </TableCell>
                <TableCell>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </TableCell>
                <TableCell>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">API access</TableCell>
                <TableCell>
                  <XCircle className="h-4 w-4 text-red-500" />
                </TableCell>
                <TableCell>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </TableCell>
                <TableCell>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Priority support</TableCell>
                <TableCell>
                  <XCircle className="h-4 w-4 text-red-500" />
                </TableCell>
                <TableCell>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </TableCell>
                <TableCell>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">SSO & advanced security</TableCell>
                <TableCell>
                  <XCircle className="h-4 w-4 text-red-500" />
                </TableCell>
                <TableCell>
                  <XCircle className="h-4 w-4 text-red-500" />
                </TableCell>
                <TableCell>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice History Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>
                View your past invoices and payment history
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={invoice.status === "paid" ? "default" : "secondary"}
                      className={invoice.status === "paid" ? "bg-green-100 text-green-700 hover:bg-green-200 border-0" : ""}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <Lock className="h-3 w-3 inline mr-1" />
            Invoices are securely stored and can be downloaded anytime
          </p>
        </CardFooter>
      </Card>

      {/* Payment Methods Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods for subscriptions
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" disabled>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-full">
                    {method.type === "card" ? (
                      <CreditCard className="h-5 w-5" />
                    ) : (
                      <DollarSign className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    {method.type === "card" ? (
                      <>
                        <p className="font-medium">
                          {method.brand} •••• {method.last4}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires {method.expMonth}/{method.expYear}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">PayPal</p>
                        <p className="text-sm text-muted-foreground">
                          Connected account
                        </p>
                      </>
                    )}
                  </div>
                  {method.isDefault && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Default
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" disabled>
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Everything you need to know about billing and subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                How does billing work?
              </h3>
              <p className="text-sm text-muted-foreground">
                Billing is processed monthly or annually depending on your plan choice. 
                You can cancel anytime, and you'll continue to have access until the end 
                of your billing period.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                Can I change plans?
              </h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be 
                prorated and reflected in your next invoice.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Percent className="h-4 w-4 text-blue-600" />
                Are there discounts?
              </h3>
              <p className="text-sm text-muted-foreground">
                We offer a 20% discount on annual plans. Non-profit and educational 
                discounts are also available upon request.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Is my payment info secure?
              </h3>
              <p className="text-sm text-muted-foreground">
                Yes, all payment information is encrypted and processed through 
                PCI-compliant payment processors. We never store your full card details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-bold">Questions about billing?</h3>
              <p className="text-blue-100">
                Our team is here to help you choose the right plan
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50" disabled>
                <Mail className="h-4 w-4 mr-2" />
                Contact Sales
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-blue-700" disabled>
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          <Lock className="h-3 w-3 inline mr-1" />
          Secure billing powered by Stripe · 
          <Button variant="link" className="text-xs h-auto p-0 mx-1" disabled>
            Terms of Service
          </Button>
          ·
          <Button variant="link" className="text-xs h-auto p-0 mx-1" disabled>
            Privacy Policy
          </Button>
        </p>
      </div>
    </div>
  );
}