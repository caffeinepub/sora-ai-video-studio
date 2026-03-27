import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Check, Crown, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started with AI video creation.",
    credits: "300 credits/month",
    icon: Zap,
    badge: null,
    features: [
      "300 credits per month",
      "720p video output",
      "Watermarked videos",
      "Text to Video",
      "3 video styles",
      "Community support",
    ],
    highlighted: false,
    cta: "Get Started Free",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious creators who need professional output.",
    credits: "5,000 credits/month",
    icon: Crown,
    badge: "Most Popular",
    features: [
      "5,000 credits per month",
      "4K video output",
      "No watermarks",
      "Text & Image to Video",
      "All 6 video styles",
      "Priority generation queue",
      "Commercial license",
      "Priority support",
    ],
    highlighted: true,
    cta: "Upgrade to Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: " pricing",
    description: "For studios and teams needing unlimited power.",
    credits: "Unlimited credits",
    icon: Building2,
    badge: null,
    features: [
      "Unlimited credits",
      "Custom resolution output",
      "No watermarks",
      "All video styles + Custom",
      "Priority generation queue",
      "Dedicated GPU allocation",
      "White-label options",
      "24/7 dedicated support",
      "SLA guarantee",
    ],
    highlighted: false,
    cta: "Contact Sales",
  },
];

export default function Pricing() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 md:px-12 h-14 flex items-center">
        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground gap-2"
            data-ocid="pricing.back.button"
          >
            <ArrowLeft size={14} />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-2 mx-auto">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.50 0.23 278), oklch(0.55 0.22 302))",
            }}
          >
            V
          </div>
          <span className="font-display font-bold text-foreground">Vora 2</span>
        </div>
      </div>

      <div className="px-6 md:px-12 py-16">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge className="mb-4 bg-accent text-gold border-gold/30 text-xs px-4 py-1.5">
            <Crown size={11} className="mr-1.5" />
            Pricing Plans
          </Badge>
          <h1 className="font-display font-black text-4xl md:text-5xl text-foreground mb-4">
            Choose your{" "}
            <span className="text-gold-gradient">creative plan</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Start free, scale as you create. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-card rounded-2xl p-7 flex flex-col border ${
                  plan.highlighted
                    ? "border-gold/50 shadow-glow-gold"
                    : "border-border"
                }`}
                data-ocid={`pricing.${plan.id}.card`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gold text-black font-bold text-xs px-3 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                {plan.highlighted && (
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at top, oklch(0.76 0.09 72 / 0.05), transparent 70%)",
                    }}
                  />
                )}

                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
                    plan.highlighted ? "bg-gold/15" : "bg-accent"
                  }`}
                >
                  <Icon
                    size={22}
                    className={plan.highlighted ? "text-gold" : "text-primary"}
                  />
                </div>

                <div className="mb-1">
                  <span className="font-display font-black text-3xl text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {plan.period}
                  </span>
                </div>
                <div className="font-display font-bold text-lg text-foreground mb-1">
                  {plan.name}
                </div>
                <div
                  className="text-xs font-medium mb-3"
                  style={{
                    color: plan.highlighted
                      ? "oklch(var(--gold))"
                      : "oklch(var(--muted-foreground))",
                  }}
                >
                  {plan.credits}
                </div>
                <p className="text-muted-foreground text-sm mb-6 flex-1 min-h-10">
                  {plan.description}
                </p>

                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check
                        size={15}
                        className={`flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? "text-gold" : "text-primary"
                        }`}
                      />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === "enterprise" ? (
                  <Button
                    variant="outline"
                    className="w-full border-border"
                    data-ocid={`pricing.${plan.id}.button`}
                  >
                    {plan.cta}
                  </Button>
                ) : (
                  <Button
                    onClick={() => login()}
                    disabled={isLoggingIn}
                    className={`w-full font-semibold ${
                      plan.highlighted
                        ? "btn-generate text-white"
                        : "bg-secondary hover:bg-accent text-foreground border border-border"
                    }`}
                    data-ocid={`pricing.${plan.id}.button`}
                  >
                    {plan.id === "free" ? (
                      plan.cta
                    ) : (
                      <>
                        <Zap size={14} className="mr-1.5" />
                        {plan.cta}
                      </>
                    )}
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* FAQ hint */}
        <motion.div
          className="text-center mt-14 text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          All plans include access to the dashboard, video library, and download
          features.
          <br />
          Credits reset monthly. Unused credits do not roll over.
        </motion.div>
      </div>

      <footer className="border-t border-border py-8 px-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()}. Built with &#9829; using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
