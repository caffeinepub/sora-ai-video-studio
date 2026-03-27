import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Clock, Download, Film, Play, Search, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  DURATION_OPTIONS,
  VIDEO_CATEGORIES,
  type VideoCategory,
  useAppStore,
} from "../store/appStore";

const ALL_CATEGORIES = ["All", ...VIDEO_CATEGORIES] as const;
type CategoryFilter = (typeof ALL_CATEGORIES)[number];

export default function Library() {
  const { identity } = useInternetIdentity();
  const { videos, deleteVideo } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const filtered = videos.filter((v) => {
    const matchCat = activeCategory === "All" || v.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleDelete = (id: string, title: string) => {
    deleteVideo(id);
    toast.success(`"${title}" removed from library`);
  };

  return (
    <div className="p-5 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-1">
              Video Library
            </h1>
            <p className="text-muted-foreground text-sm">
              {videos.length} videos in your collection
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-48"
                data-ocid="library.search_input"
              />
            </div>
            <Link to="/create">
              <Button
                className="btn-generate text-white font-semibold"
                size="sm"
                data-ocid="library.create.button"
              >
                + New Video
              </Button>
            </Link>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6" role="tablist">
          {ALL_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setActiveCategory(cat)}
              role="tab"
              data-ocid={`library.${cat.toLowerCase().replace(" ", "_").replace("/", "")}.tab`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeCategory === cat
                  ? "bg-gold/15 border-gold/40 text-gold"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
              data-ocid="library.empty_state"
            >
              <Film
                size={48}
                className="text-muted-foreground mb-4 opacity-50"
              />
              <div className="font-display font-semibold text-foreground text-lg mb-2">
                No videos found
              </div>
              <div className="text-muted-foreground text-sm mb-5">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : `No ${activeCategory === "All" ? "" : activeCategory} videos yet`}
              </div>
              <Link to="/create">
                <Button
                  className="btn-generate text-white"
                  data-ocid="library.create_first.button"
                >
                  Create Your First Video
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filtered.map((video, i) => {
                const duration = DURATION_OPTIONS.find(
                  (d) => d.value === video.durationSeconds,
                );
                identity?.getPrincipal().toString() === video.ownerId;
                return (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="video-card group"
                    data-ocid={`library.item.${i + 1}`}
                  >
                    <div className="relative aspect-video overflow-hidden film-grain">
                      {!loadedImages.has(video.id) && (
                        <Skeleton className="absolute inset-0 w-full h-full" />
                      )}
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        onLoad={() =>
                          setLoadedImages((s) => new Set([...s, video.id]))
                        }
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ opacity: loadedImages.has(video.id) ? 1 : 0 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                          <Play size={20} className="text-white ml-0.5" />
                        </div>
                      </div>
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
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-semibold text-foreground text-sm mb-1 truncate">
                        {video.title}
                      </h3>
                      <p className="text-muted-foreground text-xs truncate mb-3">
                        {video.prompt}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="text-xs border-border text-muted-foreground"
                        >
                          {video.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => toast.info("Download started!")}
                            data-ocid={`library.download.${i + 1}`}
                          >
                            <Download size={12} className="mr-1" />
                            Download
                          </Button>
                          {!video.isSample && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                              onClick={() =>
                                handleDelete(video.id, video.title)
                              }
                              data-ocid={`library.delete_button.${i + 1}`}
                            >
                              <Trash2 size={12} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <footer className="border-t border-border pt-6 mt-10 text-center text-xs text-muted-foreground">
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
