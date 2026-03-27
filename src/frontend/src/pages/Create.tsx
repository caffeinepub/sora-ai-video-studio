import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@tanstack/react-router";
import { ImagePlus, Loader2, Sparkles, Upload, Wand2, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
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

const THUMB_SEEDS = [
  "/assets/generated/thumb-neon-tokyo.dim_800x450.jpg",
  "/assets/generated/thumb-stellar-odyssey.dim_800x450.jpg",
  "/assets/generated/thumb-dark-frontier.dim_800x450.jpg",
  "/assets/generated/thumb-midnight-echoes.dim_800x450.jpg",
  "/assets/generated/thumb-digital-dreams.dim_800x450.jpg",
  "/assets/generated/thumb-urban-chronicles.dim_800x450.jpg",
];

function randomThumb() {
  return THUMB_SEEDS[Math.floor(Math.random() * THUMB_SEEDS.length)];
}

export default function Create() {
  const { identity } = useInternetIdentity();
  const router = useRouter();
  const { addVideo, deductCredits, getProfile, ensureProfile } = useAppStore();
  const principal = identity?.getPrincipal().toString() || "";

  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle>("Cinematic");
  const [selectedDuration, setSelectedDuration] = useState<
    import("../store/appStore").DurationOption
  >(DURATION_OPTIONS[0]);
  const [selectedCategory, setSelectedCategory] =
    useState<VideoCategory>("Short Films");
  const [title, setTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [_imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (principal) ensureProfile(principal);
  const profile = principal ? getProfile(principal) : null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    if (!profile || profile.credits < selectedDuration.credits) {
      toast.error(
        `Not enough credits. Need ${selectedDuration.credits}, have ${profile?.credits ?? 0}.`,
      );
      return;
    }
    setIsGenerating(true);
    setProgress(0);
    let prog = 0;
    progressRef.current = setInterval(() => {
      prog += Math.random() * 14;
      if (prog >= 90) {
        prog = 90;
        if (progressRef.current) clearInterval(progressRef.current);
      }
      setProgress(Math.min(prog, 90));
    }, 180);
    await new Promise((res) => setTimeout(res, 3000));
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(100);
    const newVideo = {
      id: `vid-${Date.now()}`,
      ownerId: principal,
      prompt: prompt.trim(),
      imageUrl: imagePreview || undefined,
      style: selectedStyle,
      durationSeconds: selectedDuration.value,
      status: "completed" as const,
      createdAt: Date.now(),
      title: title.trim() || prompt.trim().slice(0, 40),
      category: selectedCategory,
      thumbnailUrl: imagePreview || randomThumb(),
    };
    addVideo(newVideo);
    deductCredits(principal, selectedDuration.credits);
    toast.success(
      `🎬 Video created! ${selectedDuration.credits} credits used.`,
    );
    setTimeout(() => {
      setIsGenerating(false);
      router.navigate({ to: "/library" });
    }, 500);
  };

  return (
    <div className="p-5 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-1">
            Create Video
          </h1>
          <p className="text-muted-foreground text-sm">
            Transform your vision into cinematic reality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-5">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="bg-card border border-border w-full mb-5">
                <TabsTrigger
                  value="text"
                  className="flex-1 gap-2"
                  data-ocid="create.text_tab.tab"
                >
                  <Wand2 size={14} />
                  Text to Video
                </TabsTrigger>
                <TabsTrigger
                  value="image"
                  className="flex-1 gap-2"
                  data-ocid="create.image_tab.tab"
                >
                  <ImagePlus size={14} />
                  Image to Video
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text">
                <div className="bg-card border border-border rounded-xl p-5">
                  <Label className="text-sm font-semibold text-foreground mb-2 block">
                    Describe your video
                  </Label>
                  <Textarea
                    placeholder="A lone samurai stands at the edge of a cliff at sunset, wind blowing through their robes, slow cinematic pan across the orange sky..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-background border-border min-h-[140px] text-sm resize-none"
                    data-ocid="create.prompt.input"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      "cyberpunk cityscape",
                      "underwater kingdom",
                      "space opera battle",
                      "forest meditation",
                    ].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setPrompt((p) => (p ? `${p}, ${s}` : s))}
                        className="px-2.5 py-1 bg-accent rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors border border-border"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="image">
                <div className="bg-card border border-border rounded-xl p-5">
                  {imagePreview ? (
                    <div className="relative rounded-lg overflow-hidden mb-3">
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white hover:bg-black transition-colors"
                        data-ocid="create.remove_image.button"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors mb-3"
                      data-ocid="create.image.dropzone"
                    >
                      <Upload size={28} className="text-muted-foreground" />
                      <div className="text-center">
                        <div className="text-sm font-medium text-foreground">
                          Upload Image
                        </div>
                        <div className="text-xs text-muted-foreground">
                          PNG, JPG, WebP up to 10MB
                        </div>
                      </div>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    data-ocid="create.upload_button"
                  />
                  <Label className="text-sm font-semibold text-foreground mb-2 block">
                    Animation prompt
                  </Label>
                  <Textarea
                    placeholder="Describe the motion or transformation you want..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-background border-border min-h-[80px] text-sm resize-none"
                    data-ocid="create.image_prompt.input"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Title */}
            <div className="bg-card border border-border rounded-xl p-5">
              <Label className="text-sm font-semibold text-foreground mb-2 block">
                Video Title (optional)
              </Label>
              <input
                type="text"
                placeholder="Give your video a memorable title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                data-ocid="create.title.input"
              />
            </div>

            {/* Options */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-3 block">
                    Video Style
                  </Label>
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
                        data-ocid={`create.style_${style.toLowerCase().replace(" ", "_")}.toggle`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground mb-3 block">
                    Category
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(v) =>
                      setSelectedCategory(v as VideoCategory)
                    }
                  >
                    <SelectTrigger
                      className="bg-background border-border"
                      data-ocid="create.category.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            {/* Duration & Cost */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-display font-semibold text-foreground text-sm mb-4">
                Video Length
              </div>
              <div className="space-y-2">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    type="button"
                    key={d.value}
                    onClick={() => setSelectedDuration(d)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all border ${
                      selectedDuration.value === d.value
                        ? "border-gold/50 bg-gold/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-border/70"
                    }`}
                    data-ocid={`create.duration_${d.value}s.toggle`}
                  >
                    <span>{d.label}</span>
                    <span
                      className={
                        selectedDuration.value === d.value
                          ? "text-gold font-bold"
                          : "text-muted-foreground"
                      }
                    >
                      {d.credits} cr
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Credits summary */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="font-display font-semibold text-foreground text-sm mb-3">
                Generation Cost
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground text-sm">
                  {selectedDuration.label}
                </span>
                <span className="text-gold font-bold">
                  {selectedDuration.credits} credits
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span>Your balance</span>
                <span
                  className={
                    (profile?.credits ?? 0) >= selectedDuration.credits
                      ? "text-foreground"
                      : "text-destructive"
                  }
                >
                  {profile?.credits ?? 0} credits
                </span>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  !prompt.trim() ||
                  (profile?.credits ?? 0) < selectedDuration.credits
                }
                className="w-full btn-generate text-white font-bold h-11"
                data-ocid="create.generate.button"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Generating {Math.round(progress)}%
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    Generate — {selectedDuration.credits} Credits
                  </>
                )}
              </Button>
              {(profile?.credits ?? 0) < selectedDuration.credits && (
                <p
                  className="text-destructive text-xs mt-2 text-center"
                  data-ocid="create.credits.error_state"
                >
                  Insufficient credits.{" "}
                  <a href="/pricing" className="underline">
                    Upgrade to Pro
                  </a>
                </p>
              )}
            </div>

            {/* Preview thumbnail */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="relative aspect-video film-grain">
                {isGenerating ? (
                  <>
                    <img
                      src="/assets/generated/thumb-neon-tokyo.dim_800x450.jpg"
                      alt=""
                      className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Loader2
                        size={28}
                        className="text-primary animate-spin mb-2"
                      />
                      <div className="text-foreground text-sm font-semibold">
                        Generating your cinematic video...
                      </div>
                      <div className="text-gold font-bold text-xl mt-1">
                        {Math.round(progress)}%
                      </div>
                      <div className="w-32 bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: "oklch(var(--gold))" }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={
                        imagePreview ||
                        "/assets/generated/thumb-neon-tokyo.dim_800x450.jpg"
                      }
                      alt=""
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white/60 text-xs text-center">
                        <Wand2 size={20} className="mx-auto mb-1 opacity-60" />
                        Preview will appear here
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <footer className="border-t border-border pt-6 mt-8 text-center text-xs text-muted-foreground">
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
