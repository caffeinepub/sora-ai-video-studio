import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowRight,
  Film,
  Music,
  Play,
  Sparkles,
  Star,
  Wand2,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const FEATURES = [
  {
    icon: Wand2,
    title: "Text to Video",
    desc: "Describe your vision in words and watch it come alive in stunning cinematic quality.",
  },
  {
    icon: Film,
    title: "Image to Video",
    desc: "Upload any image and animate it into a breathtaking video with AI-powered motion.",
  },
  {
    icon: Music,
    title: "All Styles",
    desc: "From cinematic epics to music videos — choose from 6 professional video styles.",
  },
  {
    icon: Sparkles,
    title: "300 Free Credits",
    desc: "Start creating immediately with 300 free credits on your first login. No card required.",
  },
];

const CATEGORIES = [
  { label: "Web Series", count: "2.4K+" },
  { label: "Movies", count: "1.8K+" },
  { label: "Music Videos", count: "3.1K+" },
  { label: "Short Films", count: "4.2K+" },
];

export default function Landing() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && identity) {
      router.navigate({ to: "/dashboard" });
    }
  }, [identity, isInitializing, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display font-bold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.50 0.23 278), oklch(0.55 0.22 302))",
            }}
          >
            V
          </div>
          <span className="font-display font-bold text-foreground">Vora 2</span>
          <Badge variant="outline" className="text-gold border-gold/40 text-xs">
            AI Studio
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/pricing">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              data-ocid="landing.pricing.link"
            >
              Pricing
            </Button>
          </Link>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="btn-generate text-white font-semibold"
            data-ocid="landing.login.button"
          >
            {isLoggingIn ? "Connecting..." : "Get Started Free"}
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 text-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-cinematic-bg.dim_1600x600.jpg"
            alt="cinematic background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Badge className="mb-6 bg-accent text-gold border-gold/30 text-xs font-medium px-4 py-1.5">
              <Star size={11} className="mr-1.5" />
              Now with 8-minute video generation
            </Badge>
            <h1 className="font-display font-black text-5xl md:text-7xl leading-tight mb-4">
              <span className="text-gold-gradient">VORA 2</span>
              <br />
              <span className="text-foreground">AI Video Generation</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Create cinematic-quality videos from text or images. Professional
              styles, stunning quality, zero experience required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={login}
                disabled={isLoggingIn}
                className="btn-generate text-white font-bold text-base px-8 h-12"
                data-ocid="hero.login.button"
              >
                <Zap size={18} className="mr-2" />
                {isLoggingIn ? "Connecting..." : "Start Creating Free"}
              </Button>
              <Link to="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-muted-foreground h-12 px-8"
                  data-ocid="hero.pricing.button"
                >
                  <Play size={16} className="mr-2" />
                  View Plans
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Category pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-sm"
              >
                <span className="text-foreground font-medium">{cat.label}</span>
                <span className="text-gold text-xs font-bold">{cat.count}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              Everything you need to create{" "}
              <span className="text-gold-gradient">cinematic videos</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Professional-grade AI video generation with studio-quality output.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-xl p-5 hover:border-gold/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-6 md:px-12">
        <motion.div
          className="max-w-3xl mx-auto text-center bg-card border border-border rounded-2xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display font-black text-3xl md:text-4xl text-foreground mb-4">
            Ready to create your first{" "}
            <span className="text-gold-gradient">cinematic video?</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of creators. 300 free credits on signup.
          </p>
          <Button
            size="lg"
            onClick={login}
            disabled={isLoggingIn}
            className="btn-generate text-white font-bold text-base px-10 h-12"
            data-ocid="cta.login.button"
          >
            <Zap size={18} className="mr-2" />
            {isLoggingIn ? "Connecting..." : "Create Your First Video"}
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.50 0.23 278), oklch(0.55 0.22 302))",
                }}
              >
                V
              </div>
              <span className="font-display font-bold text-foreground">
                Vora 2
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Professional AI video generation for creators.
            </p>
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm mb-3">
              Product
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Documentation
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  API
                </span>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm mb-3">
              Company
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  About
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Blog
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Contact
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}. Built with{" "}
          <span className="text-destructive">&#9829;</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
