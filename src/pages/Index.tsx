import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Clock, CreditCard, Users, ArrowRight, Check } from "lucide-react";

const features = [
  { icon: Calendar, title: "Smart Scheduling", description: "Set your availability and let others book time with you. No more back-and-forth emails." },
  { icon: Users, title: "Team Scheduling", description: "Coordinate across your team with shared availability and round-robin event types." },
  { icon: CreditCard, title: "Paid Bookings", description: "Charge for consultations and meetings with integrated Stripe payments." },
  { icon: Clock, title: "Calendar Sync", description: "Connect your Google Calendar to prevent double-bookings automatically." },
];

const pricingPlans = [
  { name: "Free", price: "$0", period: "/mo", features: ["1 event type", "Unlimited bookings", "Email notifications", "Personal booking page"], cta: "Get started" },
  { name: "Pro", price: "$12", period: "/mo", features: ["Unlimited event types", "Team scheduling", "Custom branding", "Calendar integrations", "Priority support"], cta: "Start free trial", popular: true },
  { name: "Team", price: "$25", period: "/mo", features: ["Everything in Pro", "Unlimited team members", "Round-robin routing", "Analytics & reporting", "Admin controls"], cta: "Contact sales" },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-['Space_Grotesk']">Schedulo</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="gap-2">
              <Link to="/signup">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 lg:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl"
        >
          <h1 className="text-5xl lg:text-7xl font-bold font-['Space_Grotesk'] leading-tight mb-6 tracking-tight">
            Scheduling that <span className="text-primary">just works</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Share your link, let people pick a time, and get booked. Simple, powerful, and beautiful scheduling for modern teams.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild className="gap-2 text-base px-8">
              <Link to="/signup">
                Start for free <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container py-24 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold font-['Space_Grotesk'] mb-4">Everything you need</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete scheduling platform built for professionals and teams.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border bg-card p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold font-['Space_Grotesk'] mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container py-24 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold font-['Space_Grotesk'] mb-4">Simple pricing</h2>
          <p className="text-lg text-muted-foreground">Start free, upgrade when you're ready.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`rounded-2xl border p-8 ${plan.popular ? "border-primary shadow-lg shadow-primary/10 relative" : "bg-card"}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold font-['Space_Grotesk'] mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold font-['Space_Grotesk']">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.popular ? "default" : "outline"} className="w-full" asChild>
                <Link to="/signup">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-semibold font-['Space_Grotesk']">Schedulo</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Schedulo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
