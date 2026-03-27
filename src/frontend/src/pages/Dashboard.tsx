import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Film,
  Sparkles,
  Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  DURATION_OPTIONS,
  VIDEO_CATEGORIES,
  VIDEO_STYLES,
  type VideoCategory,
  type VideoStyle,
  useAppStore,
} from "../store/appStore";

function VideoCard({
  video,
  index,
}: { video: import("../store/appStore").VideoJob; index: number }) {
  const duration = DURATION_OPTIONS.find(
    (d) => d.value === video.durationSeconds,
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="video-card group cursor-pointer"
      data-ocid={`creations.item.${index + 1}`}
    >
      <div className="relative aspect-video overflow-hidden film-grain">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {duration && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-black/60 text-white border-white/20 text-xs">
              <Clock size={10} className="mr-1" />
              {duration.label}
            </Badge>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge
            className="bg-black/60 text-xs"
            style={{ color: "oklch(var(--gold))" }}
          >
            {video.style}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            className="w-full h-7 text-xs"
            data-ocid={`creations.download.${index + 1}`}
          >
            <Download size={12} className="mr-1" />
            Download
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground text-sm mb-1 truncate">
          {video.title}
        </h3>
        <p className="text-muted-foreground text-xs truncate mb-2">
          {video.prompt}
        </p>
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="text-xs border-border text-muted-foreground"
          >
            {video.category}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(video.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const router = useRouter();
  const principal = identity?.getPrincipal().toString() || "";
  const { videos, ensureProfile, getProfile } = useAppStore();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle>("Cinematic");
  const [selectedDuration, setSelectedDuration] = useState<
    import("../store/appStore").DurationOption
  >(DURATION_OPTIONS[0]);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!principal) return;
    const isNew = ensureProfile(principal);
    if (isNew) {
      setShowWelcome(true);
      toast.success("🎬 Welcome! 300 free credits added to your account.", {
        duration: 6000,
      });
      setTimeout(() => setShowWelcome(false), 8000);
    }
  }, [principal, ensureProfile]);

  const profile = principal ? getProfile(principal) : null;
  const recentVideos = videos.slice(0, 6);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    if (!profile || profile.credits < selectedDuration.credits) {
      toast.error(
        `Insufficient credits. Need ${selectedDuration.credits} credits.`,
      );
      return;
    }
    setIsGenerating(true);
    setProgress(0);
    let prog = 0;
    progressRef.current = setInterval(() => {
      prog += Math.random() * 12;
      if (prog >= 95) {
        prog = 95;
        if (progressRef.current) clearInterval(progressRef.current);
      }
      setProgress(Math.min(prog, 95));
    }, 200);
    setTimeout(() => {
      if (progressRef.current) clearInterval(progressRef.current);
      setProgress(100);
      setTimeout(() => {
        setIsGenerating(false);
        router.navigate({ to: "/create" });
      }, 500);
    }, 3000);
  };

  return (
    <div className="p-5 md:p-8 space-y-8">
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-primary/10 border border-primary/30 rounded-xl px-5 py-4 flex items-center gap-3"
          >
            <Sparkles size={20} style={{ color: "oklch(var(--gold))" }} />
            <div>
              <div className="font-semibold text-foreground text-sm">
                Welcome to Sora 2 CINE AI! 🎬
              </div>
              <div className="text-muted-foreground text-xs">
                300 free credits have been added to your account. Start
                creating!
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowWelcome(false)}
              className="ml-auto text-muted-foreground hover:text-foreground text-lg leading-none"
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <div
        className="relative rounded-2xl overflow-hidden film-grain"
        style={{ minHeight: 200 }}
      >
        <img
          src="/assets/generated/hero-cinematic-bg.dim_1600x600.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="relative z-10 p-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2">
              AI Video Studio
            </p>
            <h1 className="font-display font-black text-3xl md:text-5xl mb-3">
              <span className="text-gold-gradient">SORA 2: CINE AI</span>
              <br />
              <span className="text-foreground">AI Video Generation</span>
            </h1>
            <p className="text-muted-foreground max-w-md text-sm">
              Create cinematic-quality videos from text or images. Professional
              output, instant results.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Generator + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Prompt card */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 size={16} style={{ color: "oklch(var(--gold))" }} />
            <h2 className="font-display font-semibold text-foreground text-sm">
              Text-to-Video Prompt
            </h2>
          </div>
          <Textarea
            placeholder="Describe your cinematic vision... e.g. 'A lone astronaut walks across a barren red planet, golden sunset on the horizon, cinematic wide shot'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-background border-border min-h-[100px] text-sm resize-none mb-4"
            data-ocid="dashboard.prompt.input"
          />
          <div className="mb-4">
            <div className="text-xs text-muted-foreground mb-2">
              Duration —{" "}
              <span className="text-gold">
                {selectedDuration.credits} credits
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((d) => (
                <button
                  type="button"
                  key={d.value}
                  onClick={() => setSelectedDuration(d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    selectedDuration.value === d.value
                      ? "border-gold/50 text-gold bg-gold/10"
                      : "border-border text-muted-foreground hover:border-border/70"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-5">
            <div className="text-xs text-muted-foreground mb-2">
              Video Style
            </div>
            <div className="flex flex-wrap gap-2">
              {VIDEO_STYLES.map((style) => (
                <button
                  type="button"
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    selectedStyle === style
                      ? "border-gold/50 text-gold bg-gold/10"
                      : "border-border text-muted-foreground hover:border-border/70"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full btn-generate text-white font-bold h-11"
            data-ocid="dashboard.generate.button"
          >
            {isGenerating
              ? `Generating... ${Math.round(progress)}%`
              : `Generate Video — ${selectedDuration.credits} Credits`}
          </Button>
        </div>

        {/* Preview card */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-display font-semibold text-foreground text-sm mb-4">
            Video Preview
          </h2>
          <div className="relative aspect-video bg-background rounded-lg overflow-hidden film-grain mb-3">
            <img
              src="/assets/generated/thumb-neon-tokyo.dim_800x450.jpg"
              alt="preview"
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isGenerating ? (
                <motion.div
                  className="text-center px-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-white font-display font-bold text-xl mb-2">
                    Generating...
                  </div>
                  <div className="text-gold font-bold text-3xl mb-3">
                    {Math.round(progress)}%
                  </div>
                  <div className="w-48 bg-white/20 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, oklch(0.50 0.23 278), oklch(0.76 0.09 72))",
                      }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-white/60 text-xs mt-2">
                    Creating your cinematic video
                  </div>
                </motion.div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-2 mx-auto">
                    <Wand2 size={20} className="text-white" />
                  </div>
                  <div className="text-white/80 text-sm font-medium">
                    Your video will appear here
                  </div>
                  <div className="text-white/50 text-xs mt-1">
                    Enter a prompt and click Generate
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {[
              "/assets/generated/thumb-stellar-odyssey.dim_800x450.jpg",
              "/assets/generated/thumb-midnight-echoes.dim_800x450.jpg",
              "/assets/generated/thumb-urban-chronicles.dim_800x450.jpg",
            ].map((src) => (
              <div
                key={src}
                className="flex-1 aspect-video rounded-md overflow-hidden border border-border"
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Creations */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-foreground">
            Recent Creations
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <Link to="/library">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground text-xs"
                data-ocid="dashboard.viewall.link"
              >
                View All <ChevronRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentVideos.map((v, i) => (
            <VideoCard key={v.id} video={v} index={i} />
          ))}
          {recentVideos.length === 0 && (
            <div
              className="col-span-3 flex flex-col items-center justify-center py-16 text-center"
              data-ocid="creations.empty_state"
            >
              <Film size={40} className="text-muted-foreground mb-4" />
              <div className="text-foreground font-semibold mb-1">
                No videos yet
              </div>
              <div className="text-muted-foreground text-sm">
                Create your first cinematic video!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
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
