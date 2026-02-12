import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Clock, CreditCard, Users, ArrowRight, Check, Zap, Shield, Globe, Star, Smartphone } from "lucide-react";

const features = [
  { icon: Calendar, title: "Smart Scheduling", description: "Set your availability and let others book time with you. No more back-and-forth emails." },
  { icon: Users, title: "Team Scheduling", description: "Coordinate across your team with shared availability and round-robin event types." },
  { icon: CreditCard, title: "Paid Bookings", description: "Charge for consultations with integrated Stripe & M-Pesa payments." },
  { icon: Globe, title: "Calendar Sync", description: "Connect your Google Calendar to prevent double-bookings automatically." },
  { icon: Zap, title: "Instant Notifications", description: "Confirmation and reminder emails sent automatically to you and your guests." },
  { icon: Shield, title: "Timezone Smart", description: "Auto-detects your guest's timezone so everyone shows up on time." },
];

const pricingPlans = [
  { name: "Free", price: "$0", period: "/mo", features: ["1 event type", "Unlimited bookings", "Email notifications", "Personal booking page"], cta: "Get started" },
  { name: "Pro", price: "$12", period: "/mo", features: ["Unlimited event types", "Team scheduling", "Stripe & M-Pesa payments", "Calendar integrations", "Priority support"], cta: "Start free trial", popular: true },
  { name: "Team", price: "$25", period: "/mo", features: ["Everything in Pro", "Unlimited team members", "Round-robin routing", "Analytics & reporting", "Admin controls"], cta: "Contact sales" },
];

const stats = [
  { value: "10K+", label: "Bookings made" },
  { value: "2K+", label: "Happy users" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9★", label: "User rating" },
];

const testimonials = [
  { name: "Sarah M.", role: "Consultant", text: "Schedulo cut my scheduling time by 90%. Clients just pick a slot and we're done." },
  { name: "James K.", role: "Therapist", text: "The M-Pesa integration is a game changer for my practice in Nairobi." },
  { name: "Priya D.", role: "Startup Founder", text: "Clean, fast, and my team loves the round-robin feature. Highly recommend." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

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
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          </nav>
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
      <section className="relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-accent/8 blur-3xl" />
        </div>

        <div className="container py-28 lg:py-40 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground mb-8"
            >
              <Zap className="h-3.5 w-3.5 text-primary" />
              Now with M-Pesa & Stripe payments
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold font-['Space_Grotesk'] leading-[1.05] mb-6 tracking-tight">
              Scheduling that
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">just works</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Share your link, let people pick a time, and get booked. Simple, powerful, and beautiful scheduling for modern professionals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="gap-2 text-base px-8 h-12">
                <Link to="/signup">
                  Start for free <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 h-12">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </motion.div>

          {/* Hero mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 mx-auto max-w-3xl"
          >
            <div className="rounded-2xl border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
              <div className="flex items-center gap-1.5 border-b px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-accent/60" />
                <div className="h-3 w-3 rounded-full bg-primary/40" />
                <span className="ml-3 text-xs text-muted-foreground">schedulo.app/your-name</span>
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">JD</div>
                      <div>
                        <p className="text-sm font-semibold">Jane Doe</p>
                        <p className="text-xs text-muted-foreground">Product Consultant</p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      {["30-min Strategy Call", "60-min Deep Dive", "15-min Quick Chat"].map((t, i) => (
                        <div key={t} className="flex items-center gap-2 rounded-lg border p-3 text-sm hover:border-primary/40 transition-colors">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ["#7C3AED", "#0d9488", "#f59e0b"][i] }} />
                          <span className="font-medium">{t}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{[30, 60, 15][i]} min</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="hidden sm:block w-px bg-border" />
                  <div className="flex-1 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">February 2026</p>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                        <span key={i} className="text-muted-foreground py-1">{d}</span>
                      ))}
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                        <span
                          key={d}
                          className={`py-1 rounded ${d === 12 ? "bg-primary text-primary-foreground font-bold" : d % 7 === 0 || d % 7 === 6 ? "text-muted-foreground/40" : "hover:bg-muted cursor-pointer"}`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    <div className="space-y-1.5 pt-2">
                      {["9:00 AM", "10:30 AM", "1:00 PM", "3:30 PM"].map((t) => (
                        <div key={t} className="rounded border px-3 py-1.5 text-xs text-center hover:border-primary/40 cursor-pointer transition-colors">
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y bg-muted/30">
        <div className="container py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="text-center"
              >
                <p className="text-3xl font-bold font-['Space_Grotesk'] text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold font-['Space_Grotesk'] mb-4">Everything you need</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete scheduling platform built for professionals and teams.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="group rounded-2xl border bg-card p-6 hover:shadow-lg hover:shadow-primary/5 transition-shadow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold font-['Space_Grotesk'] mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/20">
        <div className="container py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold font-['Space_Grotesk'] mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">Three steps to effortless scheduling.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Set your availability", desc: "Define when you're free. Weekly hours, date overrides, buffer times — all customizable." },
              { step: "2", title: "Share your link", desc: "Send your unique booking page to clients, colleagues, or embed it on your website." },
              { step: "3", title: "Get booked", desc: "Guests pick a time, fill their info, and you both get confirmed instantly." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-bold font-['Space_Grotesk']">
                  {item.step}
                </div>
                <h3 className="font-semibold font-['Space_Grotesk'] text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold font-['Space_Grotesk'] mb-4">Loved by professionals</h2>
          <p className="text-lg text-muted-foreground">See what our users have to say.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="rounded-2xl border bg-card p-6"
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t bg-muted/20">
        <div className="container py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold font-['Space_Grotesk'] mb-4">Simple pricing</h2>
            <p className="text-lg text-muted-foreground">Start free, upgrade when you're ready.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className={`rounded-2xl border p-8 bg-card ${plan.popular ? "border-primary shadow-lg shadow-primary/10 relative scale-105" : ""}`}
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
                      <Check className="h-4 w-4 text-accent shrink-0" />
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
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t">
        <div className="container py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl"
          >
            <h2 className="text-3xl lg:text-5xl font-bold font-['Space_Grotesk'] mb-4">
              Ready to simplify your scheduling?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of professionals who save hours every week with Schedulo.
            </p>
            <Button size="lg" asChild className="gap-2 text-base px-10 h-12">
              <Link to="/signup">
                Get started for free <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container">
          <div className="grid gap-8 sm:grid-cols-4 mb-8">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold font-['Space_Grotesk']">Schedulo</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Modern scheduling for modern professionals. Set your availability, share your link, and get booked.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-foreground transition-colors">Sign in</Link></li>
                <li><Link to="/signup" className="hover:text-foreground transition-colors">Create account</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground">© 2026 Schedulo. All rights reserved.</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Privacy</span>
              <span>Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
